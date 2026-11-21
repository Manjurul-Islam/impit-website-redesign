(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* -------- scrollbar-free viewport width for the 1u scale -------- */
  const setVW = () => root.style.setProperty('--vw', root.clientWidth + 'px');
  setVW();
  addEventListener('resize', setVW, { passive: true });

  /* -------- hero intro -------- */
  const heroImg = $('.hero__slide img');
  const loaded = () => requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  if (heroImg.complete) loaded(); else { heroImg.addEventListener('load', loaded); setTimeout(loaded, 1200); }

  /* -------- hero slider: one image, four framings -------- */
  const slides = $$('.hero__slide');
  const dots = $$('.hero__dots button');
  const cur = $('#heroCur');
  let index = 0, timer;
  const DURATION = 6500;
  const show = (n) => {
    if (n === index) return;
    const prev = slides[index];
    slides.forEach(s => s.classList.remove('is-leaving'));
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    index = (n + slides.length) % slides.length;
    const next = slides[index];
    // restart ken-burns
    void next.offsetWidth; // commit the parked state so the push-in always transitions
    next.classList.add('is-active');
    setTimeout(() => prev.classList.remove('is-leaving'), 1450);
    dots.forEach((d, i) => d.setAttribute('aria-selected', i === index));
    cur.textContent = index + 1;
    cur.classList.remove('tick'); void cur.offsetWidth; cur.classList.add('tick');
  };
  const play = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show(index + 1), DURATION); };
  dots.forEach((d, i) => d.addEventListener('click', () => { show(i); play(); }));
  dots.forEach((d, i) => d.setAttribute('aria-selected', i === 0));
  cur.textContent = 1;
  // start the slow zoom on the first slide without wiping it in
  slides[0].classList.add('is-first'); slides[0].classList.remove('is-active'); void slides[0].offsetWidth;
  slides[0].classList.add('is-active'); requestAnimationFrame(() => requestAnimationFrame(() => slides[0].classList.remove('is-first')));
  play();
  document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : play());
  // swipe on touch
  let sx = null;
  const hero = $('.hero');
  hero.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) { show(index + (dx < 0 ? 1 : -1)); play(); }
  });

  /* -------- dropdown menu -------- */
  const menuBtn = $('#menuBtn'), menu = $('#menu'), scrim = $('#scrim');
  const isOpen = () => document.body.classList.contains('menu-open');
  const setMenu = (open, focusBack = true, viaKeyboard = false) => {
    if (open === isOpen()) return;
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', !open);
    menu.inert = !open;
    if (open) { topbar.classList.remove('is-hidden'); if (viaKeyboard) setTimeout(() => { const f = $('a', menu); f && f.focus({ preventScroll: true }); }, 350); }
    else if (focusBack && menu.contains(document.activeElement)) menuBtn.focus({ preventScroll: true });
  };
  const topbar = $('#topbar');
  menuBtn.addEventListener('click', e => setMenu(!isOpen(), true, e.detail === 0));
  scrim.addEventListener('click', () => setMenu(false));
  $$('[data-close]', menu).forEach(a => a.addEventListener('click', () => setMenu(false, false)));
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen()) setMenu(false);
    if (e.key === 'Tab' && isOpen()) {           // keep focus inside the bar while open
      const f = [menuBtn, ...$$('a', menu)], i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* -------- accordion -------- */
  const items = $$('.acc__item');
  items.forEach(item => {
    $('.acc__head', item).addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      items.forEach(i => { i.classList.remove('is-open'); $('.acc__head', i).setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('is-open'); $('.acc__head', item).setAttribute('aria-expanded', 'true'); }
    });
  });


  /* -------- leaders: click a photo to make it the active message -------- */
  const leaders = $$('.leader');
  // Use a colour original when one is provided (Figma only ships this portrait in grayscale)
  $$('.leader img[data-color-src]').forEach(img => {
    const probe = new Image();
    probe.onload = () => { img.src = probe.src; };
    probe.src = img.dataset.colorSrc;
  });
  const swap = $('#leaderSwap'), card = $('#leaderCard');
  const data = JSON.parse($('#leadersData').textContent);
  let activeLeader = 0, swapping = false;
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const render = d => `<blockquote class="leaders__quote">${esc(d.quote)}</blockquote>
    <p class="leaders__text">${esc(d.text)}</p>
    <p class="leaders__sign"><strong>${esc(d.name)}</strong><span>${esc(d.role)}</span></p>`;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const setLeader = async (n) => {
    if (n === activeLeader || swapping) return;
    swapping = true; activeLeader = n;
    $('.leaders__grid').dataset.active = n;
    leaders.forEach((b, i) => { const on = i === n; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); b.tabIndex = on ? -1 : 0; });
    if (reduce) { swap.innerHTML = render(data[n]); swapping = false; return; }
    // 1. text eases out while the photos start trading places
    swap.classList.add('is-out');
    await wait(420);
    // 2. swap copy; keep card height continuous (animate old -> new)
    const h0 = card.offsetHeight;
    swap.innerHTML = render(data[n]);
    swap.classList.remove('is-out'); swap.classList.add('is-pre');
    const h1 = card.offsetHeight;
    if (Math.abs(h1 - h0) > 1) card.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 600, easing: 'cubic-bezier(.65,0,.35,1)' });
    void swap.offsetWidth;
    // 3. text eases back in
    swap.classList.remove('is-pre');
    await wait(560);
    swapping = false;
  };
  leaders.forEach((b, i) => {
    b.tabIndex = i === activeLeader ? -1 : 0;
    b.addEventListener('click', () => setLeader(+b.dataset.leader));
    b.addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault(); const nx = (i + 1) % leaders.length; leaders[nx].focus(); setLeader(nx);
    });
  });

  /* -------- reveals -------- */
  const count = (el) => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) return;
    const t0 = performance.now(), dur = 1600;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      $$('[data-count]', en.target).forEach(count);
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
  $$('[data-reveal], [data-reveal-img]').forEach(el => io.observe(el));

  /* -------- footer wordmark letters -------- */
  const word = $('#brandWord');
  word.innerHTML = [...word.textContent].map((c, i) => `<span style="transition-delay:${i * 0.08}s">${c}</span>`).join('');
  new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { word.classList.add('is-in'); o.disconnect(); } }, { threshold: 0.2 }).observe(word);

  /* -------- scroll: progress, header theme, parallax -------- */
  const bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar);
  const heroMedia = $('#heroMedia');
  const ctaImg = $('#ctaImg'), cta = $('.cta');
  const darkZones = [$('.hero'), $('.services .acc'), cta, $('.footer')];
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, h = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    topbar.classList.toggle('is-scrolled', y > 8);
    // header: dark glass when over light sections
    const r = topbar.firstElementChild.getBoundingClientRect();
    const mid = r.top + r.height / 2;
    const onDark = darkZones.some(z => { const b = z.getBoundingClientRect(); return b.top <= mid && b.bottom >= mid; });
    topbar.classList.toggle('on-light', !onDark);
    // hide on scroll down, show on scroll up
    if (!document.body.classList.contains('menu-open')) topbar.classList.toggle('is-hidden', y > innerHeight * 0.6 && y > lastY + 2);
    if (y < lastY - 2 || y < 80) topbar.classList.remove('is-hidden');
    lastY = y;
    if (reduce) return;
    // hero parallax (free-floating layer)
    if (y < innerHeight * 1.2) heroMedia.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
    // CTA background parallax (image overscanned by 14% so no gaps)
    const cr = cta.getBoundingClientRect();
    if (cr.bottom > 0 && cr.top < innerHeight) {
      const p = (cr.top + cr.height / 2 - innerHeight / 2) / (innerHeight + cr.height);
      ctaImg.style.transform = `translate3d(0, ${p * -12}%, 0)`;
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  $('#toTop').addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
})();
