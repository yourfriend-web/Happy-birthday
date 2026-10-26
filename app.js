/* ═══════════════════════════════════════════════════════════════
   HARIOM Birthday — app logic
   ─────────────────────────────────────────────────────────────
   ✏️  APNI DETAILS js/config.js ME DALO — wahan naam, birthday
       date/time aur WhatsApp number sab kuch hai.
       Ye file (app.js) ko badalne ki zaroorat nahi hai.
   ═══════════════════════════════════════════════════════════════ */

const CONFIG = window.CONFIG || {
  name: "HARIOM",
  birthday: { year: null, month: 1, day: 1, hour: 0, minute: 0 },
  phone: "91XXXXXXXXXX",
  waText: "Hii",
};

/* ── personalize ── */
document.querySelectorAll('[data-name]').forEach(el => { el.textContent = CONFIG.name; });
document.title = `Happy Birthday ${CONFIG.name} 🎂`;
document.getElementById('numReveal').textContent = formatPhone(CONFIG.phone);
document.getElementById('waBtn').href = `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(CONFIG.waText)}`;

function formatPhone(p) {
  if (!/^\d{11,13}$/.test(p)) return p; // not configured yet — show as-is
  const cc = p.startsWith('91') ? '+91 ' : '+' + p.slice(0, p.length - 10) + ' ';
  const rest = p.slice(-10);
  return cc + rest.slice(0, 5) + ' ' + rest.slice(5);
}

/* ═══════════ SCREEN ROUTER ═══════════ */
const screens = document.querySelectorAll('.screen');
function showScreen(id) {
  screens.forEach(s => s.classList.add('hidden'));
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  window.scrollTo({ top: 0 });
  // replay entrance animations
  el.querySelectorAll('.fade-up').forEach(f => {
    f.style.animation = 'none';
    void f.offsetWidth;
    f.style.animation = '';
  });
}

function confettiBurst(power = 1) {
  if (!window.confetti) return;
  const opts = { spread: 78, ticks: 220, gravity: 0.9, decay: 0.93, startVelocity: 42,
    colors: ['#fde68a', '#fb923c', '#fb7185', '#e879f9', '#a78bfa'] };
  confetti({ ...opts, particleCount: Math.round(90 * power), origin: { x: 0.5, y: 0.6 } });
  if (power >= 1.5) {
    setTimeout(() => confetti({ ...opts, particleCount: 70, origin: { x: 0.15, y: 0.7 } }), 220);
    setTimeout(() => confetti({ ...opts, particleCount: 70, origin: { x: 0.85, y: 0.7 } }), 380);
  }
}

/* preloader — curtain reveal once page is ready */
(function initPreloader() {
  const pre = document.getElementById('preloader');
  const hide = () => pre.classList.add('done');
  if (document.readyState === 'complete') setTimeout(hide, 1000);
  else window.addEventListener('load', () => setTimeout(hide, 1000));
  setTimeout(hide, 4500); // safety fallback
})();

