(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = matchMedia('(min-width: 880px)');
  const $ = (id) => document.getElementById(id);
  const CFG = Object.assign({ start: '', days: 14, warnAt: -75, personnel: 0 }, window.LOG_CONFIG);

  const WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const DAY_MS = 864e5;
  const pad = (n) => String(n).padStart(2, '0');
  const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  const utc = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  const iso = (t) => new Date(t).toISOString().slice(0, 10);
  const dot = (s) => s.replace(/-/g, '.');
  const week = (s) => WEEK[new Date(utc(s)).getUTCDay()];
  const tempNum = (s) => {
    const m = String(s || '').replace('−', '-').match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
  };

  const all = (window.ENTRIES || [])
    .filter((e) => e && isDate(e.date) && e.author)
    .map((e) => {
      const unit = String(e.unit || '').trim().toUpperCase();
      const author = String(e.author).trim();
      return {
        date: e.date,
        unit,
        author,
        who: unit ? `${unit} ${author}` : author,
        id: unit || author,
        time: e.time || '',
        temp: e.temp || '',
        title: e.title || '',
        body: e.body || ''
      };
    })
    .sort((a, b) =>
      a.date.localeCompare(b.date) ||
      a.unit.localeCompare(b.unit, 'en', { numeric: true }) ||
      a.author.localeCompare(b.author, 'ko') ||
      a.time.localeCompare(b.time));

  const seen = {};
  all.forEach((e) => {
    const k = `${e.date}/${e.id}`;
    seen[k] = (seen[k] || 0) + 1;
    e.key = seen[k] > 1 ? `${k}-${seen[k]}` : k;
  });

  const start = isDate(CFG.start) ? CFG.start : (all.length ? all[0].date : iso(Date.now()));
  const dayNo = (d) => Math.round((utc(d) - utc(start)) / DAY_MS) + 1;
  const total = Math.max(CFG.days, all.length ? dayNo(all[all.length - 1].date) : 0);
  const days = Array.from({ length: total }, (_, i) => iso(utc(start) + i * DAY_MS));
  const byDate = (d) => all.filter((e) => e.date === d);

  const sideEl = document.querySelector('.side');
  const heroEl = document.querySelector('.hero');
  const peopleEl = $('people'), fileEl = $('cmdfile'), titleEl = $('title');
  const doneEl = $('done'), restEl = $('rest');
  const prevBtn = $('prev'), nextBtn = $('next');

  let cur = -1;
  let timer = null;
  let fullText = '';
  let wantScroll = false;

  const stamp = (e) => `${e.date} ${e.time}`;
  const latest = all.reduce((a, e) => (!a || stamp(e) > stamp(a) ? e : a), null);
  const personnel = CFG.personnel || new Set(all.map((e) => e.who)).size;
  $('count').textContent = `${all.length} REPORTS · PERSONNEL ${pad(personnel)}`;
  $('upd').textContent = latest
    ? `UPDATED ${dot(latest.date)}${latest.time ? ' ' + latest.time : ''}`
    : 'UPDATED —';
  if (latest) {
    $('alert').textContent =
      `WHITEOUT WARNING · WEDGE · EXT ${latest.temp || '--'} · DAY ${pad(dayNo(latest.date))}/${pad(total)} · STATION LINK LOST`;
  }
  $('prog-total').textContent = pad(total);
  $('badge-total').textContent = `/ ${pad(total)}`;

  function go(key, scroll) {
    wantScroll = scroll;
    if (decodeURIComponent(location.hash.slice(1)) === key) route();
    else location.hash = key.split('/').map(encodeURIComponent).join('/');
  }

  function setFold(open) {
    sideEl.dataset.open = String(open);
    $('fold').setAttribute('aria-expanded', String(open));
    $('foldmark').textContent = open ? '[-]' : '[+]';
  }
  $('fold').addEventListener('click', () => {
    if (!wide.matches) setFold(sideEl.dataset.open !== 'true');
  });

  days.slice(0, 7).forEach((d) => {
    const s = document.createElement('span');
    s.textContent = week(d);
    $('dayhd').appendChild(s);
  });

  const dayBtns = days.map((d, i) => {
    const n = byDate(d).length;
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.date = d;
    b.disabled = !n;
    b.innerHTML = `<span class="d">${pad(i + 1)}</span><span class="c">${d.slice(5).replace('-', '.')}</span>`;
    b.setAttribute('aria-label', `DAY ${i + 1}, ${dot(d)}, 기록 ${n}개`);
    b.addEventListener('click', () => {
      go(byDate(d)[0].key, false);
      setFold(true);
    });
    li.appendChild(b);
    $('days').appendChild(li);
    return b;
  });

  const segs = days.map(() => $('segs').appendChild(document.createElement('i')));

  const squad = (u) => { const m = u.match(/^(?:TETRA-)?([A-Z]+)-\d+$/); return m ? m[1] : ''; };
  const li = (cls, html) => {
    const el = document.createElement('li');
    if (cls) el.className = cls;
    if (html) el.innerHTML = html;
    return el;
  };

  function renderPeople(list, key) {
    peopleEl.textContent = '';
    $('daycnt').textContent = `${list.length} FILES`;

    const hd = li('hd', '<span>NO</span><span>UNIT</span><span>NAME</span><span>TIME</span>');
    hd.setAttribute('aria-hidden', 'true');
    peopleEl.appendChild(hd);

    let lastSq = null, curLi = null;
    list.forEach((e, k) => {
      const sq = squad(e.unit);
      if (sq && sq !== lastSq) {
        const g = li('grp');
        g.textContent = sq;
        g.setAttribute('aria-hidden', 'true');
        peopleEl.appendChild(g);
        lastSq = sq;
      }
      const row = li();
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span class="n"></span><span class="u"></span><span class="a"></span><span class="tm"></span>';
      b.querySelector('.n').textContent = pad(k + 1);
      b.querySelector('.u').textContent = e.unit.replace(/^TETRA-/, '') || '—';
      b.querySelector('.a').textContent = e.author;
      b.querySelector('.tm').textContent = e.time || '--:--';
      b.title = e.who + (e.title ? ` — ${e.title}` : '');
      b.setAttribute('aria-label', e.who);
      if (e.key === key) {
        b.setAttribute('aria-current', 'true');
        row.className = 'cur-row';
        curLi = row;
      }
      b.addEventListener('click', () => {
        if (!wide.matches && sideEl.dataset.open !== 'true') { setFold(true); return; }
        setFold(false);
        go(e.key, true);
      });
      row.appendChild(b);
      peopleEl.appendChild(row);
    });

    if (list.length > 1) {
      const m = li('more');
      const mb = document.createElement('button');
      mb.type = 'button';
      mb.innerHTML = `<span>··· ${list.length - 1} MORE</span><b>[+]</b>`;
      mb.setAttribute('aria-label', `기록자 ${list.length}명 전체 보기`);
      mb.addEventListener('click', () => setFold(true));
      m.appendChild(mb);
      peopleEl.appendChild(m);
    }

    if (curLi && wide.matches) {
      const p = $('peoplePanel');
      const top = curLi.offsetTop;
      if (top < p.scrollTop || top + curLi.offsetHeight > p.scrollTop + p.clientHeight) {
        p.scrollTop = Math.max(0, top - p.clientHeight / 2);
      }
    }
  }

  function finishTyping() {
    clearInterval(timer);
    timer = null;
    doneEl.textContent = fullText;
    restEl.textContent = '';
    doneEl.classList.remove('typing');
  }

  function type(text) {
    clearInterval(timer);
    fullText = text;
    if (reduce || !text) { finishTyping(); return; }
    let p = 0;
    const step = Math.max(1, Math.ceil(text.length / 150));
    doneEl.classList.add('typing');
    doneEl.textContent = '';
    restEl.textContent = text;
    timer = setInterval(() => {
      p = Math.min(text.length, p + step);
      doneEl.textContent = text.slice(0, p);
      restEl.textContent = text.slice(p);
      if (p >= text.length) finishTyping();
    }, 16);
  }

  $('screen').addEventListener('click', (ev) => {
    if (timer && !ev.target.closest('button')) finishTyping();
  });

  function show(i) {
    const e = all[i];
    const n = dayNo(e.date);
    const dayList = byDate(e.date);
    const j = dayList.indexOf(e);
    const t = tempNum(e.temp);
    const danger = t !== null && t <= CFG.warnAt;
    cur = i;

    $('daydir').textContent = e.date;
    fileEl.innerHTML = '<span class="dir"></span><span></span>';
    fileEl.firstChild.textContent = `reports/${e.date}/`;
    fileEl.lastChild.textContent = `${e.id}.rpt`;
    dayBtns.forEach((b) => {
      if (b.dataset.date === e.date) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
    renderPeople(dayList, e.key);

    $('big-temp').textContent = t === null ? '--' : String(t).replace('-', '−');
    $('warn').hidden = !danger;
    heroEl.classList.toggle('danger', danger);
    $('badge-day').textContent = pad(n);
    segs.forEach((s, k) => s.classList.toggle('on', k < n));
    $('prog-day').textContent = pad(n);
    $('prog-pct').textContent = `${Math.round((n / total) * 100)}%`;

    $('h-no').textContent = `RPT-D${pad(n)}-${pad(j + 1)}`;
    $('h-author').textContent = e.who;
    $('h-time').textContent = `${dot(e.date)} ${week(e.date)}${e.time ? ' ' + e.time : ''}`;
    titleEl.textContent = e.title;
    titleEl.hidden = !e.title;
    type(e.body);

    prevBtn.disabled = j <= 0;
    nextBtn.disabled = j >= dayList.length - 1;
    $('pos').textContent = `${pad(j + 1)}/${pad(dayList.length)}`;

    if (wantScroll && !wide.matches) {
      $('cmdline').scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }
    wantScroll = false;
  }

  function route() {
    if (!all.length) {
      fileEl.textContent = 'reports/ (empty)';
      titleEl.textContent = 'NO REPORTS';
      prevBtn.disabled = nextBtn.disabled = true;
      return;
    }
    const key = decodeURIComponent(location.hash.slice(1));
    let i = all.findIndex((e) => e.key === key);
    if (i < 0 && isDate(key)) i = all.findIndex((e) => e.date === key);
    show(i >= 0 ? i : all.indexOf(latest));
  }

  const sameDay = (k) => all[k] && all[k].date === all[cur].date;
  prevBtn.addEventListener('click', () => { if (sameDay(cur - 1)) go(all[cur - 1].key, false); });
  nextBtn.addEventListener('click', () => { if (sameDay(cur + 1)) go(all[cur + 1].key, false); });
  addEventListener('hashchange', route);
  addEventListener('keydown', (ev) => {
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (ev.key === 'ArrowLeft') prevBtn.click();
    if (ev.key === 'ArrowRight') nextBtn.click();
  });

  setFold(false);
  route();
  // 시계 · 눈보라는 ../assets/tetra.js
})();
