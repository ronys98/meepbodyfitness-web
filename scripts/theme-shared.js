(function () {
  const THEME_KEY = 'meep-theme';
  const pageBody = document.body;
  const themeButton = document.getElementById('theme-toggle');
  const storage = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} }
  };

  if (storage.get(THEME_KEY) === 'light') pageBody.classList.add('light-mode');

  function syncThemeButton() {
    if (!themeButton) return;
    const isLight = pageBody.classList.contains('light-mode');
    themeButton.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    themeButton.textContent = isLight ? 'DEN' : 'NOC';
  }

  function animateThemeTransition(e) {
    const rect = themeButton.getBoundingClientRect();
    const x = e?.clientX ?? rect.left + rect.width / 2;
    const y = e?.clientY ?? rect.top + rect.height / 2;
    pageBody.style.setProperty('--tx', `${x}px`);
    pageBody.style.setProperty('--ty', `${y}px`);
    pageBody.classList.remove('theme-transitioning');
    void pageBody.offsetWidth;
    pageBody.classList.add('theme-transitioning');
    setTimeout(() => pageBody.classList.remove('theme-transitioning'), 680);
  }

  if (themeButton) {
    themeButton.addEventListener('click', (e) => {
      animateThemeTransition(e);
      themeButton.classList.remove('switch-pop');
      void themeButton.offsetWidth;
      themeButton.classList.add('switch-pop');
      pageBody.classList.toggle('light-mode');
      const mode = pageBody.classList.contains('light-mode') ? 'light' : 'dark';
      storage.set(THEME_KEY, mode);
      syncThemeButton();
      setTimeout(() => themeButton.classList.remove('switch-pop'), 430);
    });
  }

  function bindHistoryBack(link, fallback) {
    if (!link) return;
    link.addEventListener('click', (e) => {
      if (document.referrer) {
        e.preventDefault();
        window.history.back();
      } else if (!link.getAttribute('href') && fallback) {
        e.preventDefault();
        window.location.href = fallback;
      }
    });
  }

  function initMobileSubpageNav() {
    const wrap = document.querySelector('.wrap');
    const pageNav = document.querySelector('.page-nav');
    if (!wrap || !pageNav) return;

    const existingBackLink = pageNav.querySelector('.back');
    const fallback = existingBackLink?.getAttribute('href') || '../Main-Page.html';
    bindHistoryBack(existingBackLink, fallback);

    if (document.querySelector('.subpage-mobile-header')) return;

    const mobileHeader = document.createElement('header');
    mobileHeader.className = 'site-header subpage-mobile-header';
    mobileHeader.innerHTML = `<div class="container nav-wrap">
        <a class="brand" href="../Main-Page.html#home" aria-label="MEEP BodyFitness domů"><img src="../logo/MeepBodyfitnessLogo.png" alt="MEEP BodyFitness logo"><span>MEEP BodyFitness</span></a>
        <div class="mobile-quick-links" aria-label="Rychlé odkazy"><a href="info.html">Info</a><a href="../Main-Page.html#contact">Kontakt</a><a class="mobile-back-link" href="${fallback}">Zpět</a></div>
        <button class="nav-toggle" type="button" aria-label="Otevřít navigaci" aria-expanded="false" aria-controls="site-nav-subpage">☰</button>
        <nav id="site-nav-subpage" class="site-nav" aria-label="Mobilní navigace"><div class="mobile-nav-group" aria-label="Obecné informace"><p class="mobile-nav-title">Obecné informace</p><a href="../Main-Page.html#home">Domů</a><a href="../Main-Page.html#about">O nás</a><a href="info.html">Info</a><a href="../Main-Page.html#sponsors">Sponzoři</a><a href="../Main-Page.html#contact">Kontakt</a></div><div class="mobile-nav-group" aria-label="Služby a zóny"><p class="mobile-nav-title">Služby a zóny</p><a href="kardio-zona.html">Kardio zóna</a><a href="posilovna.html">Posilovna</a><a href="inbody-diagnostika.html">InBody diagnostika</a><a href="vacutherm.html">VacuTherm</a><a href="kryolipolyza.html">Kryolipolýza</a><a href="lymfa-masaze.html">Lymfa masáže</a><a href="spaceship-recovery.html">SpaceShip recovery</a><a href="solarium.html">Solárium</a></div></nav>
      </div>`;

    document.body.insertBefore(mobileHeader, wrap);

    const toggleButton = mobileHeader.querySelector('.nav-toggle');
    const drawer = mobileHeader.querySelector('.site-nav');
    const mobileBackLink = mobileHeader.querySelector('.mobile-back-link');

    bindHistoryBack(mobileBackLink, fallback);

    function syncDrawer() {
      const isOpen = drawer.classList.contains('is-open');
      toggleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggleButton.setAttribute('aria-label', isOpen ? 'Zavřít navigaci' : 'Otevřít navigaci');
      toggleButton.textContent = isOpen ? '✕' : '☰';
    }

    function closeDrawer() {
      drawer.classList.remove('is-open');
      pageBody.classList.remove('nav-open');
      syncDrawer();
    }

    toggleButton.addEventListener('click', () => {
      drawer.classList.toggle('is-open');
      pageBody.classList.toggle('nav-open', drawer.classList.contains('is-open'));
      syncDrawer();
    });

    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 760px)').matches) closeDrawer();
      });
    });

    document.addEventListener('click', (e) => {
      if (!window.matchMedia('(max-width: 760px)').matches || !drawer.classList.contains('is-open')) return;
      if (e.target instanceof Element && !drawer.contains(e.target) && !toggleButton.contains(e.target)) closeDrawer();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 760) closeDrawer();
    });

    syncDrawer();
  }

  function initGalleryToggles() {
    const galleries = document.querySelectorAll('.gallery');
    if (window.matchMedia('(max-width: 760px)').matches) return;

    galleries.forEach((gallery) => {
      const items = gallery.querySelectorAll('figure');
      const layout = gallery.closest('.layout');
      const galleryInAside = gallery.closest('aside');

      if (layout && galleryInAside) layout.classList.add('layout-has-aside-gallery');
      if (items.length <= 4) return;

      gallery.classList.add('is-collapsed');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn gallery-toggle';
      btn.textContent = 'Zobrazit více fotek';
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', () => {
        const collapsed = gallery.classList.toggle('is-collapsed');
        btn.textContent = collapsed ? 'Zobrazit více fotek' : 'Zobrazit méně fotek';
        btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        if (collapsed) btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });

      gallery.insertAdjacentElement('afterend', btn);
    });
  }

  function initGalleryLightbox() {
    const galleryImages = Array.from(document.querySelectorAll('.gallery img'));
    if (!galleryImages.length) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('hidden', '');
    lightbox.innerHTML = `<div class="lightbox-content" role="dialog" aria-modal="true" aria-label="Náhled fotky"><button type="button" class="lightbox-close" aria-label="Zavřít náhled">✕</button><img class="lightbox-image" src="" alt=""><p class="lightbox-caption"></p></div>`;

    const closeBtn = lightbox.querySelector('.lightbox-close');
    const image = lightbox.querySelector('.lightbox-image');
    const caption = lightbox.querySelector('.lightbox-caption');

    const closeLightbox = () => {
      lightbox.setAttribute('hidden', '');
      pageBody.classList.remove('lightbox-open');
      image.removeAttribute('src');
      image.removeAttribute('alt');
      caption.textContent = '';
    };

    const openLightbox = (img) => {
      image.src = img.currentSrc || img.src;
      image.alt = img.alt || 'Náhled fotky';
      caption.textContent = img.alt || '';
      lightbox.removeAttribute('hidden');
      pageBody.classList.add('lightbox-open');
      closeBtn.focus();
    };

    galleryImages.forEach((img) => {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `Otevřít fotku: ${img.alt || 'náhled'}`);
      img.addEventListener('click', () => openLightbox(img));
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(img);
        }
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !lightbox.hasAttribute('hidden')) closeLightbox();
    });

    pageBody.appendChild(lightbox);
  }

  function initMobileActionRows() {
    if (!window.matchMedia('(max-width: 760px)').matches) return;
    document.querySelectorAll('.box').forEach((box) => {
      const actions = Array.from(box.querySelectorAll(':scope > a.cta, :scope > a.btn'));
      if (!actions.length) return;
      const row = document.createElement('div');
      row.className = 'mobile-action-row';
      actions.forEach((a) => row.appendChild(a));
      box.appendChild(row);
    });
  }

  syncThemeButton();
  initMobileSubpageNav();
  initMobileActionRows();
  initGalleryToggles();
  initGalleryLightbox();
})();
