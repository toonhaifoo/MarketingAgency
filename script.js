// Opt in to the reveal-on-scroll animation only once JS has confirmed it can run it —
// keeps content visible by default if this script fails to load or errors out.
document.documentElement.classList.add('js-reveal');

// Sticky header shadow on scroll
const header = document.getElementById('header');
function updateHeaderState() {
  header.classList.toggle('scrolled', window.scrollY > 8);
}
updateHeaderState();
window.addEventListener('scroll', updateHeaderState, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Scroll reveal — elements already in the initial viewport reveal immediately
// (no flash of hidden content); everything else animates in via IntersectionObserver.
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);
revealEls.forEach((el) => {
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    el.classList.add('in-view');
  } else {
    revealObserver.observe(el);
  }
});

// Stat counters
const statEls = document.querySelectorAll('.stat-number');
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10) || 0;
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
statEls.forEach((el) => statObserver.observe(el));

// Contact form validation (front-end only — no network submission)
const form = document.getElementById('contact-form');
const successMessage = document.getElementById('form-success');

function setFieldError(input, errorEl, message) {
  input.classList.toggle('invalid', Boolean(message));
  if (errorEl) errorEl.textContent = message || '';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  successMessage.hidden = true;

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');

  let valid = true;

  if (!nameInput.value.trim()) {
    setFieldError(nameInput, document.getElementById('name-error'), 'Please enter your name.');
    valid = false;
  } else {
    setFieldError(nameInput, document.getElementById('name-error'), '');
  }

  if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
    setFieldError(emailInput, document.getElementById('email-error'), 'Please enter a valid email address.');
    valid = false;
  } else {
    setFieldError(emailInput, document.getElementById('email-error'), '');
  }

  if (!messageInput.value.trim()) {
    setFieldError(messageInput, document.getElementById('message-error'), 'Please enter a message.');
    valid = false;
  } else {
    setFieldError(messageInput, document.getElementById('message-error'), '');
  }

  if (!valid) return;

  // No backend wired up yet — swap this block for a real submission
  // (e.g. fetch() to Formspree/Netlify Forms) when ready to go live.
  form.reset();
  successMessage.hidden = false;
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
