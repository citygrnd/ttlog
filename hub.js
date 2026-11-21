/* TETRA HUB — 메인 메뉴
   - 메뉴 요약: 각 페이지 데이터 파일(entries.js, *-data.js)과 VITALS 캐시를 읽음
   - 작전 현황(DAY · T+): assets/config.js 의 OP_START · OP_DAYS
   - 터미널 목록 T 를 고치면 메뉴·숫자키·안내가 자동으로 바뀜
   시계 · 눈보라는 assets/tetra.js, 효과음은 assets/sfx.js, 화면 값은 textContent 로만 넣는다 */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const { pad } = window.TETRA;

  /* ── 데이터 요약 ── 각 페이지의 데이터 파일(entries.js, *-data.js)과 VITALS 캐시를 읽어 메뉴 요약을 만든다 */
  const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  const utc = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };

  const LOG = (() => {
    const list = (window.ENTRIES || []).filter((e) => e && isDate(e.date) && e.author);
    if (!list.length) return null;
    const cfg = window.LOG_CONFIG || {};
    const stamp = (e) => `${e.date} ${e.time || ''}`;
    const latest = list.reduce((a, e) => (stamp(e) > stamp(a) ? e : a));
    const first = list.reduce((a, e) => (stamp(e) < stamp(a) ? e : a));
    const start = isDate(cfg.start) ? cfg.start : first.date;
    const day = Math.round((utc(latest.date) - utc(start)) / 864e5) + 1;
    const personnel = cfg.personnel || new Set(list.map((e) => `${e.unit || ''} ${e.author}`)).size;
    return { count: list.length, latest, day, total: Math.max(cfg.days || 0, day), personnel };
  })();

  /* 메뉴 줄 요약: 경보판 방식. 각 함수는 { text, red, detail } 또는 데이터가 없으면 null('ONLINE' 표시)
     text   = 메뉴 줄 오른쪽에 보이는 핵심 하나 (경보가 있으면 숫자 + red, 없으면 조용한 단어)
     detail = 줄을 선택했을 때 설명 아래에 보이는 전체 규모 (배열, 항목 단위로만 줄바꿈) */
  const SUMMARY = {
    log: () => LOG && {
      text: `DAY ${pad(LOG.day)}`,
      detail: [`${LOG.count} REPORTS`, `${pad(LOG.personnel)} PERSONNEL`, `DAY ${pad(LOG.day)}/${pad(LOG.total)}`]
    },
    // VITALS: 이 브라우저에서 VITALS 를 열었을 때 남긴 캐시(localStorage 'tetra-vitals:…')를 읽는다
    //         HUB 는 시트를 직접 부르지 않음 (사용자 결정). 캐시가 없으면 ONLINE
    vitals: () => {
      const c = vitalsCache();
      if (!c) return null;
      const pct = (v, m) => (v == null || !m ? 100 : (v / m) * 100);
      const DANGER = ((window.TETRA_CONFIG || {}).VITALS || {}).DANGER_PCT ?? 25; // VITALS 와 같은 기준 (assets/config.js)
      const down = (p) => p.dead || (p.hp != null && p.hp <= 0) || (p.sp != null && p.sp <= 0);
      const alive = c.data.filter((p) => !down(p));
      const crit = alive.filter((p) => pct(p.hp, p.maxHp) <= DANGER || pct(p.sp, p.maxSp) <= DANGER).length;
      const t = new Date(c.t);
      return {
        text: crit ? `${pad(crit)} CRIT` : 'STABLE',
        red: crit > 0,
        detail: [`${pad(alive.length)} PERSONNEL`, `${pad(crit)} CRIT`, `${pad(c.data.length - alive.length)} DOWN`,
          `CACHED ${pad(t.getMonth() + 1)}.${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}`]
      };
    },
    sector: () => {
      const S = (window.SECTOR_DATA || []).filter((z) => z && !z.landmark);   // 지형지물(연구소 등)은 집계에서 뺌
      if (!S.length) return null;
      const n = (st) => S.filter((z) => z.st === st).length;
      const dg = n('DG');
      return {
        text: dg ? `${pad(dg)} DANGER` : 'CLEAR',
        red: dg > 0,
        detail: [`${pad(S.length)} ZONES`, `${pad(n('CL'))} CLEARED`, `${pad(n('SE'))} SEARCHING`, `${pad(n('UN'))} UNSEARCHED`]
      };
    },
    comms: () => {
      const C = window.COMMS_DATA;
      if (!Array.isArray(C) || !C.length) return null;
      const on = C.filter((ch) => !ch.locked && Array.isArray(ch.msgs));
      const msgs = on.reduce((a, ch) => a.concat(ch.msgs), []);
      const sus = msgs.filter((m) => m[4]).length;
      return {
        text: sus ? `${pad(sus)} SUSPECT` : 'QUIET',
        red: sus > 0,
        detail: [`${pad(on.length)} CHANNELS`, `${pad(msgs.length)} LOGS`, `${pad(sus)} SUSPECT`, `${pad(C.length - on.length)} NO SIGNAL`]
      };
    },
    codex: () => {
      const D = window.CODEX_DATA;
      if (!Array.isArray(D) || !D.length) return null;
      const lk = D.filter((e) => e.locked).length;
      return {
        text: lk ? `${pad(lk)} LOCKED` : 'ALL OPEN',
        detail: [`${pad(D.length)} FILES`, `${pad(D.length - lk)} READ`, `${pad(lk)} LOCKED`]
      };
    }
  };

  function vitalsCache() {
    try {
      let best = null;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || k.indexOf('tetra-vitals:') !== 0) continue;
        const c = JSON.parse(localStorage.getItem(k) || 'null');
        if (c && Array.isArray(c.data) && c.data.length && (!best || c.t > best.t)) best = c;
      }
      return best;
    } catch (e) { return null; }
  }

  /* ── 터미널 목록 ── 번호·키보드 단축키는 이 목록에서 자동으로 정해진다 */
  const T = [
    // 순서 = 상황 파악 흐름: 지금 상태 → 어디서 → 무슨 일이 → 무엇을 들었나 → 무엇을 만났나
    { n: 1, id: 'vitals', name: 'TETRA VITALS', ko: '바이탈 모니터', url: 'status-board/', d: '전 대원의 HP / SP 상태를 확인하는 읽기 전용 모니터.' },
    { n: 2, id: 'sector', name: 'TETRA SECTOR', ko: '구역 지도', url: 'tetra-sector/', d: '수색 구역별 진행 상황 지도. 구역 상태와 수색률 확인.' },
    { n: 3, id: 'log', name: 'TETRA LOG', ko: '작전 기록', url: 'tetra-log/', d: '14일간의 수색 작전 일일 보고서를 열람하는 단말.' },
    { n: 4, id: 'comms', name: 'TETRA COMMS', ko: '교신 로그', url: 'tetra-comms/', d: '채널별 무선 교신 기록. 모방 의심 교신은 별도 표시.' },
    { n: 5, id: 'codex', name: 'TETRA CODEX', ko: '이상 기록', url: 'tetra-codex/', d: '조우한 개체, 현상, 물품 중 설명되지 않는 것을 모은 기록. 일부 항목은 미열람.' },
    { n: 6, locked: true },
    { n: 7, locked: true }
  ];
  // PC에서 파일로 직접 열면 폴더 목록이 뜨므로 index.html 을 붙인다 (서버에서는 그대로)
  const href = (u) => (location.protocol === 'file:' ? u + 'index.html' : u);

  const ON = T.filter((e) => !e.locked);
  const OFF = T.filter((e) => e.locked);
  let cur = 0;
  let typed = String(ON[0].n);

  const span = (cls, text) => {
    const s = document.createElement('span');
    s.className = cls;
    if (text != null) s.textContent = text;
    return s;
  };

  function rowEl(e, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mr';
    b.append(span('no', `[${e.n}]`));
    if (e.locked) {
      b.setAttribute('aria-disabled', 'true');   // 누르면 거부 버저만 (sfx.js)
      b.dataset.sfx = 'deny';
      b.tabIndex = -1;
      b.setAttribute('aria-label', `TTY${e.n} 오프라인`);
      const nm = span('nm', '■■■■■■■■');
      nm.setAttribute('aria-hidden', 'true');
      b.append(nm, span('ld'), span('st', 'OFFLINE'));
      return b;
    }
    const sum = SUMMARY[e.id] && SUMMARY[e.id]();
    e.detail = sum && sum.detail;
    const st = span('st' + (sum && sum.red ? ' red' : ''), sum ? sum.text : 'ONLINE');
    b.append(span('nm', e.name), span('ko', e.ko), span('ld'), st);
    b.setAttribute('aria-label', `TTY${e.n} ${e.name}, ${st.textContent}`);
    b.addEventListener('click', () => select(i));
    b.addEventListener('dblclick', () => connect(e.url));
    return b;
  }

  // 접속: 효과음이 켜져 있으면 접속음을 들려준 뒤 이동
  function connect(url) {
    const sfx = window.TETRA_SFX;
    if (sfx && sfx.enabled) {
      sfx.play('connect');
      setTimeout(() => { location.href = href(url); }, 450);
    } else {
      location.href = href(url);
    }
  }

  const rows = $('rows');
  const onBtns = ON.map(rowEl);
  rows.append(...onBtns);
  if (OFF.length) {
    const g = document.createElement('div');
    g.className = 'grp';
    g.textContent = 'OFFLINE';
    rows.append(g, ...OFF.map((e) => rowEl(e)));
  }

  function select(i) {
    cur = i;
    typed = String(ON[i].n);
    onBtns.forEach((b, k) => {
      b.classList.toggle('is-on', k === i);
      b.setAttribute('aria-current', String(k === i));
    });
    const e = ON[i];
    $('typed').textContent = typed;
    const desc = $('desc');
    desc.textContent = '';
    const t = document.createElement('b');
    t.textContent = `TTY${e.n} ${e.name}`;
    desc.append(t, document.createElement('br'), e.d);
    if (e.detail && e.detail.length) {
      const dt = span('dt');
      e.detail.forEach((p, k) => {
        if (k) dt.append(' · ');
        dt.append(span('', p));
      });
      desc.append(document.createElement('br'), dt);
    }
    $('go').href = href(e.url);
    $('go').setAttribute('aria-label', `${e.name} 접속`);
  }
  select(0);

  $('keyRange').textContent = ON.length > 1 ? `1-${ON.length}` : '1';
  addEventListener('keydown', (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const k = ON.findIndex((e) => String(e.n) === ev.key);
    if (k >= 0) { select(k); return; }
    if (ev.key === 'ArrowUp' && cur > 0) { ev.preventDefault(); select(cur - 1); }
    if (ev.key === 'ArrowDown' && cur < ON.length - 1) { ev.preventDefault(); select(cur + 1); }
    const tag = ev.target && ev.target.tagName;
    if (ev.key === 'Enter' && tag !== 'A' && tag !== 'BUTTON') connect(ON[cur].url);
  });
  $('go').addEventListener('click', (ev) => { ev.preventDefault(); connect(ON[cur].url); });

  /* ── 상단 상태 · 하단 ── */
  if (LOG) {
    const l = LOG.latest;
    $('opDay').textContent = `DAY ${pad(LOG.day)}`;
    $('opDay').append(span('', `/${pad(LOG.total)}`));
    $('opLast').textContent = `${l.date.slice(5).replace('-', '.')}${l.time ? ' ' + l.time : ''}`;
    $('opCnt').textContent = `${LOG.count} FILES`;
    $('upd').textContent = `LOG UPDATED ${l.date.replace(/-/g, '.')}${l.time ? ' ' + l.time : ''}`;
  }

  // 실시간 작전 경과 (assets/config.js 의 OP_START · OP_DAYS)
  //   T+  : OP_START 부터 0으로 시작하는 누적 시간(HH:MM:SS), 1초마다 갱신, OP_DAYS 일(14일=336:00:00)에서 멈춤. 시작 전에는 00:00:00
  //   DAY : 한국 날짜 기준. 시작한 날 01, 다음 날 02 … OP_DAYS 에서 멈춤. 시작 전에는 00
  const OPC = window.TETRA_CONFIG || {};
  const t0 = Date.parse(OPC.OP_START || '');
  if (!isNaN(t0)) {
    const total = OPC.OP_DAYS || (LOG ? LOG.total : 14);
    const kstDay = (ms) => Math.floor((ms + 9 * 36e5) / 864e5);  // 한국 날짜 번호
    let shownDay = -1;
    const tickT = () => {
      const now = Date.now();
      const a = Math.min(total * 86400, Math.max(0, Math.floor((now - t0) / 1000)));
      // 누적 시간 HH:MM:SS (100시간 넘으면 세 자리, 14일 = 336:00:00)
      $('opEl').textContent = `${pad(Math.floor(a / 3600))}:${pad(Math.floor(a % 3600 / 60))}:${pad(a % 60)}`;
      const day = now < t0 ? 0 : Math.min(total, kstDay(now) - kstDay(t0) + 1);
      if (day !== shownDay) {
        shownDay = day;
        $('opDay').textContent = `DAY ${pad(day)}`;
        $('opDay').append(span('', `/${pad(total)}`));
      }
    };
    tickT();
    setInterval(tickT, 1000);
    $('opT').hidden = false;
  }
  $('alert').textContent = `WEDGE · STATION LINK LOST · TERMINALS ONLINE ${pad(ON.length)} · SELECT TTY`;
  $('fR').textContent = `${pad(ON.length)} ONLINE · ${pad(OFF.length)} OFFLINE`;
})();