/* ═══════════ SOUND EFFECTS (WebAudio synth — no files) ═══════════ */
const SFX = (() => {
  let ctx = null;
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function noise(c, dur) {
    const b = c.createBuffer(1, Math.max(1, c.sampleRate * dur | 0), c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function tone(c, freq, t0, dur, vol, type = 'sine') {
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
    return o;
  }
  return {
    flick() { // candle catching fire
      const c = ac(); if (!c) return; const t = c.currentTime;
      const o = tone(c, 900, t, 0.14, 0.1);
      o.frequency.exponentialRampToValueAtTime(1500, t + 0.09);
      const n = c.createBufferSource(); n.buffer = noise(c, 0.08);
      const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3200;
      const g = c.createGain();
      g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      n.connect(hp).connect(g).connect(c.destination); n.start(t);
    },
    whoosh() { // blowing out a candle
      const c = ac(); if (!c) return; const t = c.currentTime;
      const n = c.createBufferSource(); n.buffer = noise(c, 0.55);
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.1;
      f.frequency.setValueAtTime(1900, t);
      f.frequency.exponentialRampToValueAtTime(280, t + 0.5);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.15, t + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      n.connect(f).connect(g).connect(c.destination); n.start(t);
    },
    click() {
      const c = ac(); if (!c) return; const t = c.currentTime;
      const o = tone(c, 2100, t, 0.05, 0.05, 'square');
      o.frequency.exponentialRampToValueAtTime(1200, t + 0.04);
    },
    pop() { // balloon burst
      const c = ac(); if (!c) return; const t = c.currentTime;
      const n = c.createBufferSource(); n.buffer = noise(c, 0.09);
      const g = c.createGain();
      g.gain.setValueAtTime(0.22, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      n.connect(g).connect(c.destination); n.start(t);
      const o = tone(c, 420, t, 0.1, 0.1, 'triangle');
      o.frequency.exponentialRampToValueAtTime(70, t + 0.1);
    },
    chime(big = false) {
      const c = ac(); if (!c) return; const t = c.currentTime;
      const notes = big ? [880, 1108.7, 1318.5, 1760] : [880, 1174.7, 1568];
      notes.forEach((f, i) => tone(c, f, t + i * 0.09, 0.7, 0.07));
    },
  };
})();

/* ═══════════ 1. COUNTDOWN (real-time, never hardcoded) ═══════════ */
const cdEls = {
  d: document.getElementById('cdDays'), h: document.getElementById('cdHours'),
  m: document.getElementById('cdMins'), s: document.getElementById('cdSecs'),
};
let lastVals = {};
function nextBirthday() {
  const now = new Date();
  const bd = CONFIG.birthday;
  const H = bd.hour || 0, M = bd.minute || 0;
  let target = new Date(now.getFullYear(), bd.month - 1, bd.day, H, M, 0);
  const todayKey = `${now.getMonth()}-${now.getDate()}`;
  const bdKey = `${bd.month - 1}-${bd.day}`;
  if (todayKey === bdKey) return 'today';
  if (target <= now) target = new Date(now.getFullYear() + 1, bd.month - 1, bd.day, H, M);
  return target;
}
function tickCountdown() {
  const t = nextBirthday();
  if (t === 'today') {
    document.getElementById('birthdayToday').classList.remove('hidden');
    document.getElementById('countdownWrap').classList.add('hidden');
    return;
  }
  const diff = t - new Date();
  const d = Math.floor(diff / 864e5);
  const h = Math.floor(diff % 864e5 / 36e5);
  const m = Math.floor(diff % 36e5 / 6e4);
  const s = Math.floor(diff % 6e4 / 1e3);
  const vals = { d, h, m, s };
  for (const k in vals) {
    const str = String(vals[k]).padStart(2, '0');
    if (lastVals[k] !== str) {
      cdEls[k].textContent = str;
      cdEls[k].classList.remove('flip');
      void cdEls[k].offsetWidth;
      cdEls[k].classList.add('flip');
      lastVals[k] = str;
    }
  }
}
tickCountdown();
setInterval(tickCountdown, 1000);

/* ═══════════ MUSIC — soft birthday melody loop (WebAudio, no files) ═══════════ */
const Music = (() => {
  let ctx = null, playing = false, timer = null;
  const btn = document.getElementById('musicBtn');
  const iconOn = document.getElementById('iconMusicOn');
  const iconOff = document.getElementById('iconMusicOff');

  // Happy Birthday melody: [semitone offset from C4, beats]
  const C4 = 261.63, W = Math.pow(2, 1 / 12);
  const f = n => C4 * Math.pow(W, n);
  const melody = [
    [7, .75], [7, .25], [9, 1], [7, 1], [12, 1], [11, 2],
    [7, .75], [7, .25], [9, 1], [7, 1], [14, 1], [12, 2],
    [7, .75], [7, .25], [19, 1], [16, 1], [12, 1], [11, 1], [9, 2],
    [17, .75], [17, .25], [16, 1], [12, 1], [14, 1], [12, 2], [null, 2],
  ];

  function playNote(freq, dur, when) {
    if (!freq) return;
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o2.type = 'triangle';
    o.frequency.value = freq; o2.frequency.value = freq * 2.001;
    const vol = 0.09;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol, when + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur * 0.95);
    const g2 = ctx.createGain(); g2.gain.value = 0.25;
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(ctx.destination);
    o.start(when); o2.start(when);
    o.stop(when + dur); o2.stop(when + dur);
  }

  function scheduleLoop() {
    if (!playing) return;
    const beat = 0.42; // seconds per beat
    let t = ctx.currentTime + 0.1;
    melody.forEach(([n, b]) => { playNote(f(n), b * beat, t); t += b * beat; });
    const loopLen = (t - ctx.currentTime) + 1.2;
    timer = setTimeout(scheduleLoop, loopLen * 1000);
  }

  function start() {
    if (playing) return;
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    playing = true;
    scheduleLoop();
    btn.classList.add('playing');
    iconOn.classList.remove('hidden');
    iconOff.classList.add('hidden');
  }
  function stop() {
    playing = false;
    clearTimeout(timer);
    btn.classList.remove('playing');
    iconOn.classList.add('hidden');
    iconOff.classList.remove('hidden');
  }
  btn.addEventListener('click', () => (playing ? stop() : start()));
  return { start, stop };
})();

/* ═══════════ 1b. LIVE STATS — "you've lived" ═══════════ */
let statsTimer = null, statsAuto = null;
function startStats() {
  const y = CONFIG.birthday.year;
  if (!y || y < 1900 || y > new Date().getFullYear()) { showScreen('screen-cake'); return; }
  showScreen('screen-stats');

  const birth = new Date(y, CONFIG.birthday.month - 1, CONFIG.birthday.day, CONFIG.birthday.hour || 0, CONFIG.birthday.minute || 0, 0);
  const els = {
    d: document.getElementById('stDays'), h: document.getElementById('stHours'),
    m: document.getElementById('stMins'), b: document.getElementById('stBeats'),
    mo: document.getElementById('stMoons'), o: document.getElementById('stOrbits'),
  };
  const fmt = n => n.toLocaleString('en-IN');

  function tickStats() {
    const diff = Date.now() - birth.getTime();
    const mins = Math.floor(diff / 6e4);
    els.d.textContent = fmt(Math.floor(mins / 1440));
    els.h.textContent = fmt(Math.floor(mins / 60));
    els.m.textContent = fmt(mins);
    els.b.textContent = fmt(Math.floor(mins * 1.2)); // ~72 bpm average
    els.mo.textContent = fmt(Math.floor(mins / 1440 / 29.53));
    els.o.textContent = fmt(Math.floor(mins / 1440 / 365.25));
  }
  tickStats();
  clearInterval(statsTimer);
  statsTimer = setInterval(tickStats, 1000);

  clearTimeout(statsAuto);
  statsAuto = setTimeout(() => { clearInterval(statsTimer); showScreen('screen-cake'); confettiBurst(1.2); }, 14000);
}
document.getElementById('btnStatsSkip').addEventListener('click', () => {
  clearInterval(statsTimer); clearTimeout(statsAuto);
  showScreen('screen-cake');
  confettiBurst(1.2);
});

/* ═══════════ 2. CAKE — light & blow candles ═══════════ */
(function initCake() {
  const row = document.getElementById('candleRow');
  const hint = document.getElementById('cakeHint');
  const glow = document.getElementById('cakeGlow');
  const NUM = 5;
  const candles = [];
  for (let i = 0; i < NUM; i++) {
    const c = document.createElement('div');
    c.className = 'candle';
    c.style.height = (54 + Math.random() * 16) + 'px';
    c.innerHTML = '<span class="flame"></span>';
    row.appendChild(c);
    candles.push(c);
  }

  let phase = 'lighting'; // lighting → blowing → done
  candles.forEach(c => {
    c.addEventListener('click', () => {
      if (phase === 'lighting' && !c.classList.contains('lit')) {
        c.classList.add('lit');
        SFX.flick();
        if (candles.every(x => x.classList.contains('lit'))) {
          phase = 'blowing';
          glow.classList.add('on');
          hint.textContent = 'Wah! Ab flames tap karke bujhao 🌬️';
          confettiBurst(0.4);
        } else {
          hint.textContent = `${candles.filter(x => x.classList.contains('lit')).length} jal gayi — aage badho!`;
        }
      } else if (phase === 'blowing' && c.classList.contains('lit')) {
        c.classList.remove('lit');
        c.classList.add('smoke');
        SFX.whoosh();
        setTimeout(() => c.classList.remove('smoke'), 1500);
        if (candles.every(x => !x.classList.contains('lit'))) {
          phase = 'done';
          glow.classList.remove('on');
          hint.textContent = 'Wish poori ho gayi. Ab officially shuru hota hai 🎉';
          confettiBurst(1.6);
          SFX.chime(true);
          setTimeout(revealWishes, 900);
        } else {
          hint.textContent = `${candles.filter(x => x.classList.contains('lit')).length} aur baaki hain…`;
        }
      }
    });
  });

  function revealWishes() {
    const box = document.getElementById('wishesBox');
    box.classList.remove('hidden');
    box.querySelectorAll('.wish-card').forEach((card, i) => {
      card.style.animationDelay = (i * 0.35) + 's';
    });
    document.getElementById('btnToGift').classList.remove('hidden');
  }
})();

/* ═══════════ 3. FLOW WIRING ═══════════ */
document.getElementById('btnStart').addEventListener('click', () => {
  Music.start();
  SFX.chime();
  startStats();
});
document.getElementById('btnToGift').addEventListener('click', () => startGame());

/* photo gate: No button keeps pleading, Yes proceeds */
const pgNoLines = [
  'Arre, ek chance to banta hai 😏',
  'Pakka? Soch lo… ye to precious hai!',
  'Gift abhi ro raha hai 🥺',
  'Okay… ye button to dil tod gaya 💔',
];
let pgNoCount = 0;
document.getElementById('pgNo').addEventListener('click', function () {
  this.textContent = pgNoLines[Math.min(pgNoCount, pgNoLines.length - 1)];
  pgNoCount++;
  if (pgNoCount >= 4) {
    this.textContent = '…theek hai, main chhup jata hoon 😌';
    this.style.opacity = '0.35';
    this.disabled = true;
  }
});
document.getElementById('pgYes').addEventListener('click', () => {
  showScreen('screen-tease');
  startTeaseP1();
});

/* ═══════════ 4. PHOTO TEASES ═══════════ */
const teaseScreens = ['teaseP1', 'teaseP2', 'teaseP3', 'teaseP4', 'teaseP5', 'teaseP6'];
function showTease(id) {
  teaseScreens.forEach(t => document.getElementById(t).classList.add('hidden'));
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  el.querySelectorAll('.fade-up').forEach(f => { f.style.animation = 'none'; void f.offsetWidth; f.style.animation = ''; });
}

/* P1 — slow "wrapping" progress, then a dodging button */
function startTeaseP1() {
  const bar = document.getElementById('p1Bar');
  const status = document.getElementById('p1Status');
  const btn = document.getElementById('p1Reveal');
  const steps = [
    'Gubbaron ko phula rahe hain…', 'Cake dobara bake ho raha hai…', 'Yaadon ko polish kar rahe hain…',
    'Extra pyaar daala ja raha hai…', 'Bas taiyar, promise…', 'Ribbon bandhi ja rahi hai… 🎀',
  ];
  let p = 0, si = 0;
  status.textContent = steps[0];
  const iv = setInterval(() => {
    p += 4 + Math.random() * 5;
    bar.style.width = Math.min(p, 100) + '%';
    if (p > (si + 1) * 17 && si < steps.length - 1) status.textContent = steps[++si];
    if (p >= 100) {
      clearInterval(iv);
      status.textContent = 'Pack ho gaya! ✨';
      setTimeout(() => btn.classList.remove('hidden'), 500);
    }
  }, 400);

  /* button dodges 3 times, then behaves */
  let dodges = 0;
  const taunts = ['Oops! Too slow 😜', 'Bas door tha! Phir se 🤭', 'Hehe, aakhri mauka…'];
  const dodge = () => {
    if (dodges >= 3) return;
    const maxX = Math.max(90, window.innerWidth * 0.28);
    const maxY = Math.max(70, window.innerHeight * 0.18);
    const dx = (Math.random() - 0.5) * 2 * maxX;
    const dy = (Math.random() - 0.5) * 2 * maxY;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
    status.textContent = taunts[dodges];
    dodges++;
  };
  btn.addEventListener('pointerenter', dodge);
  btn.addEventListener('touchstart', dodge, { passive: true });
  btn.addEventListener('click', () => {
    if (dodges >= 3) {
      btn.style.transform = '';
      startTeaseP2();
    }
  });
}

/* P2 — corner hunt: spark hops top-right → bottom-left → top-left, then moves on */
function startTeaseP2() {
  showTease('teaseP2');
  const spark = document.getElementById('p2Spark');
  const hintEl = document.getElementById('p2Hint');
  const spots = [
    { name: 'upar-right corner', pos: { top: '90px', right: '20px' }, wait: 5000 },
    { name: 'niche-left corner', pos: { bottom: '110px', left: '24px' }, wait: 5000 },
    { name: 'upar-left corner', pos: { top: '90px', left: '24px' }, wait: 6000 },
  ];
  let i = 0, timeoutId = null;

  function place() {
    const s = spots[i];
    hintEl.innerHTML = `Look at the <span class="text-amber-300 font-bold">${s.name}</span>…`;
    spark.className = 'corner-spark';
    Object.assign(spark.style, { top: '', right: '', bottom: '', left: '' });
    Object.assign(spark.style, s.pos);
    spark.style.pointerEvents = 'auto';
    spark.style.cursor = 'pointer';
    spark.classList.remove('hidden');
    timeoutId = setTimeout(() => { i = (i + 1) % spots.length; place(); }, s.wait);
  }

  spark.onclick = () => {
    clearTimeout(timeoutId);
    i++;
    if (i >= spots.length) {
      spark.classList.add('hidden');
      hintEl.innerHTML = 'Okay okay, asli me <span class="text-amber-300 font-bold">yahin hai</span> 😅';
      confettiBurst(0.5);
      setTimeout(startTeaseP3, 1800);
    } else {
      hintEl.textContent = 'Too slow! Wo bhag gaya 😆';
      setTimeout(place, 900);
    }
  };
  place();
}

/* P3 — hold the button for 10 seconds */
function startTeaseP3() {
  showTease('teaseP3');
  const btn = document.getElementById('p3Hold');
  const fill = document.getElementById('p3Fill');
  const label = document.getElementById('p3HoldLabel');
  const taunt = document.getElementById('p3Taunt');
  const DURATION = 10000;
  let raf = null, startT = 0, releasedOnce = false;
  const taunts = ['Arre! Pakad ke rakho 😤', 'Haath chhoot gaya! One more try 🤏', 'So close… don\u2019t let go!'];

  function tick(now) {
    const p = Math.min((now - startT) / DURATION, 1);
    fill.style.width = (p * 100) + '%';
    label.textContent = Math.ceil((1 - p) * 10) + 's…';
    if (p >= 1) {
      cancelAnimationFrame(raf); raf = null;
      taunt.textContent = '';
      label.textContent = 'Sachche dost! 💯';
      confettiBurst(0.7);
      setTimeout(startTeaseP4, 1200);
      return;
    }
    raf = requestAnimationFrame(tick);
  }
  function down(e) {
    if (raf) return;
    e.preventDefault();
    startT = performance.now();
    raf = requestAnimationFrame(tick);
  }
  function up() {
    if (!raf) return;
    cancelAnimationFrame(raf); raf = null;
    fill.style.width = '0%';
    label.textContent = 'Pakad ke rakho…';
    taunt.textContent = taunts[Math.min(releasedOnce ? 1 : 0, taunts.length - 1)];
    releasedOnce = true;
  }
  btn.onpointerdown = down;
  btn.onpointerup = up;
  btn.onpointerleave = up;
}

/* P4 — dramatic decryption, 10s of suspense */
function startTeaseP4() {
  showTease('teaseP4');
  const status = document.getElementById('p4Status');
  const msgs = [
    'Friendship firewall bypass ho raha hai…', 'Memories decrypt ho rahi hain 🔐',
    '24-carat encryption lagayi ja rahi hai…', 'Cuteness overload ka scan ho raha hai…',
    '4K glow me render ho raha hai…', 'Aakhri touch — thoda sa charm ✨',
  ];
  let i = 0;
  status.textContent = msgs[0];
  const iv = setInterval(() => {
    i++;
    if (i >= msgs.length) {
      clearInterval(iv);
      status.textContent = 'Taiyar! 🎊';
      setTimeout(startTeaseP5, 800);
    } else status.textContent = msgs[i];
  }, 1750);
}

/* P5 — final yes-check; "No" just gets funnier */
const p5NoLines = ['Umm… nahi', 'Pakka nahi?', 'Okay, ye button haar gaya 😅'];
let p5NoIdx = 0;
function startTeaseP5() {
  showTease('teaseP5');
  const noBtn = document.getElementById('p5No');
  noBtn.textContent = p5NoLines[0];
  noBtn.onclick = () => {
    p5NoIdx = Math.min(p5NoIdx + 1, p5NoLines.length - 1);
    noBtn.textContent = p5NoLines[p5NoIdx];
    noBtn.style.transform = `translate(${(Math.random() - 0.5) * 60}px, ${(Math.random() - 0.5) * 30}px) scale(${1 - p5NoIdx * 0.12})`;
  };
  document.getElementById('p5Yes').onclick = () => startTeaseP6();
}

/* P6 — tap 5 times to unblur the photo */
function startTeaseP6() {
  showTease('teaseP6');
  const img = document.getElementById('giftPhoto');
  const cnt = document.getElementById('p6Count');
  const hint = document.getElementById('p6Hint');
  const blurClasses = ['blur-strong', 'blur-4', 'blur-3', 'blur-2', 'blur-1', ''];
  let taps = 0, locked = false;
  img.onclick = () => {
    if (locked || taps >= 5) return;
    taps++;
    img.classList.remove(blurClasses[taps - 1]);
    if (blurClasses[taps]) img.classList.add(blurClasses[taps]);
    confettiBurst(0.35);
    const left = 5 - taps;
    if (left > 0) cnt.textContent = left;
    else {
      locked = true;
      hint.textContent = 'Khol diya! 🎁';
      confettiBurst(1.8);
      setTimeout(() => showScreen('screen-photo'), 1400);
    }
  };
}

document.getElementById('btnToNumber').addEventListener('click', () => {
  showScreen('screen-letter');
  initLetter();
});

/* ═══════════ BALLOON POP GAME ═══════════ */
let gameRaf = null;
function startGame() {
  showScreen('screen-game');
  document.getElementById('gameSecret').classList.add('hidden');
  document.getElementById('gameHint').innerHTML =
    'Balloons ko pop karo — <span class="text-amber-300 font-bold">ek me chhupa hai ek secret</span>. Dhundo!';
  const field = document.getElementById('balloonField');
  field.innerHTML = '';
  const colors = ['#fb7185', '#a78bfa', '#60a5fa', '#4ade80', '#f97316', '#e879f9', '#38bdf8', '#facc15'];
  const NUM = 9;
  const secretIdx = Math.floor(Math.random() * NUM);

  function spawn(i, withIntroDelay) {
    const b = document.createElement('div');
    const secret = i === secretIdx;
    b.className = 'balloon' + (secret ? ' secret' : '');
    b.style.left = (4 + Math.random() * 78) + '%';
    b.style.setProperty('--b', secret ? '#fbbf24' : colors[i % colors.length]);
    const dur = 8 + Math.random() * 7;
    b.style.animation = `floatUp ${dur}s linear ${withIntroDelay ? 0 : -(Math.random() * dur)}s infinite`;
    b.addEventListener('pointerdown', e => {
      if (b.classList.contains('popped')) return;
      SFX.pop();
      b.classList.add('popped');
      if (window.confetti) {
        const r = b.getBoundingClientRect();
        confetti({ particleCount: 26, spread: 60, startVelocity: 24, ticks: 120, scalar: 0.85,
          origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight },
          colors: ['#fde68a', '#fb923c', '#fb7185'] });
      }
      if (secret) {
        SFX.chime(true);
        confettiBurst(1.4);
        setTimeout(() => {
          field.innerHTML = '';
          field.classList.add('hidden');
          document.getElementById('gameSecret').classList.remove('hidden');
        }, 500);
      } else {
        setTimeout(() => { if (!document.getElementById('gameSecret').classList.contains('hidden')) return; b.remove(); spawn(Math.floor(Math.random() * NUM), false); }, 700);
      }
    });
    field.appendChild(b);
  }
  for (let i = 0; i < NUM; i++) spawn(i, true);
}
document.getElementById('btnGameDone').addEventListener('click', () => {
  document.getElementById('balloonField').classList.remove('hidden');
  showScreen('screen-photo-gate');
});
/* floatUp keyframes are driven by CSS animation on .balloon */

/* ═══════════ TYPEWRITER LETTER ═══════════ */
const LETTER_TEXT = `Kuch log chupke se zindagi me aa jaate hain, aur phir sabse zyada khushi, sabse zyada hasi sirf wahi dete hain. Tum bilkul aise hi ho.

Tumhari har hasi ke liye, har late-night baat ke liye, aur har us pal ke liye jo tumne bas aake halka kar diya — thank you. Internet ke is chhote se kone ka sirf ek hi maqsad hai — ye yaad dilana ki tumhari value tumhare andaaze se kahin zyada hai.

Happy Birthday. Aise hi amazing raho.`;

function initLetter() {
  const env = document.getElementById('letterEnvelope');
  const paper = document.getElementById('letterPaper');
  const textEl = document.getElementById('letterText');
  const cursor = document.getElementById('letterCursor');
  const sign = document.getElementById('letterSign');
  const done = document.getElementById('btnLetterDone');
  const hint = document.getElementById('letterTapHint');
  let typed = false;

  function openEnvelope() {
    if (env.classList.contains('open')) return;
    env.classList.add('open');
    SFX.click();
    setTimeout(() => SFX.whoosh(), 250);
    setTimeout(() => {
      env.classList.add('hidden');
      hint.classList.add('hidden');
      paper.classList.remove('hidden');
      typeLetter();
    }, 950);
  }
  env.addEventListener('click', openEnvelope);
  env.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); } });

  function typeLetter() {
    if (typed) return;
    typed = true;
    let i = 0;
    const iv = setInterval(() => {
      // type 1-3 chars per tick for natural rhythm
      i = Math.min(i + 1 + (Math.random() < 0.4 ? 1 : 0), LETTER_TEXT.length);
      textEl.textContent = LETTER_TEXT.slice(0, i);
      if (i % 6 === 0) SFX.click();
      if (i >= LETTER_TEXT.length) {
        clearInterval(iv);
        cursor.classList.add('hidden');
        sign.classList.remove('hidden');
        SFX.chime();
        setTimeout(() => done.classList.remove('hidden'), 700);
      }
    }, 34);
    // tap the letter to finish typing instantly
    paper.addEventListener('click', () => {
      if (i >= LETTER_TEXT.length) return;
      clearInterval(iv);
      i = LETTER_TEXT.length;
      textEl.textContent = LETTER_TEXT;
      cursor.classList.add('hidden');
      sign.classList.remove('hidden');
      done.classList.remove('hidden');
    });
  }
}
document.getElementById('btnLetterDone').addEventListener('click', () => {
  showScreen('screen-num');
  startNumN1();
});

