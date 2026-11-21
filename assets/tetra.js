/* TETRA 공통 스크립트
   - 상단 시계: #clock 이 있으면 1초마다 HH:MM:SS
   - 눈보라 배경: canvas#snow 가 있으면 시작 (TETRA LOG 방식: 바람 + 돌풍)
   - prefers-reduced-motion 이면 눈보라를 그리지 않는다
   - a.home(◀ HUB) 링크: 파일로 열었을 때 index.html 을 붙여 준다
   - 공통 유틸은 window.TETRA 로 내보낸다

   페이지에서는 이 파일을 페이지 스크립트보다 먼저 불러온다.
   <script src="../assets/tetra.js" defer></script>
*/
(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = (n) => String(n).padStart(2, '0');
  const hhmmss = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

  window.TETRA = Object.freeze({ reduce, pad, hhmmss });

  function startClock() {
    const el = document.getElementById('clock');
    if (!el) return;
    const tick = () => { el.textContent = hhmmss(new Date()); };
    tick();
    setInterval(tick, 1000);
  }

  function startSnow() {
    const c = document.getElementById('snow');
    if (reduce || !c || !c.getContext) return;
    const ctx = c.getContext('2d');
    let w = 0, h = 0, flakes = [], raf = 0, t = 0, gust = 0;

    const spawn = (f, anywhere) => {
      f.z = Math.random();
      f.r = 0.6 + f.z * 1.9;
      f.vy = 0.9 + f.z * 2.4;
      f.ph = Math.random() * 6.28;
      if (anywhere) { f.x = Math.random() * w; f.y = Math.random() * h; }
      else if (Math.random() < 0.45) { f.x = -10; f.y = Math.random() * h; }
      else { f.x = Math.random() * w; f.y = -10; }
      return f;
    };

    const size = () => {
      if (innerWidth === w && flakes.length) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      flakes = Array.from({ length: Math.min(200, Math.round(w / 6)) }, () => spawn({}, true));
    };

    const frame = () => {
      t++;
      if (Math.random() < 0.004) gust = 2.5 + Math.random() * 3.5;
      gust *= 0.985;
      const wind = 1.2 + Math.sin(t * 0.004) * 0.8 + gust;

      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';
      for (const f of flakes) {
        const dx = wind * (0.4 + f.z) + Math.sin(f.ph + t * 0.02) * 0.3;
        f.x += dx; f.y += f.vy;
        if (f.y > h + 10 || f.x > w + 20) spawn(f, false);
        ctx.strokeStyle = `rgba(235, 238, 240, ${0.08 + f.z * 0.22})`;
        ctx.lineWidth = f.r;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x - dx * 2.2, f.y - f.vy * 2.2);
        ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    };

    size(); frame();
    addEventListener('resize', size);
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) frame();
    });
  }

  // PC에서 파일로 직접 열면 '../' 가 폴더 목록이 되므로 HUB 링크에 index.html 을 붙인다 (서버에서는 그대로)
  function fixHome() {
    if (location.protocol !== 'file:') return;
    document.querySelectorAll('a.home').forEach((a) => {
      const h = a.getAttribute('href') || '';
      if (h.endsWith('/')) a.setAttribute('href', h + 'index.html');
    });
  }

  const init = () => { fixHome(); startClock(); startSnow(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
