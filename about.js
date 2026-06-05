// ── CUSTOM CURSOR ──────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const dot    = document.getElementById('cursorDot');
document.addEventListener('mousemove', e => {
  cursor.style.left = (e.clientX - 2) + 'px';
  cursor.style.top  = (e.clientY - 4) + 'px';
  dot.style.left    = (e.clientX - 4) + 'px';
  dot.style.top     = (e.clientY - 4) + 'px';
});
document.querySelectorAll('a,button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.style.transform = 'scale(1.5)');
  el.addEventListener('mouseleave', () => cursor.style.transform = 'scale(1)');
});

// ── CANVAS LOGO HELPERS ────────────────────────────────────────
const centleLogoImg = new Image();
centleLogoImg.src = 'centle.avif';

function roundRect(ctx, x, y, w, h, r) {
  r = Math.max(0, r);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawLogoFace(ctx, cx, cy, W, H, scaleX) {
  const hw = (W / 2) * Math.abs(scaleX);
  const hh = H / 2;
  const facingRight = scaleX >= 0;
  const x0 = cx - hw, y0 = cy - hh;
  const w = hw * 2, h = hh * 2;
  ctx.save();
  if (Math.abs(scaleX) > 0.15) {
    const shadowOff = 8 * Math.abs(scaleX) * (facingRight ? 1 : -1);
    ctx.beginPath(); roundRect(ctx, x0 + shadowOff, y0 + 8, w, h, 6);
    ctx.fillStyle = '#FFD600'; ctx.fill();
  }
  ctx.beginPath(); roundRect(ctx, x0, y0, w, h, 6 * Math.abs(scaleX));
  ctx.fillStyle = '#FFD600'; ctx.fill();
  if (hw > 2) {
    ctx.beginPath(); roundRect(ctx, x0, y0, w, h, 6 * Math.abs(scaleX));
    ctx.strokeStyle = '#111111'; ctx.lineWidth = 3 * Math.abs(scaleX); ctx.stroke();
  }
  if (Math.abs(scaleX) < 0.08) { ctx.restore(); return; }
  ctx.save();
  ctx.beginPath(); roundRect(ctx, x0 + 1, y0 + 1, w - 2, h - 2, Math.max(1, 6 * Math.abs(scaleX) - 1));
  ctx.clip();
  const pad = w * 0.08;
  ctx.fillStyle = '#FFD600'; ctx.fillRect(x0 + pad, y0 + pad, w - pad, h - pad * 0.5);
  ctx.save();
  ctx.transform(Math.abs(scaleX), 0, 0, 1, cx, cy);
  const fontSize = H * 0.18;
  ctx.font = `900 ${fontSize}px 'Bebas Neue', sans-serif`;
  ctx.fillStyle = '#111111'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lineH = fontSize * 1.05;
  const totalTextH = lineH * 3;
  const textTop = -totalTextH / 2 + lineH * 0.1;
  ctx.textAlign = 'center';
  ctx.fillText('TO', 0, textTop);
  ctx.fillText('BO', 0, textTop + lineH);
  const rowY = textTop + lineH * 2;
  const fWidth = ctx.measureText('F').width;
  const funnelWTemp = fontSize * 0.72;
  const totalRowW = fWidth + W * 0.04 * Math.abs(scaleX) + funnelWTemp;
  const rowX = -totalRowW / 2;
  ctx.textAlign = 'left';
  ctx.fillText('F', rowX, rowY);
  const funnelX = rowX + fWidth + W * 0.04 * Math.abs(scaleX);
  const funnelW = fontSize * 0.72;
  const funnelH = fontSize * 0.85;
  const fy = rowY - funnelH / 2;
  ctx.beginPath(); ctx.moveTo(funnelX, fy); ctx.lineTo(funnelX + funnelW, fy);
  ctx.lineTo(funnelX + funnelW * 0.65, fy + funnelH * 0.38); ctx.lineTo(funnelX + funnelW * 0.35, fy + funnelH * 0.38);
  ctx.closePath(); ctx.fillStyle = '#3A86FF'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(funnelX + funnelW * 0.35, fy + funnelH * 0.38);
  ctx.lineTo(funnelX + funnelW * 0.65, fy + funnelH * 0.38);
  ctx.lineTo(funnelX + funnelW * 0.55, fy + funnelH * 0.70); ctx.lineTo(funnelX + funnelW * 0.45, fy + funnelH * 0.70);
  ctx.closePath(); ctx.fillStyle = '#E63946'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(funnelX + funnelW * 0.45, fy + funnelH * 0.70);
  ctx.lineTo(funnelX + funnelW * 0.55, fy + funnelH * 0.70); ctx.lineTo(funnelX + funnelW * 0.50, fy + funnelH);
  ctx.closePath(); ctx.fillStyle = '#FFD600'; ctx.fill();
  ctx.restore();
  ctx.restore();
}

function makeCardSpinner(canvasId, opts = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const S = opts.size || 300;
  canvas.width = S * dpr; canvas.height = S * dpr;
  canvas.style.width = S + 'px'; canvas.style.height = S + 'px';
  ctx.scale(dpr, dpr);
  const cx = S / 2, cy = S / 2;
  const CW = S * 0.62, CH = S * 0.78;
  let angle = opts.startAngle || 0;
  const speed = opts.speed || 0.014;
  let scrollBoost = 0;
  function frame() {
    ctx.clearRect(0, 0, S, S);
    const cosA = Math.cos(angle + scrollBoost);
    if (cosA < 0) {
      ctx.save();
      const hw = (CW / 2) * Math.abs(cosA), hh = CH / 2;
      ctx.beginPath(); roundRect(ctx, cx - hw, cy - hh, hw * 2, hh * 2, 6 * Math.abs(cosA));
      ctx.fillStyle = '#FFD600'; ctx.fill();
      if (Math.abs(cosA) > 0.05) {
        ctx.beginPath(); roundRect(ctx, cx - hw, cy - hh, hw * 2, hh * 2, 6 * Math.abs(cosA));
        ctx.strokeStyle = '#111'; ctx.lineWidth = 3 * Math.abs(cosA); ctx.stroke();
      }
      if (Math.abs(cosA) > 0.08) {
        ctx.save();
        ctx.transform(Math.abs(cosA), 0, 0, 1, cx, cy);
        const imgW = CW * 0.7 * Math.abs(cosA);
        const imgH = imgW * 0.5;
        ctx.drawImage(centleLogoImg, -imgW / 2, -imgH / 2, imgW, imgH);
        ctx.restore();
      }
      ctx.restore();
    } else {
      drawLogoFace(ctx, cx, cy, CW, CH, cosA);
    }
    const edgeThick = (CW * 0.04) * (1 - Math.abs(cosA));
    if (edgeThick > 0.5) {
      const hw = (CW / 2) * Math.abs(cosA), hh = CH / 2;
      const ex = cosA >= 0 ? cx + hw : cx - hw;
      const dir = cosA >= 0 ? 1 : -1;
      ctx.save(); ctx.fillStyle = '#c9a800';
      ctx.beginPath(); ctx.moveTo(ex, cy - hh); ctx.lineTo(ex + dir * edgeThick, cy - hh);
      ctx.lineTo(ex + dir * edgeThick, cy + hh); ctx.lineTo(ex, cy + hh); ctx.closePath();
      ctx.fill(); ctx.restore();
    }
  }
  let rafId;
  function tick() { angle += speed; frame(); rafId = requestAnimationFrame(tick); }
  tick();
  return { setScrollBoost: v => { scrollBoost = v; }, stop: () => cancelAnimationFrame(rafId) };
}

const heroSpinner = makeCardSpinner('spinCanvas', { size: 400, speed: 0.014, startAngle: 0.3 });
const valueSpinner = makeCardSpinner('purpleCanvas', { size: 340, speed: 0.009, startAngle: 1.8 });

// ── SPINNER AMBIENT ELEMENTS ───────────────────────────────────
(function() {
  const sticky = document.querySelector('.logo-sticky');
  if (!sticky) return;

  // Orbit rings
  [{sz:370,op:1},{sz:510,op:0.4}].forEach(({sz,op}) => {
    const r = document.createElement('div');
    r.className = 'orbit-ring';
    r.style.cssText = `width:${sz}px;height:${sz}px;opacity:${op}`;
    sticky.appendChild(r);
  });

  // Clock-position elements
  // FIX: 12 o'clock bumped from top:6% to top:18% so it clears the nav bar (~65px)
  const els = [
    // 12 o'clock — pushed down to clear nav
    { type:'tag', text:'FULL FUNNEL', cls:'yl',
      css:'top:18%;left:50%;transform:translateX(-50%);',
      anim:'spinFloatUp 4.4s ease-in-out 0s infinite' },
    // 1–2 o'clock
    { type:'metric', num:'1M+', lbl:'Users Scaled',
      css:'top:18%;right:6%;',
      anim:'spinFloatDown 4.0s ease-in-out 0.6s infinite' },
    // 3 o'clock
    { type:'tag', text:'CONTENT', cls:'blk',
      css:'top:50%;right:2%;transform:translateY(-50%);',
      anim:'spinFloatUp 4.7s ease-in-out 0.3s infinite' },
    // 4–5 o'clock
    { type:'metric', num:'−30%', lbl:'Lower CAC',
      css:'bottom:18%;right:6%;',
      anim:'spinFloatUp 3.8s ease-in-out 1.0s infinite' },
    // 7–8 o'clock
    { type:'metric', num:'2.5×', lbl:'Conversion Rate',
      css:'bottom:18%;left:6%;',
      anim:'spinFloatUp 4.2s ease-in-out 0.8s infinite' },
    // 9 o'clock
    { type:'tag', text:'PERFORMANCE', cls:'yl',
      css:'top:50%;left:2%;transform:translateY(-50%);',
      anim:'spinFloatDown 4.5s ease-in-out 0.1s infinite' },
    // 10–11 o'clock
    { type:'metric', num:'400%', lbl:'User Growth',
      css:'top:18%;left:6%;',
      anim:'spinFloatDown 3.9s ease-in-out 0.4s infinite' },
  ];

  els.forEach(({type,text,cls,num,lbl,css,anim}) => {
    const el = document.createElement('div');
    if (type === 'tag') {
      el.className = `spin-tag ${cls}`;
      el.textContent = text;
    } else {
      el.className = 'spin-metric';
      el.innerHTML = `<span class="mn">${num}</span><span class="ml">${lbl}</span>`;
    }
    el.style.cssText = `position:absolute;${css}animation:${anim};`;
    sticky.appendChild(el);
  });

  // Diagonal gap-fill dots
  [
    {s:8,  c:'#FFD600', css:'top:28%;right:19%;', a:'spinFloatUp 3.6s ease-in-out 0.2s infinite'},
    {s:10, c:'#3A86FF', css:'bottom:28%;right:19%;', a:'spinFloatDown 4.1s ease-in-out 0.9s infinite'},
    {s:7,  c:'#E63946', css:'bottom:28%;left:19%;',  a:'spinFloatDown 3.7s ease-in-out 0.5s infinite'},
    {s:9,  c:'#0D0D0D', css:'top:28%;left:19%;',    a:'spinFloatUp 4.3s ease-in-out 1.1s infinite'},
  ].forEach(({s,c,css,a}) => {
    const d = document.createElement('div');
    d.className = 'spin-dot';
    d.style.cssText = `position:absolute;width:${s}px;height:${s}px;background:${c};${css}animation:${a};`;
    sticky.appendChild(d);
  });

  // Mini funnel icon — between 12 and 1 o'clock
  const f = document.createElementNS('http://www.w3.org/2000/svg','svg');
  f.setAttribute('viewBox','0 0 28 34');
  f.setAttribute('width','28'); f.setAttribute('height','34');
  f.className.baseVal = 'spin-funnel';
  f.style.cssText = 'position:absolute;top:14%;right:20%;animation:spinFloatUp 5s ease-in-out 0.7s infinite;';
  f.innerHTML = `<rect width="28" height="34" fill="#FFD600" rx="2" stroke="#0D0D0D" stroke-width="2"/>
    <polygon points="3,8 25,8 19,17 9,17" fill="#3A86FF"/>
    <polygon points="9,17 19,17 17,25 11,25" fill="#E63946"/>
    <polygon points="11,25 17,25 14,33" fill="#0D0D0D"/>`;
  sticky.appendChild(f);

  // Ticker bar
  const ticker = document.createElement('div');
  ticker.className = 'spin-ticker';
  ticker.style.position = 'absolute';
  ticker.innerHTML = `<span class="spin-tdot"></span>TOBOFU — GOOGLE &amp; META PARTNER<span class="spin-tdot"></span>`;
  sticky.appendChild(ticker);
})();

// ── TRACK HEIGHT ───────────────────────────────────────────────
function setTrackHeight() {
  const hero  = document.querySelector('.hero');
  const intro = document.getElementById('aboutIntro');
  if (!hero || !intro) return;
  document.getElementById('logoTrack').style.height = (hero.offsetHeight + intro.offsetHeight) + 'px';
}
setTrackHeight();
window.addEventListener('resize', setTrackHeight);

// ── SCROLL HANDLERS ────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroSpinner) heroSpinner.setScrollBoost(y * 0.003);
  const fw1 = document.getElementById('fw1');
  const fw2 = document.getElementById('fw2');
  const fSec = document.querySelector('.footer-cta');
  if (fw1 && fw2 && fSec) {
    const rect = fSec.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      const p = Math.max(0, (window.innerHeight - rect.top) / window.innerHeight);
      fw1.style.transform = `translateX(${-p * 50}px)`;
      fw2.style.transform = `translateX(${p * 50}px)`;
    }
  }
}, { passive: true });

// ── SCROLL REVEAL ──────────────────────────────────────────────
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .stat-item, .value-card').forEach(el => io.observe(el));

// ── NAV THEME ──────────────────────────────────────────────────
function updateNavTheme() {
  const nav = document.getElementById('mainNav');
  const darkSections = document.querySelectorAll('.ecosystem-section, .r-section');
  let isDark = false;
  darkSections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= nav.offsetHeight && rect.bottom > 0) isDark = true;
  });
  nav.classList.toggle('dark-nav', isDark);
}
window.addEventListener('scroll', updateNavTheme, { passive: true });
updateNavTheme();

// ── MOBILE MENU ────────────────────────────────────────────────
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}