/* ═══════════ TAP FIREWORKS on photo screen ═══════════ */
document.getElementById('screen-photo').addEventListener('pointerdown', e => {
  if (e.target.closest('button, a')) return;
  if (window.confetti) confetti({
    particleCount: 70, spread: 360, startVelocity: 32, ticks: 170, gravity: 0.75,
    origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
    colors: ['#fde68a', '#fb923c', '#fb7185', '#e879f9', '#a78bfa'],
  });
  SFX.pop();
});

/* ═══════════ WEB SHARE on finale ═══════════ */
document.getElementById('btnShare').addEventListener('click', async function () {
  const data = { title: `Happy Birthday ${CONFIG.name} 🎂`, text: 'Maine tumhare liye ek surprise banaya hai — tap karke kholo!', url: location.href };
  try {
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(location.href);
      const label = this.querySelector('span');
      const old = label.textContent;
      label.textContent = 'Link copied! 📋';
      setTimeout(() => (label.textContent = old), 1800);
    }
  } catch (e) { /* user dismissed */ }
});

/* ═══════════ 5. NUMBER TEASES ═══════════ */

/* N1 — slot machine dials a (wrong) number first */
function startNumN1() {
  const wrap = document.getElementById('slotDigits');
  const status = document.getElementById('n1Status');
  const againBtn = document.getElementById('n1Btn');
  const digits = CONFIG.phone.replace(/\D/g, '').slice(-10).split('');
  let boxes = [];
  wrap.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const d = document.createElement('div');
    d.className = 'slot-digit';
    d.textContent = '?';
    wrap.appendChild(d);
    boxes.push(d);
  }

  function spin(revealReal, onDone) {
    status.textContent = 'Dial ho raha hai…';
    againBtn.classList.add('hidden');
    let round = 0;
    const spinIv = setInterval(() => {
      boxes.forEach(b => { b.classList.remove('locked'); b.textContent = Math.floor(Math.random() * 10); });
      round++;
    }, 70);

    boxes.forEach((b, i) => {
      setTimeout(() => {
        clearInterval(spinIv);
        b.textContent = revealReal ? digits[i] : Math.floor(Math.random() * 10);
        b.classList.add('locked');
      }, 1400 + i * 350);
    });

    setTimeout(() => {
      onDone();
    }, 1400 + 10 * 350 + 600);
  }

  spin(false, () => {
    status.textContent = 'Oops! Galat number 😅 Ye to pizza wale ka hai.';
    againBtn.classList.remove('hidden');
    againBtn.onclick = () => {
      spin(true, () => {
        status.textContent = 'Ha! Mazak kar raha tha — ye asli wala hai 🎉';
        confettiBurst(0.8);
        setTimeout(startNumN2, 2000);
      });
    };
  });
}

