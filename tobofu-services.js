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
  nav.classList.toggle('dark-nav', window.scrollY > window.innerHeight * 0.85);
});

/* ── Card Stack ── */
const stack = document.getElementById('serviceStack');
// Reverse so card index 0 ends on top
[...stack.children].reverse().forEach(c => stack.append(c));

let currentTop = 0; // tracks which card index is on top
const totalCards = stack.children.length;

function getTopCard() {
  return stack.querySelector('.card:last-child');
}

function updateListHighlight(idx) {
  document.querySelectorAll('.service-list-item').forEach(item => {
    item.classList.toggle('active-service', parseInt(item.dataset.target) === idx);
  });
}

stack.addEventListener('click', e => {
  const card = getTopCard();
  if (!card.contains(e.target) && e.target !== card) return;
  card.style.animation = 'swap 700ms forwards';
  const nextIdx = parseInt(card.dataset.index);
  setTimeout(() => {
    card.style.animation = '';
    stack.prepend(card);
    // after prepend, new top card
    const newTop = getTopCard();
    updateListHighlight(parseInt(newTop.dataset.index));
  }, 700);
});

// clicking list item brings that card to front
document.querySelectorAll('.service-list-item').forEach(item => {
  item.addEventListener('click', () => {
    const target = parseInt(item.dataset.target);
    // find card with that data-index and bring to front by cycling
    let attempts = 0;
    function bringForward() {
      const top = getTopCard();
      if (parseInt(top.dataset.index) === target || attempts > totalCards) {
        updateListHighlight(target);
        return;
      }
      top.style.animation = 'swap 700ms forwards';
      setTimeout(() => {
        top.style.animation = '';
        stack.prepend(top);
        attempts++;
        bringForward();
      }, 350);
    }
    bringForward();
  });
});

/* ── Scroll reveal ── */
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));
