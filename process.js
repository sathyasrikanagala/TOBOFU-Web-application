"use strict";
/* ══════════════════════════════════════════════════════════
   PROCESS HERO — SCROLL SCRAMBLE + TRIANGLE + GLOW
   ══════════════════════════════════════════════════════════ */
(function () {

  const triCanvas = document.getElementById('heroTriCanvas');
  const hero      = document.getElementById('heroSection');
  const glowOrb   = document.getElementById('heroGlowOrb');
  if (!triCanvas || !hero) return;

  /* ── Triangle grid ── */
  const ctx = triCanvas.getContext('2d');
  function drawTris() {
    const W = hero.clientWidth, H = hero.clientHeight;
    triCanvas.width = W; triCanvas.height = H;
    const base = 48, h = base * 1.733;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,214,0,0.035)';
    ctx.lineWidth = 0.5;
    for (let row = 0; row * h < H + h; row++) {
      const offset = row % 2 === 0 ? 0 : base;
      for (let col = -1; col * base * 2 < W + base * 2; col++) {
        const x = col * base * 2 + offset, y = row * h;
        ctx.beginPath(); ctx.moveTo(x,y+h); ctx.lineTo(x+base,y); ctx.lineTo(x+base*2,y+h); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+base,y); ctx.lineTo(x+base*2,y+h); ctx.lineTo(x+base*2+base,y); ctx.closePath(); ctx.stroke();
      }
    }
  }
  drawTris();
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawTris, 150); }, { passive: true });

  /* ── Glow follows cursor inside hero ── */
  if (glowOrb) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      glowOrb.style.left = (e.clientX - r.left) + 'px';
      glowOrb.style.top  = (e.clientY - r.top)  + 'px';
      glowOrb.style.transform = 'translate(-50%,-50%)';
      glowOrb.classList.add('active');
    }, { passive: true });
    hero.addEventListener('mouseleave', () => {
      glowOrb.style.left = '50%'; glowOrb.style.top = '50%';
      glowOrb.style.transform = 'translate(-50%,-50%)';
      glowOrb.classList.remove('active');
    });
  }

  /* ── Scramble ring ── */
  const list = document.getElementById('scrambleList');
  if (!list) return;

  const items = Array.from(list.querySelectorAll('li'));
  const COUNT = items.length;

  function positionLetters(progress) {
    const R = list.offsetWidth / 2;

    items.forEach((li, liIdx) => {
      const wordAngleDeg = (360 / COUNT) * liIdx - 90; // top-start
      const wordAngleRad = wordAngleDeg * Math.PI / 180;

      const spans    = Array.from(li.querySelectorAll('span'));
      const nLetters = spans.length;

      // Tangent direction (perpendicular to radius, clockwise)
      const tanAngleDeg = wordAngleDeg + 90;
      const tanAngleRad = tanAngleDeg * Math.PI / 180;

      spans.forEach((span, sIdx) => {
        // --- ASSEMBLED position: on the ring, letters spaced along tangent ---
        const charSpacing = 13;
        const totalWidth  = (nLetters - 1) * charSpacing;
        const offsetAlong = sIdx * charSpacing - totalWidth / 2;

        const ax = R + Math.cos(wordAngleRad) * R + Math.cos(tanAngleRad) * offsetAlong;
        const ay = R + Math.sin(wordAngleRad) * R + Math.sin(tanAngleRad) * offsetAlong;

        // --- SCRAMBLED position: each letter at its own wild orbit angle ---
        const scramAngleDeg = wordAngleDeg + (sIdx + 1) * 60 + liIdx * 15;
        const scramAngleRad = scramAngleDeg * Math.PI / 180;
        const scramR        = R * 0.65; // orbit inside the ring

        const sx = R + Math.cos(scramAngleRad) * scramR;
        const sy = R + Math.sin(scramAngleRad) * scramR;

        // Interpolate
        const x = sx + (ax - sx) * progress;
        const y = sy + (ay - sy) * progress;

        // Letter rotation: scrambled = random, assembled = along wordAngleDeg + 90
        const assembledRot = wordAngleDeg + 90;
        const scrambledRot = scramAngleDeg + 90;
        const rot = scrambledRot + (assembledRot - scrambledRot) * progress;

        span.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
        span.style.opacity   = String(0.3 + progress * 0.7);
      });
    });
  }

  function onScroll() {
    const parentH  = hero.parentElement ? hero.parentElement.offsetHeight : window.innerHeight * 3;
    const progress = Math.min(Math.max(window.scrollY / (parentH * 0.55), 0), 1);
    // Gentle whole-ring rotation on scroll
    list.style.transform = `rotate(${progress * 20}deg)`;
    positionLetters(progress);
  }

  positionLetters(0); // initial scrambled state
  window.addEventListener('scroll', onScroll, { passive: true });

})();

/* ── Custom cursor ── */
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

/* ── Nav dark on scroll ── */
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('dark-nav', window.scrollY > 80);
}, { passive: true });

/* ── Progress bar ── */
const progressFill = document.getElementById('progressFill');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressFill.style.width = (scrollTop / docHeight * 100) + '%';
}, { passive: true });

/* ── Horizontal scroll ── */
const sticky       = document.querySelector('.sticky');
const stickyParent = document.querySelector('.sticky-parent');
function horizontalScroll() {
  if (!sticky || !stickyParent) return;
  const scrollWidth          = sticky.scrollWidth;
  const verticalScrollHeight = stickyParent.getBoundingClientRect().height - sticky.getBoundingClientRect().height;
  const stickyPosition       = sticky.getBoundingClientRect().top;
  if (stickyPosition > 1) return;
  const scrolled = stickyParent.getBoundingClientRect().top;
  sticky.scrollLeft = (scrollWidth / verticalScrollHeight) * (-scrolled) * 0.85;
}
document.addEventListener('scroll', horizontalScroll, { passive: true });

/* ── Scroll reveal ── */
const reveals  = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));

/* ── Mobile menu ── */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu    = document.getElementById('mobileMenu');
if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
}