/* N2 — Yes/No, but the No button runs away and shrinks */
function startNumN2() {
  document.getElementById('numN1').classList.add('hidden');
  const n2 = document.getElementById('numN2');
  n2.classList.remove('hidden');
  const yes = document.getElementById('n2Yes');
  const no = document.getElementById('n2No');
  const q = document.getElementById('n2Q');
  const lines = ['Nahi', 'Soch lo… 🤔', 'Pakka pakka?', 'Ye button ab sharma gaya 🙈'];
  let dodges = 0;

  function runAway() {
    if (dodges >= 4) return;
    dodges++;
    const maxX = Math.max(80, window.innerWidth * 0.24);
    const maxY = Math.max(60, window.innerHeight * 0.12);
    no.style.transform = `translate(${(Math.random() - 0.5) * 2 * maxX}px, ${(Math.random() - 0.5) * 2 * maxY}px) scale(${1 - dodges * 0.14})`;
    no.textContent = lines[Math.min(dodges, lines.length - 1)];
    if (dodges >= 4) {
      no.textContent = 'Okay, main haar gaya 🥺';
      no.style.opacity = '0.4';
      no.onclick = null;
    }
  }
  no.addEventListener('pointerenter', runAway);
  no.addEventListener('touchstart', runAway, { passive: true });
  no.addEventListener('click', () => { if (dodges < 4) { q.textContent = 'Galat jawab 😄 Universe sirf HAAN sunna chahta hai.'; runAway(); } });

  yes.onclick = () => {
    n2.classList.add('hidden');
    startNumN3();
  };
}

