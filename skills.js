// skills.js — Interactivity for the Skills page

document.addEventListener('DOMContentLoaded', () => {

  // ── Inject SVG gradient def for skill rings ──────────────
  const svgDef = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgDef.setAttribute('width', '0');
  svgDef.setAttribute('height', '0');
  svgDef.style.position = 'absolute';
  svgDef.innerHTML = `
    <defs>
      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#7c3aed"/>
        <stop offset="100%" stop-color="#a855f7"/>
      </linearGradient>
    </defs>`;
  document.body.prepend(svgDef);

  // ── Category Tab Filter ───────────────────────────────────
  const tabs = document.querySelectorAll('.cat-tab');
  const cards = document.querySelectorAll('.skill-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.getAttribute('data-cat');

      cards.forEach((card, i) => {
        const cardCat = card.getAttribute('data-cat');
        const show = cat === 'all' || cardCat === cat;

        if (show) {
          card.classList.remove('hidden');
          card.style.display = '';
          card.style.animationDelay = `${i * 0.05}s`;
          // Re-trigger animation
          card.style.animation = 'none';
          void card.offsetWidth;
          card.style.animation = '';
        } else {
          card.classList.add('hidden');
          card.style.display = 'none';
        }
      });
    });
  });

  // ── Skill bar & ring IntersectionObserver ─────────────────
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.skill-bar-fill');
        if (fill) {
          const targetW = fill.style.getPropertyValue('--w');
          fill.style.width = '0%';
          requestAnimationFrame(() => {
            setTimeout(() => {
              fill.style.width = targetW;
            }, 60);
          });
        }
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  cards.forEach(card => barObserver.observe(card));

  // ── General scroll-in animations ─────────────────────────
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  // Observe timeline items
  document.querySelectorAll('.exp-item').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-20px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.12}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`;
    revealObs.observe(el);
  });

  // Observe principle cards
  document.querySelectorAll('.principle-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`;
    revealObs.observe(el);
  });

  // Observe cert cards
  document.querySelectorAll('.cert-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s`;
    revealObs.observe(el);
  });

  // Observe learning banner
  const banner = document.getElementById('learning-banner');
  if (banner) {
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(20px)';
    banner.style.transition = 'opacity 0.6s ease 0.2s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s';
    revealObs.observe(banner);
  }

  // Inject reveal style
  const style = document.createElement('style');
  style.textContent = `.revealed { opacity: 1 !important; transform: translate(0,0) !important; }`;
  document.head.appendChild(style);

  // ── Smooth hero stat number count-up ─────────────────────
  const statNums = document.querySelectorAll('.stat-chip-num');
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      const num = parseInt(raw);
      const suffix = raw.replace(/[0-9]/g, '');
      if (isNaN(num)) return;

      let start = 0;
      const duration = 1200;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * num) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countObs.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => countObs.observe(el));

});
