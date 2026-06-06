"use strict";
/* ══════════════════════════════════════════════════════════
   PROCESS HERO — SCROLL SCRAMBLE + TRIANGLE + GLOW
   Fixed: ring centred, letters fully in-frame at rest & post-scroll
   ══════════════════════════════════════════════════════════ */
(function () {

  /* ── Triangle grid ── */
  const triCanvas = document.getElementById('heroTriCanvas');
  const hero      = document.getElementById('heroSection');
  const glowOrb   = document.getElementById('heroGlowOrb');

  if (!triCanvas || !hero) return;

  const ctx = triCanvas.getContext('2d');

  function drawTris() {
    const W = hero.clientWidth, H = hero.clientHeight;
    triCanvas.width  = W;
    triCanvas.height = H;
    const base = 48, h = base * 1.733;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,214,0,0.035)';
    ctx.lineWidth   = 0.5;
    for (let row = 0; row * h < H + h; row++) {
      const offset = row % 2 === 0 ? 0 : base;
      for (let col = -1; col * base * 2 < W + base * 2; col++) {
        const x = col * base * 2 + offset;
        const y = row * h;
        ctx.beginPath();
        ctx.moveTo(x, y + h); ctx.lineTo(x + base, y); ctx.lineTo(x + base * 2, y + h);
        ctx.closePath(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + base, y); ctx.lineTo(x + base * 2, y + h); ctx.lineTo(x + base * 2 + base, y);
        ctx.closePath(); ctx.stroke();
      }
    }
  }
  drawTris();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawTris, 150);
  }, { passive: true });

  /* ── Glow follows cursor ── */
  if (glowOrb) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      glowOrb.style.left      = (e.clientX - rect.left) + 'px';
      glowOrb.style.top       = (e.clientY - rect.top)  + 'px';
      glowOrb.style.transform = 'translate(-50%, -50%)';
      glowOrb.classList.add('active');
    }, { passive: true });
    hero.addEventListener('mouseleave', () => {
      glowOrb.style.left      = '50%';
      glowOrb.style.top       = '50%';
      glowOrb.style.transform = 'translate(-50%, -50%)';
      glowOrb.classList.remove('active');
    });
  }

  /* ── Scroll scramble ── */
  const list = document.getElementById('scrambleList');
  if (!list) return;

  const items = Array.from(list.querySelectorAll('li'));
  const COUNT = items.length;

  /* ── Position every letter for a given progress (0 = scrambled, 1 = ring) ── */
  function positionLetters(progress) {
    const R = list.offsetWidth / 2;           // ring radius

    /* Evenly distribute words around the ring */
    items.forEach((li, liIdx) => {
      const wordAngleDeg = (360 / COUNT) * liIdx - 90;  // -90 so first word starts at top
      const wordAngleRad = (wordAngleDeg * Math.PI) / 180;

      const spans = Array.from(li.querySelectorAll('span'));
      const nLetters = spans.length;

      spans.forEach((span, sIdx) => {
        /* Scrambled state: each letter orbits independently at a big offset angle */
        const scrambleAngleDeg = wordAngleDeg + (sIdx + 1) * 55;
        const scrambleAngleRad = (scrambleAngleDeg * Math.PI) / 180;

        /* Assembled state: letters fan out slightly along the word's tangent */
        /* For a circle, tangent direction is perpendicular to the radius */
        const tangentAngleDeg = wordAngleDeg + 90; /* 90° CCW from radius = tangent */
        const tangentAngleRad = (tangentAngleDeg * Math.PI) / 180;

        /* Letter offset along tangent, centred on the word position */
        const charSpacing = 14; /* px between assembled letters */
        const totalWidth  = (nLetters - 1) * charSpacing;
        const offsetAlong = (sIdx * charSpacing) - totalWidth / 2;

        /* Assembled position on the ring */
        const assembledX = R + Math.cos(wordAngleRad) * R + Math.cos(tangentAngleRad) * offsetAlong;
        const assembledY = R + Math.sin(wordAngleRad) * R + Math.sin(tangentAngleRad) * offsetAlong;

        /* Scrambled position */
        const scrambledX = R + Math.cos(scrambleAngleRad) * R * 0.7;
        const scrambledY = R + Math.sin(scrambleAngleRad) * R * 0.7;

        const x = scrambledX + (assembledX - scrambledX) * progress;
        const y = scrambledY + (assembledY - scrambledY) * progress;

        /* Assembled: letter faces outward along the radius */
        const assembledRot = wordAngleDeg + 90;
        /* Scrambled: letter at the scrambled angle */
        const scrambledRot = scrambleAngleDeg + 90;
        const rot = scrambledRot + (assembledRot - scrambledRot) * progress;

        span.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
        span.style.opacity   = String(0.35 + progress * 0.65);
      });
    });
  }

  function onScroll() {
    const parentH  = hero.parentElement.offsetHeight;
    const progress = Math.min(Math.max(window.scrollY / (parentH * 0.6), 0), 1);

    /* Overall ring rotation driven by scroll */
    list.style.transform = `rotate(${progress * -30}deg)`;   /* gentle final rotation */

    positionLetters(progress);
  }

  /* Initial state — scrambled */
  positionLetters(0);
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
});

/* ── Progress bar ── */
const progressFill = document.getElementById('progressFill');
window.addEventListener('scroll', () => {
  const scrollTop  = window.scrollY;
  const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
  progressFill.style.width = (scrollTop / docHeight * 100) + '%';
});

/* ── Horizontal scroll ── */
document.addEventListener('scroll', horizontalScroll);
let sticky       = document.querySelector('.sticky');
let stickyParent = document.querySelector('.sticky-parent');
function horizontalScroll() {
  let scrollWidth          = sticky.scrollWidth;
  let verticalScrollHeight = stickyParent.getBoundingClientRect().height - sticky.getBoundingClientRect().height;
  let stickyPosition       = sticky.getBoundingClientRect().top;
  if (stickyPosition > 1) return;
  let scrolled = stickyParent.getBoundingClientRect().top;
  sticky.scrollLeft = (scrollWidth / verticalScrollHeight) * (-scrolled) * 0.85;
}

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
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}