/* N3 — tap the heart 10 times */
function startNumN3() {
  const n3 = document.getElementById('numN3');
  n3.classList.remove('hidden');
  const heart = document.getElementById('heartTap');
  const count = document.getElementById('heartCount');
  const note = document.getElementById('n3Note');
  const notes = [
    'Garam ho raha hai…', 'Aur garam… 🔥', 'Chalo chalo!', 'Adha ho gaya!', 'Bas thoda aur…',
    'Almost!', 'Sirf kuch aur…', '2 aur…', 'Aakhri ek…', 'KHUL GAYA! 🎉',
  ];
  let taps = 0;
  heart.onclick = () => {
    if (taps >= 10) return;
    taps++;
    count.textContent = `${taps} / 10`;
    note.textContent = notes[Math.min(taps - 1, notes.length - 1)];
    if (window.confetti) confetti({ particleCount: 8, spread: 55, startVelocity: 22, origin: { x: 0.5, y: 0.55 }, colors: ['#fb7185', '#fda4af', '#fde68a'], scalar: 0.8, ticks: 120 });
    if (taps === 10) {
      heart.style.transform = 'scale(1.25)';
      confettiBurst(1.2);
      setTimeout(() => { n3.classList.add('hidden'); startNumN4(); }, 1300);
    }
  };
}

/* N4 — number reveal + WhatsApp */
function startNumN4() {
  const n4 = document.getElementById('numN4');
  n4.classList.remove('hidden');
  confettiBurst(1.5);
  // continue to finale after a beat
  setTimeout(() => {
    const n5 = document.getElementById('numN5');
    const btnReplay = document.getElementById('btnReplay');
    // add a gentle continue under the number card
    if (!document.getElementById('btnFinale')) {
      const b = document.createElement('button');
      b.id = 'btnFinale';
      b.className = 'btn-ghost mt-6';
      b.textContent = 'Aakhri cheez…';
      b.onclick = () => { n4.classList.add('hidden'); n5.classList.remove('hidden'); };
      document.getElementById('numN4').appendChild(b);
    }
  }, 2500);
}

/* finale — replay */
document.getElementById('btnReplay').addEventListener('click', () => location.reload());
