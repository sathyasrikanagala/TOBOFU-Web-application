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
  ctx.fillText('TO', 0, textTop);
  ctx.fillText('BO', 0, textTop + lineH);
  ctx.textAlign = 'left';
  const fWidth = ctx.measureText('F').width;
  const rowY = textTop + lineH * 2;
  const rowX = -W * 0.28 * Math.abs(scaleX);
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
        const fontSize = CH * 0.22;
        ctx.font = `900 ${fontSize}px 'Bebas Neue', sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const colors = ['#2EC4B6','#E63946','#111','#3A86FF','#FF6B2B','#2EC4B6'];
        const letters = 'CENTLE'.split('');
        const totalW = letters.reduce((acc, ch) => acc + ctx.measureText(ch).width, 0);
        let lx = -totalW / 2;
        letters.forEach((ch, i) => {
          ctx.fillStyle = colors[i] || '#111';
          ctx.fillText(ch, lx + ctx.measureText(ch).width / 2, 0);
          lx += ctx.measureText(ch).width;
        });
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

const heroSpinner = makeCardSpinner('spinCanvas', { size: 320, speed: 0.014, startAngle: 0.3 });
const valueSpinner = makeCardSpinner('purpleCanvas', { size: 340, speed: 0.009, startAngle: 1.8 });

function setTrackHeight() {
  const hero  = document.querySelector('.hero');
  const intro = document.getElementById('aboutIntro');
  if (!hero || !intro) return;
  document.getElementById('logoTrack').style.height = (hero.offsetHeight + intro.offsetHeight) + 'px';
}
setTrackHeight();
window.addEventListener('resize', setTrackHeight);

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

/* ─── NAV THEME ─── */
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
