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
})();