/* TETRA VITALS — 대원 HP/SP 실시간 모니터
   설정(API 주소, 갱신 주기, 위험 기준 등)은 ../assets/config.js 의 TETRA_CONFIG.VITALS
   시계 · 눈보라는 ../assets/tetra.js
   화면에 넣는 값은 모두 textContent 로만 넣는다 (시트 내용이 HTML 로 해석되지 않도록) */
(() => {
  'use strict';

  const CONFIG = Object.assign({
    API_URL: '',
    TITLE: 'TETRA VITALS',
    REFRESH_SEC: 10,
    DEFAULT_MAX_HP: 100,
    DEFAULT_MAX_SP: 100,
    DANGER_PCT: 25,
    SEGMENTS: 20
  }, (window.TETRA_CONFIG || {}).VITALS);

  const $ = (id) => document.getElementById(id);
  const { pad, hhmmss, reduce } = window.TETRA;

  document.title = CONFIG.TITLE;
  $('title').textContent = CONFIG.TITLE;

  const API = (() => {
    const u = String(CONFIG.API_URL || '').trim();
    return /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(u) ? u : null;
  })();

  /* ── 열 자동 인식 ── */
  const norm = (s) => String(s ?? '').toLowerCase().replace(/[\s_\-()\[\]{}:.·/]/g, '');
  const KW = {
    name: ['이름', '성명', '닉네임', '캐릭터', '캐릭명', '캐릭', '플레이어', '참가자', '명단', '인물', '대상', '멤버', 'pc', 'name', 'player', 'character', 'member'],
    hp: ['체력', '생명력', '생명', 'hp', 'health', 'vit'],
    sp: ['정신력', '정신', '멘탈', '이성', 'san', 'sanity', 'mental', 'mind', 'sp', 'mp', '마나'],
    max: ['최대', 'max', '총', '상한', '최고', 'full', 'total', '전체'],
    cur: ['현재', 'cur', 'now', '남은', '잔여', 'current', 'remain'],
    unit: ['소속', '부대', '분대', '소대', '중대', '유닛', '콜사인', '호출부호', '코드', 'unit', 'squad', 'team', 'callsign', 'group'],
    unitExact: ['조', '팀', '반', '대'],
    dead: ['사망', '전사', 'dead', 'death', 'kia']
  };
  const has = (l, list) => list.some((k) => l.includes(k));

  const SQUADS = ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA'];
  const KO2EN = { '알파': 'ALPHA', '브라보': 'BRAVO', '찰리': 'CHARLIE', '델타': 'DELTA' };
  const LETTER = { A: 'ALPHA', B: 'BRAVO', C: 'CHARLIE', D: 'DELTA' };
  const PREFIX = 'tetra|테트라';
  const UNIT_RX = new RegExp(`^(?:(?:${PREFIX})[\\s\\-_]*)?(?:(?:alpha|alfa|bravo|charlie|delta|알파|브라보|찰리|델타)[\\s\\-_]*(?:팀|조|분대|team|squad)?(?:[\\s\\-_]*\\d+)?(?:번|조)?|[abcd](?:[\\s\\-_]*(?:팀|조|분대|team|squad)(?:[\\s\\-_]*\\d+)?(?:번|조)?|[\\s\\-_]+\\d+(?:번|조)?))$`, 'i');
  const isUnitVal = (s) => UNIT_RX.test(String(s).trim());
  const unitDisp = (s) => String(s || '').trim()
    .replace(new RegExp(`^(?:${PREFIX})[\\s\\-_]*`, 'i'), '')
    .replace(/알파|브라보|찰리|델타/g, (w) => KO2EN[w])
    .replace(/alfa/i, 'ALPHA')
    .replace(/^([abcd])(?=$|[\s\-_\d]|팀|조|분대)/i, (m, c) => LETTER[c.toUpperCase()])
    .replace(/[\s\-_]*(팀|분대|team|squad)(?=$|[\s\-_\d])/ig, '')
    .replace(/([A-Za-z])[\s\-_]*조(?=$|[\s\-_\d])/g, '$1')
    .replace(/(\d+)\s*번$/, '$1')
    .replace(/[\s_]+/g, '-')
    .replace(/([A-Z])(\d)/gi, '$1-$2')
    .replace(/-+/g, '-').replace(/^-|-$/g, '')
    .toUpperCase();
  const squadOf = (u) => SQUADS.find((sq) => new RegExp(`(^|[^A-Z])${sq}([^A-Z]|$)`).test(u)) || '';

  function classify(label) {
    const l = norm(label);
    if (!l) return null;
    const isCur = has(l, KW.cur);
    const isMax = has(l, KW.max) && !isCur;
    if (has(l, KW.dead)) return { kind: 'dead', score: KW.dead.includes(l) ? 1 : 0 };
    if (has(l, KW.sp)) return { kind: isMax ? 'maxSp' : 'sp', score: (isCur ? 2 : 0) + (KW.sp.includes(l) ? 1 : 0) };
    if (has(l, KW.hp)) return { kind: isMax ? 'maxHp' : 'hp', score: (isCur ? 2 : 0) + (KW.hp.includes(l) ? 1 : 0) };
    if (has(l, KW.name)) return { kind: 'name', score: KW.name.includes(l) ? 1 : 0 };
    if (has(l, KW.unit) || KW.unitExact.includes(l)) return { kind: 'unit', score: 0 };
    return null;
  }

  function detectCols(labels) {
    const best = {};
    labels.forEach((lab, i) => {
      const c = classify(lab);
      if (c && (!best[c.kind] || c.score > best[c.kind].score)) best[c.kind] = { i, score: c.score };
    });
    const cols = {};
    for (const k in best) cols[k] = best[k].i;
    return cols;
  }
  const found = (cols) => ['name', 'hp', 'sp'].filter((k) => cols[k] != null).length;

  function parseVal(cell) {
    if (!cell || cell.v == null) return { cur: null, max: null };
    if (typeof cell.v === 'number') return { cur: cell.v, max: null };
    const s = String(cell.v).trim();
    const m = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (m) return { cur: +m[1], max: +m[2] };
    const n = parseFloat(s.replace(/,/g, ''));
    return { cur: isNaN(n) ? null : n, max: null };
  }
  const cellText = (c) => (c ? String(c.f ?? c.v ?? '').trim() : '');
  const isTrue = (c) => !!c && (c.v === true || /^(true|o|y|yes|1|v|✔|✓|☑|사망|전사)$/i.test(String(c.v).trim()));

  function guessByData(rows, ncol, cols) {
    const used = new Set(Object.values(cols));
    const stat = [];
    for (let j = 0; j < ncol; j++) {
      let num = 0, txt = 0, unit = 0;
      for (const r of rows) {
        const t = cellText(r[j]);
        if (!t) continue;
        if (isUnitVal(t)) unit++;
        if (parseVal(r[j]).cur != null) num++; else txt++;
      }
      stat.push({ j, num, txt, unit });
    }
    if (cols.unit == null) {
      const u = stat.find((s) => !used.has(s.j) && s.unit > 0 && s.unit >= (s.num + s.txt) * 0.6);
      if (u) { cols.unit = u.j; used.add(u.j); }
    }
    if (cols.name == null) {
      const t = stat.find((s) => !used.has(s.j) && s.txt > 0 && s.txt >= s.num);
      if (t) { cols.name = t.j; used.add(t.j); }
    }
    const nums = stat.filter((s) => !used.has(s.j) && s.num > 0 && s.num >= s.txt && s.j > (cols.name ?? -1));
    for (const k of ['hp', 'sp']) {
      if (cols[k] == null && nums.length) { const s = nums.shift(); cols[k] = s.j; used.add(s.j); }
    }
    return cols;
  }

  const SKIP_NAME = /^(합계|총합|평균|소계|total|sum|avg|average|비고|예시)$/i;

  /* ── 데이터 불러오기 (Apps Script JSONP) ── */
  let cbSeq = 0;
  function loadData(url) {
    return new Promise((resolve, reject) => {
      const cb = '__vitals_cb_' + (++cbSeq);
      const s = document.createElement('script');
      let done = false;
      const finish = (fn, v) => { if (done) return; done = true; clearTimeout(t); delete window[cb]; s.remove(); fn(v); };
      window[cb] = (json) => finish(resolve, json);
      s.onerror = () => finish(reject, new Error('데이터 서버에 연결할 수 없습니다.'));
      const t = setTimeout(() => finish(reject, new Error('데이터 서버 응답 없음')), 15000);
      s.src = url + '?callback=' + cb + '&_=' + Date.now();
      document.head.appendChild(s);
    });
  }

  let detected = '';
  async function fetchPeople() {
    const json = await loadData(API);
    if (!json || json.status !== 'ok' || !json.table) throw new Error('데이터를 읽을 수 없습니다.');

    const colIds = json.table.cols.map((c) => c.id);
    const ncol = colIds.length;
    let rows = json.table.rows.map((r) => {
      const c = r.c || [];
      while (c.length < ncol) c.push(null);
      return c;
    });

    let cols = {}, start = 0, best = 0;
    rows.slice(0, 20).forEach((r, idx) => {
      const cand = detectCols(r.map(cellText));
      if (found(cand) > best) { best = found(cand); cols = cand; start = idx + 1; }
    });
    rows = rows.slice(start);
    if (found(cols) < 3 || cols.unit == null) cols = guessByData(rows, ncol, cols);

    if (cols.name == null) throw new Error('이름 열을 찾지 못했습니다.');
    if (cols.hp == null && cols.sp == null) throw new Error('체력/정신력 열을 찾지 못했습니다.');

    const labels = { unit: 'UNIT', name: 'NAME', hp: 'HP', sp: 'SP', maxHp: 'MAX HP', maxSp: 'MAX SP', dead: 'DEAD' };
    detected = Object.keys(labels).filter((k) => cols[k] != null).map((k) => `${labels[k]}=${colIds[cols[k]]}`).join(' · ');

    const people = [];
    rows.forEach((r, i) => {
      let name = cellText(r[cols.name]);
      if (!name || SKIP_NAME.test(name)) return;
      let unit = cols.unit != null ? cellText(r[cols.unit]) : '';
      if (!unit) {
        const b = name.match(/^[\[(]([^\])]+)[\])]\s*(.+)$/);
        if (b && isUnitVal(b[1])) { unit = b[1]; name = b[2].trim(); }
        else {
          const parts = name.split(/\s+/);
          for (let k = Math.min(3, parts.length - 1); k >= 1; k--) {
            const head = parts.slice(0, k).join(' ');
            if (isUnitVal(head)) { unit = head; name = parts.slice(k).join(' '); break; }
          }
        }
      }
      const hp = parseVal(r[cols.hp]), sp = parseVal(r[cols.sp]);
      if (hp.cur == null && sp.cur == null) return;
      const maxHp = (cols.maxHp != null && parseVal(r[cols.maxHp]).cur) || hp.max || CONFIG.DEFAULT_MAX_HP;
      const maxSp = (cols.maxSp != null && parseVal(r[cols.maxSp]).cur) || sp.max || CONFIG.DEFAULT_MAX_SP;
      const u = unitDisp(unit);
      const dead = cols.dead != null && isTrue(r[cols.dead]);
      people.push({ key: u + '/' + name + '#' + i, order: i, name, unit: u, squad: squadOf(u), hp: hp.cur, maxHp, sp: sp.cur, maxSp, dead });
    });
    return people;
  }

  /* ── 화면 ── */
  const rowsByKey = new Map();
  let data = [];
  let sortKey = 'sheet';
  const pct = (v, m) => (v == null || !m ? 0 : Math.max(0, Math.min(100, (v / m) * 100)));
  const fmt = (v) => (v == null ? '--' : (Number.isInteger(v) ? String(v) : v.toFixed(1)));
  const isLow = (v, m) => v != null && pct(v, m) <= CONFIG.DANGER_PCT;
  const isDanger = (p) => isLow(p.hp, p.maxHp) || isLow(p.sp, p.maxSp);
  const isDown = (p) => p.dead || (p.hp != null && p.hp <= 0) || (p.sp != null && p.sp <= 0);
  const isCrit = (p) => !isDown(p) && isDanger(p);
  const alive = (list) => list.filter((p) => !isDown(p));
  const sqRank = (p) => { const i = SQUADS.indexOf(p.squad); return i >= 0 ? i : (p.squad ? SQUADS.length : SQUADS.length + 1); };
  const pctOrInf = (v, m) => (v == null ? Infinity : pct(v, m));
  const SORTERS = {
    sheet: (a, b) => a.order - b.order,
    unit: (a, b) => sqRank(a) - sqRank(b) || a.unit.localeCompare(b.unit, 'en', { numeric: true }) || a.order - b.order,
    name: (a, b) => a.name.localeCompare(b.name, 'ko'),
    hpAsc: (a, b) => pctOrInf(a.hp, a.maxHp) - pctOrInf(b.hp, b.maxHp),
    spAsc: (a, b) => pctOrInf(a.sp, a.maxSp) - pctOrInf(b.sp, b.maxSp)
  };

  const vitalHTML = (kind, label) =>
    `<div class="vt ${kind}" aria-label="${label}"><div class="segs">${'<i></i>'.repeat(CONFIG.SEGMENTS)}</div><span class="v"><b>--</b><span class="mx"></span></span></div>`;

  function createRow() {
    const el = document.createElement('div');
    el.className = 'unit';
    el.innerHTML = `<span class="no"></span><span class="u"></span><span class="nm"></span>${vitalHTML('hp', 'HP')}${vitalHTML('sp', 'SP')}<span class="st"></span>`;
    return el;
  }

  function updateVital(row, cur, max, prev) {
    const p = pct(cur, max);
    const on = cur > 0 ? Math.max(1, Math.round((p / 100) * CONFIG.SEGMENTS)) : 0;
    row.querySelectorAll('.segs i').forEach((s, k) => s.classList.toggle('on', k < on));
    row.querySelector('.v b').textContent = fmt(cur);
    row.querySelector('.v .mx').textContent = '/' + fmt(max);
    row.classList.toggle('low', isLow(cur, max));
    if (prev == null || cur == null || prev === cur) return false;
    const diff = cur - prev;
    const d = document.createElement('span');
    d.className = 'delta ' + (diff > 0 ? 'up' : 'dn');
    d.textContent = (diff > 0 ? '+' : '') + fmt(diff);
    row.querySelector('.v').appendChild(d);
    setTimeout(() => d.remove(), 1900);
    return true;
  }

  function render() {
    const grid = $('grid');
    const hasUnit = data.some((p) => p.unit);
    if (!hasUnit && sortKey === 'unit') sortKey = 'sheet';
    $('list').classList.toggle('nounit', !hasUnit);
    $('sortUnit').hidden = !hasUnit;
    const list = data.slice().sort(SORTERS[sortKey]);

    const keys = new Set(data.map((p) => p.key));
    for (const [k, r] of rowsByKey) if (!keys.has(k)) { r.el.remove(); rowsByKey.delete(k); }

    data.forEach((p, idx) => {
      let r = rowsByKey.get(p.key);
      if (!r) { r = { el: createRow(), prev: null }; rowsByKey.set(p.key, r); }
      const el = r.el;
      el.querySelector('.no').textContent = pad(idx + 1);
      el.querySelector('.u').textContent = p.unit || '—';
      const nm = el.querySelector('.nm');
      nm.textContent = p.name;
      nm.title = p.unit ? `${p.unit} ${p.name}` : p.name;
      const [rHp, rSp] = el.querySelectorAll('.vt');
      const changed = updateVital(rHp, p.hp, p.maxHp, r.prev?.hp) | updateVital(rSp, p.sp, p.maxSp, r.prev?.sp);
      if (changed && !reduce) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
      const down = isDown(p), danger = isDanger(p);
      el.classList.toggle('down', down);
      el.classList.toggle('warn', danger && !down);
      el.querySelector('.st').textContent = down ? '[DOWN]' : danger ? '[WARN]' : 'OK';
      r.prev = { hp: p.hp, sp: p.sp };
    });

    grid.querySelectorAll('.grp').forEach((g) => g.remove());
    const grouped = hasUnit && (sortKey === 'sheet' || sortKey === 'unit');
    let lastSq = null;
    list.forEach((p) => {
      if (grouped && p.squad !== lastSq) {
        const sqList = data.filter((x) => x.squad === p.squad);
        const sqCrit = sqList.filter(isCrit).length;
        const g = document.createElement('div');
        g.className = 'grp' + (sqCrit ? ' crit' : '');
        g.setAttribute('aria-hidden', 'true');
        g.innerHTML = '<span></span><b></b>';
        g.firstChild.textContent = p.squad || 'UNASSIGNED';
        g.lastChild.textContent = pad(alive(sqList).length) + (sqCrit ? ` · ${pad(sqCrit)} CRIT` : '');
        grid.appendChild(g);
        lastSq = p.squad;
      }
      grid.appendChild(rowsByKey.get(p.key).el);
    });

    let empty = grid.querySelector('.empty');
    if (!list.length) {
      if (!empty) { empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = 'NO PERSONNEL'; grid.appendChild(empty); }
    } else if (empty) empty.remove();

    const living = alive(data);
    const avg = (k, mk) => {
      const a = living.filter((p) => p[k] != null);
      return a.length ? Math.round(a.reduce((s, p) => s + pct(p[k], p[mk]), 0) / a.length) : '--';
    };
    const crit = data.filter(isCrit).length;
    const squads = SQUADS.filter((sq) => data.some((p) => p.squad === sq)).length;
    $('sCount').textContent = pad(living.length);
    $('sHp').textContent = avg('hp', 'maxHp');
    $('sSp').textContent = avg('sp', 'maxSp');
    $('sWarn').textContent = pad(crit);
    $('sCritBox').classList.toggle('on', crit > 0);
    $('listcnt').textContent = `${living.length} PERSONNEL` + (squads ? ` · ${squads} SQUADS` : '');
    $('detect').textContent = 'AUTO-DETECT ' + detected;
    $('board').hidden = false;
  }

  // 신호 표시: LIVE(흰 점) / SYNC(깜빡) / SIG LOST(빨간 글자) — 스타일은 공통 .sig
  function setSig(state) {
    $('sig').className = 'sig' + ({ ok: '', busy: ' busy', lost: ' lost err' }[state]);
    $('sig').textContent = { ok: 'LIVE', busy: 'SYNC', lost: 'SIG LOST' }[state];
  }

  // 마지막 데이터 캐시 — HUB 메뉴 요약도 이 값을 읽는다 (키: 'tetra-vitals:' + API 주소)
  const CACHE_KEY = 'tetra-vitals:' + API;
  function saveCache() {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data, detected })); } catch (e) {}
  }
  function loadCache() {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (c && Array.isArray(c.data) && c.data.length) return c;
    } catch (e) {}
    return null;
  }

  let timer = null, busy = false;
  let lastCrit = null;   // 직전 갱신 때 위험 인원 수 (경보음 판단용)
  async function tick() {
    if (busy) return;
    busy = true;
    setSig('busy');
    try {
      data = await fetchPeople();
      render();
      saveCache();
      setSig('ok');
      const crit = data.filter(isCrit).length;
      // 효과음: 위험 인원이 늘었을 때만 경보 (처음 받아온 때와 줄었을 때는 조용히)
      if (lastCrit !== null && crit > lastCrit && window.TETRA_SFX) window.TETRA_SFX.play('alarm');
      lastCrit = crit;
      $('alert').className = 'sys';
      $('alert').textContent = (crit ? `CRITICAL ${pad(crit)} PERSONNEL` : 'ALL PERSONNEL STABLE') + ` · VITAL MONITOR · READ ONLY · REFRESH ${CONFIG.REFRESH_SEC}s`;
      $('upd').textContent = 'SYNC ' + hhmmss(new Date());
    } catch (e) {
      setSig('lost');
      $('alert').className = 'sys err';
      $('alert').textContent = 'LINK ERROR · ' + e.message + (data.length ? ' (마지막 데이터 표시 중 · 자동 재시도)' : '');
    } finally { busy = false; }
  }
  function stop() { clearInterval(timer); timer = null; }
  function start() { stop(); tick(); timer = setInterval(tick, Math.max(3, CONFIG.REFRESH_SEC) * 1000); }

  if (!API) {
    setSig('lost');
    $('alert').className = 'sys err';
    $('alert').textContent = 'NO DATA SOURCE · assets/config.js VITALS.API_URL';
  } else {
    const cached = loadCache();
    if (cached) {
      data = cached.data;
      detected = cached.detected || '';
      render();
      $('upd').textContent = 'CACHED ' + hhmmss(new Date(cached.t));
    }
    start();
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    $('sorts').addEventListener('click', (ev) => {
      const b = ev.target.closest('button[data-s]');
      if (!b) return;
      sortKey = b.dataset.s;
      $('sorts').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      render();
    });
  }
})();
