/* TETRA CODEX — 이상 기록 열람
   데이터: codex-data.js (window.CODEX_DATA)
   주소: #CDX-003 → 해당 항목 열기 (잠긴 항목·없는 번호는 첫 항목)
   시계 · 눈보라는 ../assets/tetra.js, 화면 값은 textContent 로만 넣는다 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const { pad } = window.TETRA;
  const pad3 = (n) => String(n).padStart(3, '0');
  const WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
  const week = (d) => { const [y, m, dd] = d.split('-').map(Number); return WEEK[new Date(Date.UTC(y, m - 1, dd)).getUTCDay()]; };
  const when = (e) => (isDate(e.date) ? `${e.date.replace(/-/g, '.')} ${week(e.date)}${e.time ? ' ' + e.time : ''}` : '—');

  const DATA = (window.CODEX_DATA || [])
    .filter((e) => e && Number.isFinite(e.code))
    .sort((a, b) => a.code - b.code);
  const READ = DATA.filter((e) => !e.locked);
  const LOCK = DATA.filter((e) => e.locked);
  const cdx = (e) => `CDX-${pad3(e.code)}`;
  const slug = (e) => `${pad3(e.code)}-${String(e.name || '').toLowerCase().replace(/\s+/g, '-')}.rec`;   // .rec = record (이상 기록)

  let cur = null;

  const el = (tag, cls, text) => {
    const x = document.createElement(tag);
    if (cls) x.className = cls;
    if (text != null) x.textContent = text;
    return x;
  };

  /* 목록 */
  const rowBtns = new Map();
  function buildFiles() {
    const box = $('files');
    box.textContent = '';
    READ.forEach((e) => {
      const b = el('button', 'fr');
      b.type = 'button';
      b.append(el('span', '', pad(e.code)), el('span', 'nm', e.name), el('span', 'st', 'READ'));
      b.setAttribute('aria-label', `${cdx(e)} ${e.name}`);
      b.addEventListener('click', () => go(e, true));
      rowBtns.set(e, b);
      box.append(b);
    });
    if (LOCK.length) {
      box.append(el('div', 'grp unread', 'UNREAD'));
      LOCK.forEach((e) => {
        const b = el('button', 'fr');
        b.type = 'button';
        b.setAttribute('aria-disabled', 'true');   // 열 수 없음 — 누르면 거부 버저만 (sfx.js)
        b.dataset.sfx = 'deny';
        b.tabIndex = -1;
        b.setAttribute('aria-label', `${cdx(e)} 미열람`);
        const nm = el('span', 'nm', '■■■■■■■■');
        nm.setAttribute('aria-hidden', 'true');
        b.append(el('span', '', pad(e.code)), nm, el('span', 'st', 'LOCKED'));
        box.append(b);
      });
    }
    $('fCnt').textContent = `${pad(DATA.length)} FILES`;
  }

  /* 상세 */
  function show(e) {
    cur = e;
    rowBtns.forEach((b, k) => b.setAttribute('aria-current', String(k === e)));
    const pos = READ.indexOf(e);

    $('catName').textContent = slug(e);
    const fig = $('img'), ph = $('ph');
    const old = fig.querySelector('img');
    if (old) old.remove();
    if (e.img) {
      const im = el('img');
      im.src = e.img;
      im.alt = e.alt || e.name;
      im.loading = 'lazy';
      fig.insertBefore(im, fig.firstChild);
      ph.hidden = true;
    } else {
      ph.hidden = false;
      ph.setAttribute('aria-label', `이미지 없음: ${e.name}`);
    }
    $('figT').textContent = `FIG. ${pad3(e.code)}`;
    $('figN').textContent = cdx(e);
    $('mCode').textContent = cdx(e);
    $('mBy').textContent = e.by || '—';
    $('mLoc').textContent = e.loc || '—';
    $('mTime').textContent = when(e);
    $('hName').textContent = e.title || e.name;

    const body = $('body');
    body.textContent = '';
    (e.s || []).forEach((p, k, arr) => {
      body.append(el('span', 'tag', `[${p[0]}]`), `\n- ${p[1]}${k < arr.length - 1 ? '\n\n' : ''}`);
    });

    $('pos').textContent = `${pad(pos + 1)}/${pad(READ.length)}`;
    $('prev').disabled = pos <= 0;
    $('next').disabled = pos >= READ.length - 1;
  }

  /* 주소(#CDX-003) ↔ 화면 */
  const wide = matchMedia('(min-width: 880px)');
  let wantScroll = false;
  function go(e, scroll) {
    wantScroll = !!scroll;
    const h = '#' + cdx(e);
    if (location.hash === h) route();
    else location.hash = h;
  }
  function route() {
    if (!READ.length) {
      $('catName').textContent = '(empty)';
      $('hName').textContent = 'NO ENTRIES';
      $('prev').disabled = $('next').disabled = true;
      $('pos').textContent = '--/--';
      return;
    }
    const m = /^#?CDX-(\d+)$/i.exec(decodeURIComponent(location.hash));
    const hit = m && READ.find((e) => e.code === Number(m[1]));
    show(hit || READ[0]);
    // 좁은 화면에서 목록을 눌렀을 때만 상세로 스크롤 (LOG 와 같은 방식)
    if (wantScroll && !wide.matches) {
      $('catName').closest('.cmdrow').scrollIntoView({ block: 'start', behavior: window.TETRA.reduce ? 'auto' : 'smooth' });
    }
    wantScroll = false;
  }
  const step = (d) => {
    const p = READ.indexOf(cur) + d;
    if (p >= 0 && p < READ.length) go(READ[p]);
  };

  /* 시작 */
  buildFiles();
  $('alert').textContent = `CODEX ACCESS · READ ${pad(READ.length)} · UNREAD ${pad(LOCK.length)} · READ ONLY`;
  const latest = READ.filter((e) => isDate(e.date))
    .reduce((a, e) => (!a || `${e.date} ${e.time || ''}` > `${a.date} ${a.time || ''}` ? e : a), null);
  $('fU').textContent = latest ? `UPDATED ${latest.date.replace(/-/g, '.')}${latest.time ? ' ' + latest.time : ''}` : 'UPDATED —';
  $('fR').textContent = `${pad(READ.length)} READ · ${pad(LOCK.length)} UNREAD`;

  $('prev').addEventListener('click', () => step(-1));
  $('next').addEventListener('click', () => step(1));
  addEventListener('hashchange', route);
  addEventListener('keydown', (ev) => {
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (ev.key === 'ArrowLeft') step(-1);
    if (ev.key === 'ArrowRight') step(1);
  });
  route();
})();
