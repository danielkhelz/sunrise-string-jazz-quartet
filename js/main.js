/**
 * Enhancement opzionale — il sito deve funzionare anche senza questo file (Brave Shield off/on).
 */
(function () {
  'use strict';

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  try {
    const header = document.getElementById('header');
    if (header) {
      const setHeaderH = () => {
        document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
      };
      setHeaderH();
      window.addEventListener('resize', setHeaderH, { passive: true });
      window.addEventListener('load', setHeaderH);

      header.classList.add('header--top');
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > 40;
        header.classList.toggle('header--scrolled', scrolled);
        header.classList.toggle('header--top', !scrolled);
      }, { passive: true });
    }
  } catch (_) { /* ok */ }

  try {
    const drawer = document.querySelector('.nav__drawer');
    drawer?.querySelectorAll('.nav__menu a').forEach((link) => {
      link.addEventListener('click', () => {
        if (drawer.open) drawer.open = false;
      });
    });
  } catch (_) { /* ok */ }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function sanitizeVideoId(videoId) {
    const match = String(videoId).match(/^[a-zA-Z0-9_-]{11}$/);
    return match ? match[0] : null;
  }

  function mountYouTubeIframe(container, videoId, title) {
    const safeId = sanitizeVideoId(videoId);
    if (!container || !safeId) return;

    const iframe = document.createElement('iframe');
    const params = new URLSearchParams({
      autoplay: '1',
      playsinline: '1',
      rel: '0',
      modestbranding: '1'
    });
    iframe.src = `https://www.youtube-nocookie.com/embed/${safeId}?${params}`;
    iframe.title = title || 'Video Sunrise String Jazz Quartet';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    container.innerHTML = '';
    container.classList.add('video__player--active');
    container.appendChild(iframe);
  }

  try {
    document.querySelectorAll('.video__player[data-video]').forEach((container) => {
      const safeId = sanitizeVideoId(container.dataset.video);
      const btn = container.querySelector('.video__facade-btn');
      if (!safeId || !btn || btn.dataset.bound === '1') return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        mountYouTubeIframe(container, safeId, container.dataset.title || '');
      }, { once: true });
    });
  } catch (_) { /* ok */ }

  try {
    if (new URLSearchParams(window.location.search).get('inviato') === '1') {
      const contactSection = document.getElementById('contact');
      const form = contactSection?.querySelector('.contact__form');
      if (contactSection && form) {
        contactSection.querySelector('.contact__form-success')?.remove();
        const notice = document.createElement('p');
        notice.className = 'contact__form-success contact__form-success--visible';
        notice.setAttribute('role', 'status');
        notice.textContent = 'Richiesta inviata con successo. Ti risponderemo al più presto.';
        form.prepend(notice);
        const url = new URL(window.location.href);
        url.searchParams.delete('inviato');
        history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
      }
    }
  } catch (_) { /* ok */ }

  try {
    (function initScrollUp() {
      const OFFSET = 400;
      const drawer = document.querySelector('.nav__drawer');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ssjq-scroll-up';
      btn.setAttribute('aria-label', 'Torna in alto');
      btn.setAttribute('data-ssjq', 'scroll-up');
      btn.hidden = true;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';

      btn.style.setProperty('position', 'fixed');
      btn.style.setProperty('right', 'max(1.25rem, env(safe-area-inset-right, 0px))');
      btn.style.setProperty('bottom', 'max(1.25rem, env(safe-area-inset-bottom, 0px))');
      btn.style.setProperty('z-index', '150');
      btn.style.setProperty('display', 'flex');
      btn.style.setProperty('width', '48px');
      btn.style.setProperty('height', '48px');
      btn.style.setProperty('border', 'none');
      btn.style.setProperty('border-radius', '50%');
      btn.style.setProperty('background', '#c41e3a');
      btn.style.setProperty('color', '#fff');
      btn.style.setProperty('cursor', 'pointer');
      btn.style.setProperty('opacity', '0');
      btn.style.setProperty('visibility', 'hidden');

      document.body.appendChild(btn);

      const setVisible = (show) => {
        btn.classList.toggle('ssjq-scroll-up--on', show);
        btn.hidden = !show;
        btn.style.setProperty('opacity', show ? '1' : '0');
        btn.style.setProperty('visibility', show ? 'visible' : 'hidden');
        btn.style.setProperty('transform', show ? 'translateY(0)' : 'translateY(12px)');
      };

      const toggle = () => {
        const menuOpen = drawer?.open === true;
        setVisible(!menuOpen && window.scrollY > OFFSET);
      };

      window.addEventListener('scroll', toggle, { passive: true });
      window.addEventListener('resize', toggle, { passive: true });
      drawer?.addEventListener('toggle', toggle);
      toggle();

      btn.addEventListener('click', () => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
        btn.blur();
      });
    })();
  } catch (_) { /* ok */ }
})();