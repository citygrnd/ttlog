/* TETRA 효과음 — 파일 없이 브라우저(Web Audio)에서 합성
   - 기본은 꺼짐. 상단 바의 [SND OFF] 버튼으로 켜고, 켠 상태는 이 브라우저에 기억 (localStorage 'tetra-sfx')
   - 브라우저 규칙상 사용자가 한 번 누르기 전에는 소리가 나지 않음
   - 공통: 버튼·링크 클릭 = tick, 방향키 이동 = blip
     요소에 data-sfx="이름" 을 달면 그 소리, data-sfx="none" 이면 소리 없음
   - 페이지에서 직접: TETRA_SFX.play('connect' | 'deny' | 'radio' | 'mimic' | 'alarm' | 'tick' | 'blip')

   페이지에서는 tetra.js 다음에 불러온다.  <script src="../assets/sfx.js"></script> */
(() => {
  'use strict';

  const KEY = 'tetra-sfx';
  let on = false;
  try { on = localStorage.getItem(KEY) === 'on'; } catch (e) {}
  let ctx = null, master = null;

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;   // 전체 볼륨
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* ── 소리 재료 ── */
  function tone(type, f0, f1, dur, vol, delay = 0) {
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, filterType, freq, q = 1, delay = 0) {
    const t = ctx.currentTime + delay;
    const len = Math.ceil(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = filterType; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(master);
    src.start(t); src.stop(t + dur + 0.02);
  }

  // 잡음이 일정하지 않고 지글지글 끊기는 소리 (신호 불안정)
  function choppyNoise(delay, dur, vol, freq, q, step) {
    const t0 = ctx.currentTime + delay;
    const len = Math.ceil(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    for (let t = 0; t < dur; t += step) {
      const v = Math.random() < 0.25 ? vol * 0.08 : vol * (0.45 + Math.random() * 0.55);
      g.gain.setValueAtTime(v, t0 + t);
      f.frequency.setValueAtTime(freq * (0.8 + Math.random() * 0.4), t0 + t);
    }
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(master);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }
  // 기괴한 웅얼거림: 사람인 척하는 무언가. 끝나는 시각을 돌려줌
  //  - 어긋난 두 목소리(박자·음높이가 살짝 다름) + 쇳소리 링 모듈레이션 + 찌그러짐 + 쉰 숨결
  //  - 음절은 천천히 커졌다 뚝 끊김(거꾸로 말하는 느낌), 음절마다 음높이가 제멋대로 튐
  //  - 중간에 한 음절을 빠르게 4번 더듬고, 마지막 음절은 길게 늘어지며 땅속까지 꺼짐
  function voice(delay, dur) {
    const t0 = ctx.currentTime + delay;

    // 음절 계획: [시작, 길이, 음높이배수, 모음]
    const vowels = [[700, 1200], [350, 2300], [600, 1000], [280, 850], [520, 1700], [450, 900]];
    const syls = [];
    let t = 0;
    while (t < dur - 0.45) {
      const len = 0.09 + Math.random() * 0.17;
      syls.push([t, len, 0.75 + Math.random() * 0.7, vowels[Math.floor(Math.random() * vowels.length)]]);
      t += len + 0.025 + Math.random() * 0.06;
      if (syls.length === 3) {                               // 말더듬기: 같은 음절 4번
        const v = syls[2][3];
        for (let r = 0; r < 4; r++) { syls.push([t, 0.055, 1.25, v]); t += 0.075; }
      }
    }
    const lastLen = Math.max(0.35, dur - t);                 // 마지막: 길게 늘어지는 음절 (최소 0.35초)
    syls.push([t, lastLen, 1, vowels[3]]);
    dur = t + lastLen;
    const tEnd = t0 + dur;

    // 공통 처리: 모음 필터 2개 → 찌그러짐 → 링 모듈레이션(일부) → 출력
    const f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter();
    f1.type = f2.type = 'bandpass'; f1.Q.value = 7; f2.Q.value = 9;
    const env = ctx.createGain(); env.gain.setValueAtTime(0.0001, t0);
    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(x * 4.5) * 0.9; }
    shaper.curve = curve;
    const ring = ctx.createGain(); ring.gain.value = 0;      // 입력 × 37Hz 사인파 = 쇳소리
    const ringOsc = ctx.createOscillator(); ringOsc.frequency.value = 37;
    ringOsc.connect(ring.gain);
    const dry = ctx.createGain(); dry.gain.value = 0.55;
    const wet = ctx.createGain(); wet.gain.value = 0.7;
    const out = ctx.createGain(); out.gain.value = 0.3;
    f1.connect(env); f2.connect(env);
    env.connect(shaper);
    shaper.connect(dry).connect(out);
    shaper.connect(ring); ring.connect(wet).connect(out);
    out.connect(master);

    // 어긋난 두 목소리
    const voices = [{ base: 132, lag: 0, type: 'sawtooth', vol: 1 }, { base: 96, lag: 0.045, type: 'square', vol: 0.55 }];
    const oscs = voices.map((v) => {
      const o = ctx.createOscillator(); o.type = v.type;
      const g = ctx.createGain(); g.gain.value = v.vol;
      o.connect(g); g.connect(f1); g.connect(f2);
      syls.forEach(([st, , p], i) => {
        const at = t0 + st + v.lag;
        const last = i === syls.length - 1;
        o.frequency.setValueAtTime(v.base * p * (1 - (st / dur) * 0.35), at);
        if (last) o.frequency.exponentialRampToValueAtTime(v.base * 0.22, tEnd);   // 땅속까지 꺼짐
      });
      return o;
    });
    // 떨림 (불규칙하게 크게)
    const vib = ctx.createOscillator(), vibG = ctx.createGain();
    vib.frequency.value = 7.3; vibG.gain.value = 14;
    vib.connect(vibG); oscs.forEach((o) => vibG.connect(o.frequency));

    // 쉰 숨결 층 (같은 모음 필터 통과)
    const nLen = Math.ceil(ctx.sampleRate * (dur + 0.1));
    const nBuf = ctx.createBuffer(1, nLen, ctx.sampleRate), nd = nBuf.getChannelData(0);
    for (let i = 0; i < nLen; i++) nd[i] = Math.random() * 2 - 1;
    const breath = ctx.createBufferSource(); breath.buffer = nBuf;
    const bG = ctx.createGain(); bG.gain.value = 0.45;
    breath.connect(bG); bG.connect(f1); bG.connect(f2);

    // 음절 소리 모양: 천천히 커졌다 뚝 끊김, 모음 필터 이동
    syls.forEach(([st, len, , [a, b]], i) => {
      const at = t0 + st, last = i === syls.length - 1;
      const sink = 1 - (st / dur) * 0.4;
      f1.frequency.setValueAtTime(a * sink, at);
      f2.frequency.setValueAtTime(b * sink, at);
      env.gain.setValueAtTime(0.0001, at);
      env.gain.setTargetAtTime(0.9, at, last ? 0.12 : len * 0.45);
      if (!last) env.gain.setValueAtTime(0.0001, at + len);   // 뚝
    });
    env.gain.setTargetAtTime(0.0001, tEnd - 0.05, 0.02);

    [...oscs, vib, ringOsc, breath].forEach((n) => { n.start(t0); n.stop(tEnd + 0.06); });
    return delay + dur;
  }
  // 아주 낮은 저음이 점점 커짐 (끝 시각에 뚝 끊김)
  function drone(delay, end) {
    const t0 = ctx.currentTime + delay, t1 = ctx.currentTime + end;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(55, t0); o.frequency.linearRampToValueAtTime(44, t1);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.35, t1 - 0.01);
    g.gain.setValueAtTime(0.0001, t1);
    o.connect(g).connect(master);
    o.start(t0); o.stop(t1 + 0.02);
  }

  /* ── 효과음 ── */
  const SOUNDS = {
    // 기계식 키 클릭
    tick() { noise(0.025, 0.5, 'highpass', 3500, 0.7); tone('square', 2400, 1800, 0.018, 0.06); },
    // 메뉴 커서 이동
    blip() { tone('square', 880, 660, 0.045, 0.07); },
    // HUB 접속: 짧은 모뎀 핸드셰이크
    connect() {
      tone('sine', 1200, 1200, 0.09, 0.12);
      tone('sine', 2100, 2100, 0.09, 0.1, 0.1);
      noise(0.16, 0.18, 'bandpass', 1800, 2, 0.2);
      tone('square', 1650, 2400, 0.1, 0.05, 0.22);
      tone('sine', 980, 980, 0.07, 0.1, 0.38);
    },
    // 접근 거부 버저
    deny() { tone('square', 120, 110, 0.22, 0.16); tone('square', 123, 112, 0.22, 0.1); },
    // COMMS 채널 전환 (UNKNOWN 등 모방 의심 채널 제외 모두 같은 소리):
    // 무전기 다이얼 딸깍 → 길고 많이 끊기는 잡음 → 스퀠치 닫힘. 확인음 없음
    radio() {
      tone('square', 1900, 1500, 0.012, 0.09);        // 다이얼 딸깍
      noise(0.01, 0.4, 'highpass', 5000, 0.7);
      const dur = 0.43;
      choppyNoise(0.02, dur, 0.33, 1500 + Math.random() * 600, 0.96, 0.065);
      noise(0.06, 0.32, 'highpass', 2600, 0.8, 0.02 + dur);     // 스퀠치 닫힘 "크쉬"
    },
    // 모방 의심 채널: 거친 잡음 → 사람 목소리 같은(말은 아닌) 웅얼거림이 낮게 늘어지며 떨어짐 → 저음이 커지다 툭 끊김
    mimic() {
      choppyNoise(0, 0.3, 0.34, 1100, 1.1, 0.03);
      const end = voice(0.2, 1.2);   // 전체 약 1.4초
      drone(0.25, end);
      noise(0.02, 0.5, 'highpass', 3000, 0.7, end);   // 끊기는 "툭"
      tone('square', 90, 60, 0.04, 0.12, end);
    },
    // 위험 경보 2회
    alarm() { tone('square', 1400, 1400, 0.09, 0.12); tone('square', 1400, 1400, 0.09, 0.12, 0.14); }
  };

  function play(name, opt) {
    if (!on || !SOUNDS[name]) return;
    if (!audio()) return;
    try { SOUNDS[name](opt); } catch (e) { if (window.TETRA_SFX_DEBUG) throw e; }   // 테스트할 때만 오류를 드러냄
  }

  /* ── 상단 바 [SND OFF/ON] 버튼 ── */
  function setOn(v) {
    on = v;
    try { localStorage.setItem(KEY, v ? 'on' : 'off'); } catch (e) {}
    document.querySelectorAll('.snd').forEach((b) => {
      b.lastChild.textContent = v ? ' ON' : ' OFF';   // 좁은 화면에서는 이 부분을 숨기고 'SND' 만 (밝기로 켜짐 표시)
      b.setAttribute('aria-pressed', String(v));
    });
  }
  function addToggle() {
    const bar = document.querySelector('.bar');
    if (!bar || bar.querySelector('.snd')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'snd';
    b.dataset.sfx = 'none';
    b.setAttribute('aria-label', '효과음 켜기/끄기');
    const lab = document.createElement('span'), st = document.createElement('span');
    lab.textContent = 'SND';
    st.className = 'snd-st';
    b.append(lab, st);
    b.addEventListener('click', () => { setOn(!on); if (on) { audio(); play('blip'); } });
    const clock = bar.querySelector('.clock');
    bar.insertBefore(b, clock || null);
    setOn(on);
  }

  /* ── 공통 연결: 클릭 = tick (또는 data-sfx), 방향키 = blip ── */
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest && ev.target.closest('button, a, [data-sfx]');
    if (!el) return;
    const s = el.dataset.sfx;
    if (s === 'none') return;
    play(s || 'tick');
  }, true);
  document.addEventListener('keydown', (ev) => {
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (/^Arrow(Up|Down|Left|Right)$/.test(ev.key)) play('blip');
  }, true);

  window.TETRA_SFX = Object.freeze({ play, get enabled() { return on; } });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addToggle);
  else addToggle();
})();
