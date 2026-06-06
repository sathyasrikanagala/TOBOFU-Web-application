/* ─── CURSOR ─── */
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

/* ─── SECTION ROWS ─── */
const rows = document.querySelectorAll('.section-row');
let activeRow = null;
rows.forEach(row => {
  row.addEventListener('mouseenter', () => {
    if (activeRow && activeRow !== row) activeRow.classList.remove('active');
    row.classList.add('active');
    activeRow = row;
  });
  row.addEventListener('mouseleave', () => {
    row.classList.remove('active');
    if (activeRow === row) activeRow = null;
  });
});
function updateRowsByScroll() {
  rows.forEach(row => {
    const rect = row.getBoundingClientRect();
    const mid = window.innerHeight / 2;
    if (rect.top < mid && rect.bottom > mid) {
      if (!row.matches(':hover')) row.classList.add('active');
    } else {
      if (!row.matches(':hover')) row.classList.remove('active');
    }
  });
}

/* ─── FADE UP OBSERVER ─── */
const fadeEls = document.querySelectorAll('.fade-up');
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
}, { threshold: 0.12 });
fadeEls.forEach(el => fadeObs.observe(el));

/* ─── SCROLL LISTENER ─── */
window.addEventListener('scroll', () => {
  updateNavTheme();
  updateRowsByScroll();
  updateCursorMode();
}, { passive: true });

/* ─── HERO PARALLAX ─── */
const heroHeadline = document.querySelector('.hero-headline');
if (heroHeadline) {
  window.addEventListener('scroll', () => {
    heroHeadline.style.transform = `translateY(${window.scrollY * 0.22}px)`;
  }, { passive: true });
}

/* ─── DARK CURSOR MODE ─── */
function updateCursorMode() {
  const darkSections = document.querySelectorAll('.dark-section, footer');
  let isDark = false;
  darkSections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) isDark = true;
  });
  document.body.classList.toggle('dark-cursor', isDark);
}

/* ─── NAV MOBILE MENU ─── */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
}

/* ─── NAV THEME ─── */
function updateNavTheme() {
  const nav = document.getElementById('mainNav');
  const darkSection = document.querySelector('.dark-section');
  if (!darkSection) return;
  const rect = darkSection.getBoundingClientRect();
  if (rect.top <= nav.offsetHeight) {
    nav.classList.add('dark-nav');
  } else {
    nav.classList.remove('dark-nav');
  }
}

/* ─── HERO WAVE ANIMATION ─── */
(function () {
  const wave1 = document.getElementById('wave1');
  const wave2 = document.getElementById('wave2');
  const wave3 = document.getElementById('wave3');
  if (!wave1 || !wave2 || !wave3) return;

  let tick = 0;

  function animateWave() {
    tick += 0.008;

    // Each wave shifts independently at different speeds & directions
    const s1 = Math.sin(tick)        * 18;
    const s2 = Math.sin(tick * 0.7 + 1) * 24;
    const s3 = Math.sin(tick * 0.5 + 2) * 30;

    wave1.style.transform = `translateX(${s1}px)`;
    wave2.style.transform = `translateX(${-s2}px)`;
    wave3.style.transform = `translateX(${s3}px)`;

    requestAnimationFrame(animateWave);
  }

  animateWave();
})();
