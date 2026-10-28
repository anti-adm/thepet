(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const loader = document.querySelector('.paw-loader');
  let finished = false;
  let observer;
  const finishEntrance = () => {
    if (finished) return;
    finished = true;
    root.classList.remove('is-arriving');
    root.classList.add('has-arrived');
    try { sessionStorage.setItem('ada-welcomed', '1'); } catch (_) { /* Optional session preference. */ }
    setTimeout(() => loader?.remove(), 700);
  };
  // A brief first-visit welcome follows hero readiness, with a hard upper bound.
  if (root.classList.contains('is-arriving') && !reduced.matches) {
    const hero = document.querySelector('.hero-photo img');
    const ready = hero?.decode ? hero.decode().catch(() => {}) : Promise.resolve();
    Promise.all([Promise.race([ready, new Promise(resolve => setTimeout(resolve, 1800))]), new Promise(resolve => setTimeout(resolve, 850))]).then(finishEntrance);
    window.addEventListener('keydown', finishEntrance, { once: true });
    window.addEventListener('pointerdown', finishEntrance, { once: true });
  } else finishEntrance();

  // Small original vector flourishes: decorative, hidden from assistive technology.
  const flower = `<svg viewBox="0 0 120 120" fill="none" aria-hidden="true"><g class="petals" stroke="currentColor" stroke-width="1.3"><path d="M60 49C26 22 50 1 60 30C70 1 94 22 71 49C103 25 123 54 85 60C123 66 103 95 71 71C94 98 70 119 60 90C50 119 26 98 49 71C17 95-3 66 35 60C-3 54 17 25 49 49Z"/><circle cx="60" cy="60" r="11"/><circle cx="60" cy="60" r="4" fill="currentColor" stroke="none"/></g></svg>`;
  const sprig = `<svg viewBox="0 0 180 220" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path class="stem" pathLength="1" d="M41 213C105 168 72 104 130 55M79 168C56 163 42 144 39 123C65 129 79 144 79 168ZM86 143C110 143 132 126 140 108C112 110 94 120 86 143ZM99 99C75 96 65 78 64 62C86 67 95 80 99 99Z"/><g class="sprig-blossom"><path d="M130 48C105 29 120 11 132 30C137 4 162 15 149 37C175 28 183 54 155 57C176 74 155 92 142 69C137 95 113 86 125 65C100 74 95 48 121 48Z" fill="#f0ceda" fill-opacity=".45"/><circle cx="139" cy="50" r="7"/></g></g></svg>`;
  [['.possibilities .wrap','flower-left',sprig],['.possibilities .wrap','flower-right',flower],['.deliverables-copy','flower-deliverables',flower],['.about-copy','flower-about',sprig],['.final-offer','flower-offer',sprig]].forEach(([selector,name,svg]) => {
    const host = document.querySelector(selector);
    if (!host) return;
    const accent = document.createElement('span');
    accent.className = `botanical ${name}`;
    accent.setAttribute('aria-hidden','true');
    accent.innerHTML = svg;
    host.append(accent);
  });
  document.querySelector('.offer-flower').innerHTML = flower;

  const revealGroups = [
    ['.botanical svg', 0],
    ['.recognition > div',100], ['.pain-list p',65],
    ['.possibilities .eyebrow, .possibilities h2',100], ['.possibility-grid > div',95],
    ['.section-heading',0], ['.chapter-grid article',70],
    ['.mockup-scene, .deliverables-copy',120], ['.check-list li',65],
    ['.about-photo, .about-copy',110], ['.faq > div:first-child, .faq-item',65],
    ['.final-offer > :not(.botanical)',55]
  ];
  if (!reduced.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -20px 0px' });
    revealGroups.forEach(([selector, stagger]) => document.querySelectorAll(selector).forEach((element, index) => {
      // Already-visible content stays readable while the welcome fades away.
      if (element.getBoundingClientRect().top < innerHeight) return;
      element.classList.add('reveal');
      element.style.setProperty('--reveal-delay', `${Math.min(index * stagger, 210)}ms`);
      observer.observe(element);
    }));
  }
  const showEverything = () => {
    finishEntrance();
    observer?.disconnect();
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  };
  reduced.addEventListener('change', event => { if (event.matches) showEverything(); });
  // Tab navigation must never focus an invisible control.
  document.addEventListener('focusin', event => {
    let node = event.target;
    while (node && node !== document.body) {
      if (node.classList?.contains('reveal')) node.classList.add('is-visible');
      node = node.parentElement;
    }
  });
  window.addEventListener('beforeprint', showEverything);
})();
