// contact.js — Interactivity for the Contact page

document.addEventListener('DOMContentLoaded', () => {

  // ── Smooth scroll for hero CTA ────────────────────────────
  const heroCta = document.getElementById('hero-cta-form');
  if (heroCta) {
    heroCta.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('contact-form');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // ── Character counter for textarea ───────────────────────
  const textarea = document.getElementById('field-message');
  const charCount = document.getElementById('char-count');

  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = `${len} / 500`;
      charCount.style.color = len > 450 ? '#f59e0b' : len >= 500 ? '#ef4444' : '#374151';
    });
  }

  // ── Live input validation helpers ────────────────────────
  function validateField(input, groupId, errorId, checkFn) {
    const group = document.getElementById(groupId);
    const err   = document.getElementById(errorId);
    if (!group || !err) return true;

    const valid = checkFn(input.value.trim());
    group.classList.toggle('has-error', !valid && input.value.length > 0);
    group.classList.toggle('is-valid', valid);
    return valid;
  }

  const nameField    = document.getElementById('field-name');
  const emailField   = document.getElementById('field-email');
  const subjectField = document.getElementById('field-subject');
  const msgField     = document.getElementById('field-message');

  if (nameField) {
    nameField.addEventListener('blur', () =>
      validateField(nameField, 'fg-name', 'err-name', v => v.length >= 2));
  }

  if (emailField) {
    emailField.addEventListener('blur', () =>
      validateField(emailField, 'fg-email', 'err-email',
        v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)));
  }

  if (subjectField) {
    subjectField.addEventListener('change', () =>
      validateField(subjectField, 'fg-subject', 'err-subject', v => v !== ''));
  }

  if (msgField) {
    msgField.addEventListener('blur', () =>
      validateField(msgField, 'fg-message', 'err-message', v => v.length >= 10));
  }

  // ── Form submission ───────────────────────────────────────
  const form       = document.getElementById('main-contact-form');
  const submitBtn  = document.getElementById('form-submit-btn');
  const submitLbl  = document.getElementById('submit-label');
  const successBox = document.getElementById('form-success');
  const resetBtn   = document.getElementById('form-reset-btn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate all fields on submit
      const nameOk = nameField && validateField(nameField, 'fg-name', 'err-name', v => v.length >= 2);
      const emailOk = emailField && validateField(emailField, 'fg-email', 'err-email',
        v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      const subjectOk = subjectField && validateField(subjectField, 'fg-subject', 'err-subject', v => v !== '');
      const msgOk = msgField && validateField(msgField, 'fg-message', 'err-message', v => v.length >= 10);

      // Show errors for empty required fields
      if (nameField && !nameField.value.trim()) {
        document.getElementById('fg-name')?.classList.add('has-error');
      }
      if (emailField && !emailField.value.trim()) {
        document.getElementById('fg-email')?.classList.add('has-error');
      }
      if (subjectField && !subjectField.value) {
        document.getElementById('fg-subject')?.classList.add('has-error');
      }
      if (msgField && msgField.value.trim().length < 10) {
        document.getElementById('fg-message')?.classList.add('has-error');
      }

      if (!nameOk || !emailOk || !subjectOk || !msgOk) return;

      // Loading state
      submitBtn.classList.add('loading');

      // Simulate async send (replace with real fetch/formspree/etc.)
      await new Promise(resolve => setTimeout(resolve, 1600));

      // Show success
      submitBtn.classList.remove('loading');
      form.style.display = 'none';
      if (successBox) successBox.style.display = 'block';
    });
  }

  // Reset form
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (form) {
        form.reset();
        form.style.display = 'flex';
        // Clear all validation states
        document.querySelectorAll('.form-group').forEach(g => {
          g.classList.remove('has-error', 'is-valid');
        });
        if (charCount) charCount.textContent = '0 / 500';
      }
      if (successBox) successBox.style.display = 'none';
    });
  }

  // ── FAQ Accordion ─────────────────────────────────────────
  const faqBtns = document.querySelectorAll('.faq-q');

  faqBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.id.replace('faq-btn-', 'faq-a-');
      const answer   = document.getElementById(answerId);

      // Close all others
      faqBtns.forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          const otherId  = other.id.replace('faq-btn-', 'faq-a-');
          const otherAns = document.getElementById(otherId);
          if (otherAns) otherAns.classList.remove('open');
        }
      });

      // Toggle current
      btn.setAttribute('aria-expanded', String(!expanded));
      if (answer) answer.classList.toggle('open', !expanded);
    });
  });

  // Open first FAQ by default
  const firstBtn = document.getElementById('faq-btn-1');
  const firstAns = document.getElementById('faq-a-1');
  if (firstBtn && firstAns) {
    firstBtn.setAttribute('aria-expanded', 'true');
    firstAns.classList.add('open');
  }

  // ── IntersectionObserver — scroll-in reveals ──────────────
  const revealEls = [
    ...document.querySelectorAll('.contact-detail-card'),
    ...document.querySelectorAll('.social-card'),
    ...document.querySelectorAll('.sidebar-card'),
    ...document.querySelectorAll('.work-pref-item'),
    document.getElementById('avail-status-main'),
    document.getElementById('resp-time-row'),
  ].filter(Boolean);

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        entry.target.style.transition = `opacity 0.5s ease ${idx * 0.06}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${idx * 0.06}s`;
        entry.target.classList.add('revealed');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    revealObs.observe(el);
  });

  // Inject reveal class
  const style = document.createElement('style');
  style.textContent = `.revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
  document.head.appendChild(style);

  // ── Real-time clock for timezone display ─────────────────
  // (optional enhancement — shows local time)
  function updateClock() {
    const now = new Date();
    const slTime = now.toLocaleTimeString('en-LK', {
      timeZone: 'Asia/Colombo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const tzCard = document.getElementById('sidebar-tz');
    if (tzCard) {
      const desc = tzCard.querySelector('.sidebar-card-desc');
      if (desc && !desc.dataset.updated) {
        desc.dataset.updated = '1';
        const clockSpan = document.createElement('span');
        clockSpan.id = 'live-clock';
        clockSpan.style.cssText = 'display:block; margin-top:6px; font-size:13px; font-weight:700; color:#a78bfa;';
        clockSpan.textContent = `Local time: ${slTime}`;
        desc.appendChild(clockSpan);
      } else {
        const clockEl = document.getElementById('live-clock');
        if (clockEl) clockEl.textContent = `Local time: ${slTime}`;
      }
    }
  }

  updateClock();
  setInterval(updateClock, 60000);

});
