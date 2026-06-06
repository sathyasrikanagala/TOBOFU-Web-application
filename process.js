"use strict";
/* ══════════════════════════════════════════════════════════
   PROCESS HERO — SCROLL SCRAMBLE + TRIANGLE + GLOW
   ══════════════════════════════════════════════════════════ */
(function () {

  const hero = document.getElementById('heroSection');
  if (!hero) return;

  /* ── Scramble ring ── */
  const list = document.getElementById('scrambleList');
  if (!list) return;

  const items = Array.from(list.querySelectorAll('li'));
  const COUNT = items.length;

  /* Seeded pseudo-random — deterministic so positions never jump */
  function makeRand(seed) {
    let s = seed;
    return function() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  const letterData = []; // pre-computed per-letter positions

  function buildLetterData() {
    letterData.length = 0;
    const R    = list.offsetWidth / 2;
    const rand = makeRand(137);

    items.forEach((li, liIdx) => {
      const wordAngleDeg = (360 / COUNT) * liIdx - 90;
      const wordAngleRad = wordAngleDeg * Math.PI / 180;
      const tanAngleRad  = (wordAngleDeg + 90) * Math.PI / 180;
      const spans        = Array.from(li.querySelectorAll('span'));
      const nLetters     = spans.length;

      spans.forEach((span, sIdx) => {
        /* ASSEMBLED: evenly spaced along tangent on ring circumference */
        const charSpacing = 14;
        const offsetAlong = sIdx * charSpacing - ((nLetters - 1) * charSpacing) / 2;
        const ax  = R + Math.cos(wordAngleRad) * R + Math.cos(tanAngleRad) * offsetAlong;
        const ay  = R + Math.sin(wordAngleRad) * R + Math.sin(tanAngleRad) * offsetAlong;
        const aRot = wordAngleDeg + 90;

        /* SCRAMBLED: random loose cloud — vary angle AND radius AND tilt */
        const angle   = rand() * Math.PI * 2;
        const rx      = R * (0.25 + rand() * 0.65);
        const ry      = R * (0.20 + rand() * 0.65);
        const sx      = R + Math.cos(angle) * rx;
        const sy      = R + Math.sin(angle) * ry;
        const sRot    = rand() * 340 - 170;

        letterData.push({ span, sx, sy, sRot, ax, ay, aRot });
      });
    });
  }

  function positionLetters(progress) {
    if (letterData.length === 0) buildLetterData();
    letterData.forEach(({ span, sx, sy, sRot, ax, ay, aRot }) => {
      const x   = sx + (ax - sx) * progress;
      const y   = sy + (ay - sy) * progress;
      const rot = sRot + (aRot - sRot) * progress;
      span.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
      span.style.opacity   = String(0.35 + progress * 0.65);
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
  window.addEventListener('resize', () => { letterData.length = 0; onScroll(); }, { passive: true });

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
