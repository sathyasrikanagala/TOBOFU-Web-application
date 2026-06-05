"use strict";

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

/* ══════════════════════════════════════════════════════
   IMAGE TRAIL — Hero section, Tobofu logo only
   Adapted from Codrops ImageTrailEffects (demo2)
   ══════════════════════════════════════════════════════ */
(function initImageTrail() {

  const heroSection = document.getElementById('heroSection');
  if (!heroSection) return;

  /* ── Helpers ── */
  const MathUtils = {
    lerp:     (a, b, n) => (1 - n) * a + n * b,
    distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)
  };

  const getMousePos = (ev) => {
    let posx = 0, posy = 0;
    if (!ev) ev = window.event;
    if (ev.pageX || ev.pageY) {
      posx = ev.pageX;
      posy = ev.pageY;
    } else if (ev.clientX || ev.clientY) {
      posx = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = ev.clientY + document.body.scrollTop  + document.documentElement.scrollTop;
    }
    return { x: posx, y: posy };
  };

  /* ── Create trail image elements inside the hero ── */
  const TRAIL_COUNT = 12;   // number of ghost logos in the pool
  const trailImgs   = [];

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const img = document.createElement('img');
    img.src   = 'centle-logo.png';
    img.alt   = '';
    img.setAttribute('aria-hidden', 'true');
    img.classList.add('hero-trail-img');
    heroSection.appendChild(img);
    trailImgs.push(img);
  }

  /* ── State ── */
  let mousePos      = { x: 0, y: 0 };
  let lastMousePos  = { x: 0, y: 0 };
  let cacheMousePos = { x: 0, y: 0 };
  let imgPosition   = 0;
  let zIndexVal     = 1;
  const THRESHOLD   = 90;   // px mouse must travel before next logo appears

  /* ── Track mouse only inside hero ── */
  heroSection.addEventListener('mousemove', ev => {
    mousePos = getMousePos(ev);
  });

  /* ── Per-image rect cache ── */
  const rects = trailImgs.map(img => img.getBoundingClientRect());
  window.addEventListener('resize', () => {
    trailImgs.forEach((img, i) => {
      gsap.set(img, { opacity: 0, x: 0, y: 0 });
      rects[i] = img.getBoundingClientRect();
    });
  });

  const isActive = (img) =>
    gsap.isTweening(img) || parseFloat(img.style.opacity || 0) !== 0;

  /* ── Show next logo in pool ── */
  function showNextImage() {
    const img  = trailImgs[imgPosition];
    const rect = rects[imgPosition];

    gsap.killTweensOf(img);

    gsap.timeline()
      .set(img, {
        opacity:  1,
        scale:    1,
        zIndex:   zIndexVal,
        x: cacheMousePos.x - heroSection.getBoundingClientRect().left - rect.width  / 2,
        y: cacheMousePos.y - heroSection.getBoundingClientRect().top  - rect.height / 2,
        yPercent: 0
      }, 0)
      .to(img, {
        duration: 1.6,
        ease:     'expo.out',
        x: mousePos.x - heroSection.getBoundingClientRect().left - rect.width  / 2,
        y: mousePos.y - heroSection.getBoundingClientRect().top  - rect.height / 2
      }, 0)
      .to(img, {
        duration: 1.6,
        ease:     'power2.in',
        yPercent: 60,
        opacity:  0
      }, 0.7);
  }

  /* ── Render loop ── */
  function render() {
    const distance = MathUtils.distance(mousePos.x, mousePos.y, lastMousePos.x, lastMousePos.y);

    cacheMousePos.x = MathUtils.lerp(cacheMousePos.x || mousePos.x, mousePos.x, 0.1);
    cacheMousePos.y = MathUtils.lerp(cacheMousePos.y || mousePos.y, mousePos.y, 0.1);

    if (distance > THRESHOLD) {
      showNextImage();
      zIndexVal++;
      imgPosition = (imgPosition + 1) % TRAIL_COUNT;
      lastMousePos = { ...mousePos };
    }

    // reset z-index when all idle
    if (trailImgs.every(img => !isActive(img)) && zIndexVal !== 1) {
      zIndexVal = 1;
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

})();

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
