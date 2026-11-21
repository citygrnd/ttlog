/* TETRA SECTOR — 구역 지도
   데이터: sector-data.js (window.SECTOR_DATA)
   주소: #A1 → 해당 구역 상세 열기 (없는 코드면 상세 닫힘)
   교차 링크: RELATED → ../tetra-codex/#CDX-000 (LAST RECORD 는 날짜만, 링크 없음)
   시계 · 눈보라는 ../assets/tetra.js, 화면 값은 textContent 로만 넣는다 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const { pad, reduce } = window.TETRA;
  const WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const week = (d) => { const [y, m, dd] = d.split('-').map(Number); return WEEK[new Date(Date.UTC(y, m - 1, dd)).getUTCDay()]; };
  const SVG = 'http://www.w3.org/2000/svg';

  // 상태: [상세 표기, 목록 표기]
  const ST = { CL: ['CLEARED', 'CLEAR'], SE: ['SEARCHING', 'SEARCH'], UN: ['UNSEARCHED', 'UNSRCH'], DG: ['DANGER', 'DANGER'] };

  // 목록용 작은 픽셀 아이콘 (# 진하게, o 연하게) — 지도 구역 이름(place) 기준
  const ICONS = {
    'SNOWFIELD': ['.....#.....', '.#...#...#.', '..#..#..#..', '...#.#.#...', '....###....', '###########', '....###....', '...#.#.#...', '..#..#..#..', '.#...#...#.', '.....#.....'],
    'ICE RIDGE': ['.....#.......', '....#o#..#...', '...#ooo#.#o#.', '..#ooooo#ooo#', '.#ooooooooooo', '#############'],
    'LAKE BED': ['..#...#...#..', '.#.#.#.#.#.#.', '#...#...#...#', '.............', '..#...#...#..', '.#.#.#.#.#.#.', '#...#...#...#'],
    'RELAY B': ['..#.#...#.#..', '.#.#..#..#.#.', '..#.#...#.#..', '......#......', '.....#.#.....', '.....###.....', '....#.#.#....', '....#####....', '...#..#..#...', '...#..#..#...', '..#########..'],
    'WRECK': ['.#########...', '.....#.......', '..#######....', '.#########.##', '.#oo#######.#', '.###########.', '..#########..', '#############'],
    'TUNNEL': ['...#####...', '.##.....##.', '.#.......#.', '#.........#', '#...ooo...#', '#..ooooo..#', '#.ooooooo.#', '###########'],
    'CAMP 2': ['......#......', '.....###.....', '....#####....', '...#######...', '..#########..', '.####...####.', '#####...#####', '#####...#####'],
    'UNKNOWN': ['..#####..', '.##...##.', '.##...##.', '.....##..', '....##...', '...##....', '...##....', '.........', '...##....', '...##....'],
    // 지형지물 — 지도 아이콘도 같은 패턴 (아래 LANDMARKS)
    'RESEARCH STATION': ['.......#.....', '......#.#....', '.......#.....', '.......#.....', '.###########.', '.#ooooooooo#.', '.#o##ooo##o#.', '.#ooooooooo#.', '.#ooo###ooo#.', '.#ooo#.#ooo#.', '#############']
  };

  const S = (window.SECTOR_DATA || []).filter((z) => z && z.code && z.place);
  const ZONES = S.filter((z) => !z.landmark);   // 수색 구역만 (집계용)
  const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
  const zones = [...document.querySelectorAll('#mapsvg .zone')];
  const panel = $('panel'), hint = $('hint');
  let cur = -1;

  const el = (tag, cls, text) => {
    const x = document.createElement(tag);
    if (cls) x.className = cls;
    if (text != null) x.textContent = text;
    return x;
  };

  function mini(name) {
    const g = ICONS[name];
    const w = el('span', 'mw');
    if (!g) return w;
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('class', 'mi');
    svg.setAttribute('viewBox', `0 0 ${g[0].length * 2} ${g.length * 2}`);
    svg.setAttribute('width', g[0].length * 2);
    svg.setAttribute('height', g.length * 2);
    svg.setAttribute('aria-hidden', 'true');
    g.forEach((row, r) => [...row].forEach((ch, c) => {
      if (ch !== '#' && ch !== 'o') return;
      const rc = document.createElementNS(SVG, 'rect');
      if (ch === 'o') rc.setAttribute('class', 'b');
      rc.setAttribute('x', c * 2); rc.setAttribute('y', r * 2);
      rc.setAttribute('width', 2); rc.setAttribute('height', 2);
      svg.append(rc);
    }));
    w.append(svg);
    return w;
  }

  function badge(st, long) {
    if (st !== 'DG') return document.createTextNode((ST[st] || ['—', '—'])[long ? 0 : 1]);
    const b = el('span', 'dg-badge');
    b.append('[', el('b', 'bang', '!'), '] DANGER');
    return b;
  }

  /* 목록 */
  const rowBtns = [];
  function buildFiles() {
    const box = $('files');
    box.textContent = '';
    S.forEach((z, i) => {
      const b = el('button', 'fr');
      b.type = 'button';
      const nm = el('span', 'nm');
      nm.append(mini(z.place), z.place);
      const st = el('span', 'st');
      st.append(badge(z.st, false));
      b.append(el('span', '', z.code), nm, st);
      b.setAttribute('aria-label', `${z.code} ${z.place}, ${z.landmark ? '지형지물' : (ST[z.st] || [''])[0]}`);
      b.addEventListener('click', () => go(i));
      rowBtns.push(b);
      box.append(b);
    });
    $('fCnt').textContent = `${pad(ZONES.length)} ZONES`;
  }

  /* LAST RECORD: 'YYYY-MM-DD' → 날짜만 표시 (링크 없음) */
  function lastRecord(date) {
    $('mLast').textContent = isDate(date) ? `${date.replace(/-/g, '.')} ${week(date)}` : '—';
  }

  /* RELATED: CODEX 링크 */
  function related(list) {
    const dd = $('mRel');
    dd.textContent = '';
    if (!list || !list.length) { dd.textContent = '—'; return; }
    list.forEach((c, k) => {
      if (k) dd.append(', ');
      const a = el('a', '', c);
      a.href = '../tetra-codex/' + (location.protocol === 'file:' ? 'index.html' : '') + '#' + c;
      dd.append(a);
    });
  }

  /* 상세 */
  function show(i) {
    const first = cur < 0;
    cur = i;
    const z = S[i];
    panel.hidden = false;
    hint.hidden = true;
    rowBtns.forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
    zones.forEach((g) => {
      const on = g.getAttribute('data-z') === z.place;
      g.classList.toggle('on', on);
      g.setAttribute('aria-pressed', String(on));
    });

    $('catName').textContent = `${z.code.toLowerCase()}-${z.place.toLowerCase().replace(/\s+/g, '-')}.sec`;
    $('mSec').textContent = z.landmark ? `LANDMARK ${z.code}` : `SECTOR ${z.code}`;
    const ms = $('mStat');
    ms.textContent = '';
    ms.append(badge(z.st, true));
    // 지형지물은 수색 대상이 아니므로 SEARCHED 줄 숨김
    $('rowCov').hidden = !!z.landmark;
    const pct = Math.max(0, Math.min(100, Number(z.pct) || 0));
    $('mBar').style.width = pct + '%';
    $('mPct').textContent = pct + '%';
    lastRecord(z.last);
    related(z.rel);
    $('hName').textContent = z.place;
    const body = $('body');
    body.textContent = '';
    (z.s || []).forEach((p, k, arr) => body.append(el('span', 'tag', `[${p[0]}]`), `\n- ${p[1]}${k < arr.length - 1 ? '\n\n' : ''}`));

    if (first) panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }
  function hide() {
    cur = -1;
    panel.hidden = true;
    hint.hidden = false;
    zones.forEach((g) => { g.classList.remove('on'); g.setAttribute('aria-pressed', 'false'); });
    rowBtns.forEach((b) => b.setAttribute('aria-current', 'false'));
  }

  /* 주소(#A1) ↔ 화면 */
  function go(i) {
    const h = '#' + S[i].code;
    if (location.hash === h) route();
    else location.hash = h;
  }
  function close() {
    history.replaceState(null, '', location.pathname + location.search);
    hide();
  }
  function route() {
    const code = decodeURIComponent(location.hash.slice(1)).toUpperCase();
    const i = S.findIndex((z) => z.code.toUpperCase() === code);
    if (i >= 0) show(i); else hide();
  }

  // 지도 구역 선택 — 효과음: 레이더 핑 (위험 구역이면 경고 저음 섞임)
  const pickZone = (k) => {
    if (window.TETRA_SFX) window.TETRA_SFX.play(S[k].st === 'DG' ? 'pingDanger' : 'ping');
    go(k);
  };
  zones.forEach((g) => {
    const i = () => S.findIndex((z) => z.place === g.getAttribute('data-z'));
    g.addEventListener('click', () => { if (i() >= 0) pickZone(i()); });
    g.addEventListener('keydown', (ev) => {
      if ((ev.key === 'Enter' || ev.key === ' ') && i() >= 0) { ev.preventDefault(); pickZone(i()); }
    });
  });
  $('close').addEventListener('click', close);
  addEventListener('hashchange', route);
  addEventListener('keydown', (ev) => {
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (ev.key === 'Escape' && cur >= 0) { close(); return; }
    if (cur < 0 || (ev.target && ev.target.id === 'close')) return;
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') { ev.preventDefault(); go((cur + 1) % S.length); }
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') { ev.preventDefault(); go((cur + S.length - 1) % S.length); }
  });

  /* 지형지물 픽셀 아이콘 (지도 아이콘과 같은 4단위 픽셀, # 진하게 · o 연하게) */
  const LANDMARKS = {
    rsIcon: ICONS['RESEARCH STATION'],   // RESEARCH STATION: 안테나 달린 건물 (목록 아이콘과 같은 패턴)
    bcIcon: [            // BASE CAMP: 깃발 + 반원형 막사
      '#####........',
      '#ooo#........',
      '#####........',
      '#............',
      '#....#####...',
      '#...#ooooo#..',
      '#..#ooooooo#.',
      '#..#oo###oo#.',
      '#..#oo#.#oo#.',
      '#############'
    ]
  };
  Object.keys(LANDMARKS).forEach((id) => {
    const px = $(id);
    if (!px) return;
    LANDMARKS[id].forEach((row, r) => [...row].forEach((ch, c) => {
      if (ch !== '#' && ch !== 'o') return;
      const rc = document.createElementNS(SVG, 'rect');
      rc.setAttribute('class', ch === 'o' ? 'b' : 'a');
      rc.setAttribute('x', c * 4); rc.setAttribute('y', r * 4);
      rc.setAttribute('width', 4); rc.setAttribute('height', 4);
      px.append(rc);
    }));
  });

  /* 지도 구역에 상태 표시: 아이콘 한가운데에 겹쳐서 DANGER '!'(빨강 깜빡), CLEARED '✓'(초록, 아이콘은 어둡게) */
  const MARK = { DG: ['!', 'dg'], CL: ['✓', 'cl'] };
  function markMap() {
    zones.forEach((g) => {
      const z = S.find((x) => x.place === g.getAttribute('data-z'));
      const old = g.querySelector('.mk');
      if (old) old.remove();
      g.classList.remove('st-UN', 'st-SE', 'st-CL', 'st-DG');
      if (!z) return;
      if (z.st) g.classList.add('st-' + z.st);
      g.setAttribute('aria-label', `${z.code} ${z.place}, ${(ST[z.st] || [''])[0]}`);
      const m = MARK[z.st];
      if (!m) return;
      const t = document.createElementNS(SVG, 'text');
      t.setAttribute('class', 'mk ' + m[1]);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('aria-hidden', 'true');
      t.textContent = m[0];
      g.append(t);
    });
    placeMarks();
  }
  // 표시를 실제로 그려진 아이콘의 한가운데에 겹친다 (아이콘 크기가 화면 폭에 따라 바뀌므로 매번 잼)
  function placeMarks() {
    zones.forEach((g) => {
      const t = g.querySelector('.mk');
      if (!t) return;
      const ctm = g.getScreenCTM();   // 구역마다 위치 이동(translate)이 있으므로 그 구역 기준 좌표로 변환
      if (!ctm) return;
      const inv = ctm.inverse();
      const r = g.querySelector('.ic').getBoundingClientRect();
      const p = new DOMPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2).matrixTransform(inv);
      t.setAttribute('x', p.x.toFixed(1));
      t.setAttribute('y', p.y.toFixed(1));
      t.setAttribute('dominant-baseline', 'central');   // 글자 세로 가운데를 아이콘 가운데에
    });
  }

  /* 지도 안 아이콘·글자를 시안 원본(지도 폭 약 432px)에서 보이던 크기로 유지 */
  const map = $('mapsvg');
  // 좁은 화면에서는 시안의 440px 이하 규칙(원본 대비 1.3배)까지만 키운다
  const fitMap = () => {
    if (map.clientWidth) map.style.setProperty('--mk', Math.min(1.3, 432 / map.clientWidth).toFixed(3));
    placeMarks();
  };
  if ('ResizeObserver' in window) new ResizeObserver(fitMap).observe(map);
  else addEventListener('resize', fitMap);
  fitMap();

  /* 전체 현황 (구역 선택 전 오른쪽) */
  function buildOverview() {
    const avg = ZONES.length ? Math.round(ZONES.reduce((a, z) => a + Math.max(0, Math.min(100, Number(z.pct) || 0)), 0) / ZONES.length) : 0;
    $('avgBar').style.width = avg + '%';
    $('avgPct').textContent = avg + '%';
    const list = $('dgList');
    list.textContent = '';
    const dgs = S.filter((z) => z.st === 'DG');
    $('dgCnt').textContent = `${pad(dgs.length)} HIT`;
    if (!dgs.length) { list.append(el('li', 'none', 'NO DANGER ZONES')); return; }
    dgs.forEach((z) => {
      const a = el('a');
      a.href = '#' + z.code;
      a.append(badge('DG', false), el('span', 'zc', z.code), el('span', 'zn', z.place));
      const li = el('li');
      li.append(a);
      list.append(li);
    });
  }

  /* 시작 */
  const dg = S.filter((z) => z.st === 'DG').length;
  $('alert').textContent = `SECTOR MAP · WEDGE · ZONES ${pad(ZONES.length)} · DANGER ${pad(dg)} · BASE CAMP 01 · READ ONLY`;
  $('zCnt').textContent = `${pad(ZONES.length)} ZONES`;
  $('fR').textContent = `${pad(ZONES.length)} ZONES · ${pad(dg)} DANGER`;
  const dates = S.map((z) => z.last).filter(isDate).sort();
  const last = dates[dates.length - 1];
  $('fU').textContent = last ? `UPDATED ${last.replace(/-/g, '.')}` : 'UPDATED —';

  buildFiles();
  buildOverview();
  markMap();
  route();
})();
