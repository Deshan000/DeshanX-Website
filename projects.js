// projects.js — Filter & animation logic for the Projects page

document.addEventListener('DOMContentLoaded', () => {

  // ── Filter Pills ──────────────────────────────────────────
  const pills = document.querySelectorAll('.pill');
  const cards = document.querySelectorAll('.proj-card');
  const noResults = document.getElementById('no-results');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      // Update active pill
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.getAttribute('data-filter');
      let visibleCount = 0;

      cards.forEach((card, i) => {
        const cat = card.getAttribute('data-category');
        const match = filter === 'all' || cat === filter;

        if (match) {
          card.style.display = 'flex';
          card.style.animationDelay = `${i * 0.06}s`;
          card.classList.remove('hidden');
          // Re-trigger animation
          card.style.animation = 'none';
          void card.offsetWidth; // reflow
          card.style.animation = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
          card.classList.add('hidden');
        }
      });

      if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    });
  });

  // ── Intersection Observer for scroll-in animations ────────
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe process steps
  document.querySelectorAll('.process-step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    observer.observe(el);
  });

  // Observe tech category cards
  document.querySelectorAll('.tech-category-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`;
    observer.observe(el);
  });

  // Animate in when visible
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .in-view {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(styleEl);

  // ── Tech bar fill animation on scroll ─────────────────────
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fills = entry.target.querySelectorAll('.tech-item-fill');
        fills.forEach(fill => {
          const targetWidth = fill.style.width;
          fill.style.width = '0%';
          requestAnimationFrame(() => {
            fill.style.width = targetWidth;
          });
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.tech-category-card').forEach(card => {
    barObserver.observe(card);
  });

});
