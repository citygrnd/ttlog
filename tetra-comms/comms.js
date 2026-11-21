/* TETRA COMMS — 채널별 교신 로그
   데이터: comms-data.js (window.COMMS_DATA)
   주소: #CH-04 → 해당 채널 열기 (신호 없는 채널·없는 번호는 첫 채널)
   시계 · 눈보라는 ../assets/tetra.js, 화면 값은 textContent 로만 넣는다 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const { pad } = window.TETRA;
  const WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
  const week = (d) => { const [y, m, dd] = d.split('-').map(Number); return WEEK[new Date(Date.UTC(y, m - 1, dd)).getUTCDay()]; };
  const dayLabel = (d) => `${d.replace(/-/g, '.')} ${week(d)}`;

  const CH = (window.COMMS_DATA || []).filter((c) => c && Number.isFinite(c.n));
  const ON = CH.filter((c) => !c.locked && Array.isArray(c.msgs));
  const OFF = CH.filter((c) => c.locked);
  const FILTERS = ['ALL', 'RX', 'TX', 'SUSPECT'];
  const chId = (c) => `CH-${pad(c.n)}`;
  const susOf = (c) => c.msgs.filter((m) => m[4]).length;

  // 교신 한 줄 → { date, time, dir, from, text, sus }. 'YYYY-MM-DD HH:MM:SS' 면 그 줄부터 날짜 변경
  function lines(c) {
    let date = isDate(c.date) ? c.date : '';
    return c.msgs.map((m) => {
      const s = String(m[0] || '');
      const hit = /^(\d{4}-\d{2}-\d{2})\s+(.+)$/.exec(s);
      if (hit) date = hit[1];
      return { date, time: hit ? hit[2] : s, dir: m[1], from: m[2], text: m[3], sus: !!m[4] };
    });
  }

  let cur = null;
  let flt = 'ALL';

  const el = (tag, cls, text) => {
    const x = document.createElement(tag);
    if (cls) x.className = cls;
    if (text != null) x.textContent = text;
    return x;
  };

  /* 채널 목록 */
  const rowBtns = new Map();
  function buildFiles() {
    const box = $('files');
    box.textContent = '';
    ON.forEach((c) => {
      const sus = susOf(c);
      const b = el('button', 'fr');
      b.type = 'button';
      b.append(el('span', '', pad(c.n)), el('span', 'nm', c.name), el('span', 'st' + (sus ? ' red' : ''), sus ? 'SUSPECT' : `${pad(c.msgs.length)} LOG`));
      b.setAttribute('aria-label', `${chId(c)} ${c.name}${sus ? ', 모방 의심 ' + sus + '건' : ''}`);
      b.dataset.sfx = 'none';   // 채널 전환 소리는 show() 에서
      b.addEventListener('click', () => go(c, true));
      rowBtns.set(c, b);
      box.append(b);
    });
    if (OFF.length) {
      box.append(el('div', 'grp', 'NO SIGNAL'));
      OFF.forEach((c) => {
        const b = el('button', 'fr');
        b.type = 'button';
        b.disabled = true;
        b.tabIndex = -1;
        b.setAttribute('aria-label', `${chId(c)} 신호 없음`);
        const nm = el('span', 'nm', '■■■■■■■■');
        nm.setAttribute('aria-hidden', 'true');
        b.append(el('span', '', pad(c.n)), nm, el('span', 'st', 'NO SIG'));
        box.append(b);
      });
    }
    $('fCnt').textContent = `${pad(CH.length)} CH`;
  }

  /* 필터 */
  function buildPills() {
    const box = $('pills');
    box.textContent = '';
    FILTERS.forEach((k) => {
      const b = el('button', '', k);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(k === flt));
      b.addEventListener('click', () => { flt = k; buildPills(); buildLog(); });
      box.append(b);
    });
  }

  /* 로그 */
  function buildLog() {
    const box = $('log');
    box.textContent = '';
    let n = 0, lastDate = null;
    lines(cur).forEach((m) => {
      if (flt === 'RX' && m.dir !== 'RX') return;
      if (flt === 'TX' && m.dir !== 'TX') return;
      if (flt === 'SUSPECT' && !m.sus) return;
      if (m.date && m.date !== lastDate) {
        box.append(el('div', 'day', dayLabel(m.date)));
        lastDate = m.date;
      }
      const r = el('div', 'ln' + (m.dir === 'NS' ? ' ns' : '') + (m.sus ? ' sus' : ''));
      r.append(el('span', 't', m.time), el('span', 'd' + (m.dir === 'TX' ? ' tx' : ''), m.dir), el('span', 'f', m.from), el('span', 'x', m.text));
      box.append(r);
      n++;
    });
    if (!n) box.append(el('p', 'empty', '— NO RECORDS —'));
    else {
      const c = el('span', 'cur');
      c.setAttribute('aria-hidden', 'true');
      box.append(c);
    }
    box.scrollTop = box.scrollHeight;
  }

  let shownOnce = false;
  function show(c) {
    // 효과음: 채널을 바꿀 때 무전기 잡음(모든 채널 같음), 모방 의심 교신이 있는 채널이면 호러 연출 (처음 열 때는 없음)
    if (shownOnce && c !== cur && window.TETRA_SFX) window.TETRA_SFX.play(susOf(c) ? 'mimic' : 'radio');
    shownOnce = true;
    cur = c;
    rowBtns.forEach((b, k) => b.setAttribute('aria-current', String(k === c)));
    $('catName').textContent = `ch-${pad(c.n)}-${String(c.name).toLowerCase()}.log`;
    const sig = Math.max(0, Math.min(5, c.sig | 0));
    [...$('bars').children].forEach((i, k) => i.classList.toggle('on', k < sig));
    $('bars').setAttribute('aria-label', `신호 세기 5칸 중 ${sig}칸`);
    buildLog();
  }

  /* 주소(#CH-04) ↔ 화면 */
  const wide = matchMedia('(min-width: 880px)');
  let wantScroll = false;
  function go(c, scroll) {
    wantScroll = !!scroll;
    const h = '#' + chId(c);
    if (location.hash === h) route();
    else location.hash = h;
  }
  function route() {
    if (!ON.length) {
      $('catName').textContent = '(no channel)';
      $('log').textContent = '';
      $('log').append(el('p', 'empty', '— NO CHANNELS —'));
      return;
    }
    const m = /^#?CH-(\d+)$/i.exec(decodeURIComponent(location.hash));
    const hit = m && ON.find((c) => c.n === Number(m[1]));
    show(hit || ON[0]);
    if (wantScroll && !wide.matches) {
      $('catName').closest('.cmdrow').scrollIntoView({ block: 'start', behavior: window.TETRA.reduce ? 'auto' : 'smooth' });
    }
    wantScroll = false;
  }
  const step = (d) => {
    const p = ON.indexOf(cur) + d;
    if (p >= 0 && p < ON.length) go(ON[p]);
  };

  /* 시작 */
  const totalSus = ON.reduce((a, c) => a + susOf(c), 0);
  $('alert').textContent = `COMMS LOG · CH ${pad(ON.length)} · SUSPECT ${pad(totalSus)} · READ ONLY`;
  $('fR').textContent = `${pad(ON.length)} CH · ${pad(totalSus)} SUSPECT`;
  const stamps = ON.flatMap((c) => lines(c).filter((m) => m.date).map((m) => `${m.date} ${m.time}`)).sort();
  const last = stamps[stamps.length - 1];
  $('fU').textContent = last ? `UPDATED ${last.slice(0, 10).replace(/-/g, '.')} ${last.slice(11, 16)}` : 'UPDATED —';

  buildFiles();
  buildPills();
  addEventListener('hashchange', route);
  addEventListener('keydown', (ev) => {
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (ev.target && ev.target.closest && ev.target.closest('#log')) return; // 로그 상자 안에서는 화살표 = 스크롤
    if (ev.key === 'ArrowUp') step(-1);
    if (ev.key === 'ArrowDown') step(1);
  });
  route();
})();
