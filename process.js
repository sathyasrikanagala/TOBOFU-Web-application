"use strict";
/* ══════════════════════════════════════════════════════════
   PROCESS HERO — SCROLL SCRAMBLE + TRIANGLE + GLOW
   Paste at the TOP of process.js (before existing code)
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

  const LETTER_ANGLE_DELTA = 44;
  const LETTER_SPACING     = 18;

  const items    = Array.from(list.querySelectorAll('li'));
  const COUNT    = items.length;
  let   cachedR  = 0;

  function getRadius() {
    return list.offsetWidth / 2;
  }

  function positionLetters(rotateProgress) {
    const R = getRadius();
    items.forEach((li, liIdx) => {
      const wordAngleDeg = (360 / COUNT) * liIdx;
      const wordAngleRad = (wordAngleDeg * Math.PI) / 180;
      const spans        = Array.from(li.querySelectorAll('span'));

      spans.forEach((span, sIdx) => {
        const scrambleAngleDeg = (sIdx + 1) * LETTER_ANGLE_DELTA;
        const finalAngleDeg    = scrambleAngleDeg * (1 - rotateProgress);
        const finalAngleRad    = (finalAngleDeg   * Math.PI) / 180;

        const translateX = R + Math.cos(wordAngleRad + finalAngleRad) * R
                             + sIdx * LETTER_SPACING * rotateProgress
                             + (sIdx + 1) * LETTER_SPACING * (1 - rotateProgress) * Math.cos(finalAngleRad);
        const translateY = R + Math.sin(wordAngleRad + finalAngleRad) * R
                             + (sIdx + 1) * LETTER_SPACING * (1 - rotateProgress) * Math.sin(finalAngleRad);

        const rotDeg = wordAngleDeg + finalAngleDeg;

        span.style.transform =
          `rotate(${rotDeg}deg) translateX(${R}px) translateX(${sIdx * LETTER_SPACING}px)`;
        span.style.opacity   = 0.5 + rotateProgress * 0.5;
      });
    });
  }

  function onScroll() {
    const heroH    = hero.offsetHeight;
    const scrollY  = window.scrollY;
    const progress = Math.min(Math.max(scrollY / (heroH * 0.8), 0), 1);

    /* overall ring rotation */
    list.style.transform = `rotate(${progress * 360}deg)`;

    /* letter unscramble */
    positionLetters(progress);
  }

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
