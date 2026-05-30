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
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressFill.style.width = (scrollTop / docHeight * 100) + '%';
});

/* ── Horizontal scroll ── */
document.addEventListener('scroll', horizontalScroll);
let sticky = document.querySelector('.sticky');
let stickyParent = document.querySelector('.sticky-parent');

function horizontalScroll() {
  let scrollWidth = sticky.scrollWidth;
  let verticalScrollHeight = stickyParent.getBoundingClientRect().height - sticky.getBoundingClientRect().height;
  let stickyPosition = sticky.getBoundingClientRect().top;
  if (stickyPosition > 1) return;
  let scrolled = stickyParent.getBoundingClientRect().top;
  sticky.scrollLeft = (scrollWidth / verticalScrollHeight) * (-scrolled) * 0.85;
}

/* ── Scroll reveal ── */
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));

/* ── Hero flair (jQuery) ── */
$(function () {
  var hero   = $("#heroSection");
  var follow = $("#follow");

  hero.on("mouseenter", function () {
    follow.show();
  });

  hero.on("mouseleave", function () {
    follow.hide();
  });

  hero.on("mousemove", function (e) {
    var offset = hero.offset();
    follow.css({
      left: e.pageX - offset.left,
      top:  e.pageY - offset.top
    });
  });
});
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
