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
