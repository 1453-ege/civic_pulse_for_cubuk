// ═══════════════════════════════════════════════════════════════
//  CivicPulse – Global App Logic
//  Auth modal, smooth scroll, nav, intersection observer, toasts
// ═══════════════════════════════════════════════════════════════

// ── User State ────────────────────────────────────────────────
let currentUser = null;

function loadUser() {
  const saved = localStorage.getItem('civicpulse_user');
  if (saved) {
    currentUser = JSON.parse(saved);
    return true;
  }
  return false;
}

function saveUser(data) {
  currentUser = data;
  localStorage.setItem('civicpulse_user', JSON.stringify(data));
}

function getUserInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Auth Modal ────────────────────────────────────────────────
function initAuth() {
  if (loadUser()) {
    applyUserToDOM();
    return;
  }
  showAuthModal();
}

function showAuthModal() {
  const overlay = document.getElementById('auth-modal-overlay');
  if (overlay) {
    setTimeout(() => overlay.classList.add('open'), 100);
  }
}

function applyUserToDOM() {
  const nameEls = document.querySelectorAll('[data-user-name]');
  const avatarEls = document.querySelectorAll('[data-user-avatar]');
  const neighborhoodEls = document.querySelectorAll('[data-user-neighborhood]');

  nameEls.forEach(el => {
    el.textContent = currentUser.name;
  });
  avatarEls.forEach(el => {
    el.textContent = getUserInitials(currentUser.name);
  });
  neighborhoodEls.forEach(el => {
    el.textContent = currentUser.neighborhood;
  });
}

function setupAuthModal() {
  const overlay   = document.getElementById('auth-modal-overlay');
  const form      = document.getElementById('auth-form');
  const nameInput = document.getElementById('auth-name');
  const neighInput= document.getElementById('auth-neighborhood');
  const submitBtn = document.getElementById('auth-submit');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const neighborhood = neighInput.value.trim();
    if (!name || !neighborhood) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Kaydediliyor…';

    setTimeout(() => {
      saveUser({ name, neighborhood });
      overlay.classList.remove('open');
      applyUserToDOM();
      showToast('success', `Hoş geldin, ${name}! 👋`);
      submitBtn.disabled = false;
    }, 800);
  });

  // Name input formatting
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      submitBtn.disabled = !nameInput.value.trim() || !neighInput.value.trim();
    });
  }
  if (neighInput) {
    neighInput.addEventListener('input', () => {
      submitBtn.disabled = !nameInput.value.trim() || !neighInput.value.trim();
    });
  }
}

// ── Toast Notifications ───────────────────────────────────────
function showToast(type, message, duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Intersection Observer (Scroll Reveal) ─────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── Active Nav Link ───────────────────────────────────────────
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });
}

// ── Smooth Scroll ─────────────────────────────────────────────
function initSmoothScroll() {
  let scrollY = window.scrollY;
  let targetY = scrollY;
  let rafId   = null;
  const LERP  = 0.12;

  function lerp(a, b, t) { return a + (b - a) * t; }

  // Only on desktop (mobile already has good native scroll)
  if (window.innerWidth < 768) return;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      targetY = target.getBoundingClientRect().top + window.scrollY - 80;
      animateScroll();
    });
  });

  function animateScroll() {
    if (rafId) cancelAnimationFrame(rafId);
    function step() {
      scrollY = lerp(scrollY, targetY, LERP);
      window.scrollTo(0, scrollY);
      if (Math.abs(scrollY - targetY) > 0.5) {
        rafId = requestAnimationFrame(step);
      }
    }
    rafId = requestAnimationFrame(step);
  }
}

// ── Animated counter ──────────────────────────────────────────
function animateCounter(el, target, duration = 1600) {
  const start = performance.now();
  const from  = 0;

  function update(now) {
    const t   = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (target - from) * ease).toLocaleString('tr-TR');
    if (t < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el  = entry.target;
        const val = parseInt(el.dataset.count, 10);
        if (!isNaN(val)) animateCounter(el, val);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

// ── Nav Scroll Behaviour ──────────────────────────────────────
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 80) {
      nav.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
    } else {
      nav.style.boxShadow = 'none';
    }
    lastY = y;
  }, { passive: true });
}

// ── Global Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupAuthModal();
  initAuth();
  setActiveNavLink();
  initScrollReveal();
  initSmoothScroll();
  initCounters();
  initNavScroll();
});
