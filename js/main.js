document.documentElement.classList.add('js-ready');

const header = document.getElementById('header');
const toggle = document.querySelector('.nav__toggle');
const menu = document.querySelector('.nav__menu');
const yearEl = document.getElementById('year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

function updateHeaderHeight() {
  if (!header) return;
  document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
}

updateHeaderHeight();
window.addEventListener('resize', updateHeaderHeight, { passive: true });
window.addEventListener('orientationchange', updateHeaderHeight);
window.addEventListener('load', updateHeaderHeight);

const MQ_NAV = window.matchMedia('(max-width: 1200px)');

function setMenuOpen(open) {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
  menu.classList.toggle('nav__menu--open', open);
  document.body.classList.toggle('menu-open', open);
  document.body.style.overflow = open ? 'hidden' : '';

  if (open) {
    const firstLink = menu.querySelector('a');
    requestAnimationFrame(() => firstLink?.focus());
  } else {
    toggle.focus();
  }
}

function trapMenuFocus(e) {
  if (!menu?.classList.contains('nav__menu--open') || e.key !== 'Tab') return;
  const focusable = [...menu.querySelectorAll('a')];
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

let ignoreNextOutsideClick = false;

if (toggle && menu) {
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    ignoreNextOutsideClick = true;
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
    requestAnimationFrame(() => {
      ignoreNextOutsideClick = false;
    });
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('nav__menu--open')) {
      setMenuOpen(false);
    }
    trapMenuFocus(e);
  });

  document.addEventListener('click', e => {
    if (ignoreNextOutsideClick) return;
    if (!menu.classList.contains('nav__menu--open')) return;
    if (toggle.contains(e.target) || menu.contains(e.target)) return;
    setMenuOpen(false);
  });

  MQ_NAV.addEventListener('change', e => {
    if (!e.matches) setMenuOpen(false);
  });
}

if (header) {
  header.classList.add('header--top');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 40;
    header.classList.toggle('header--scrolled', scrolled);
    header.classList.toggle('header--top', !scrolled);
  }, { passive: true });
}

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__menu a');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${entry.target.id}`;
      link.classList.toggle('nav__link--active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-35% 0px -50% 0px' });

sections.forEach(section => navObserver.observe(section));

/* Scroll reveal — contenuto sempre leggibile se JS/Brave blocca qualcosa */
const revealEls = document.querySelectorAll('.reveal');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function markRevealVisible(el) {
  el.classList.add('reveal--visible');
  revealObserver.unobserve(el);
}

function revealInViewport() {
  revealEls.forEach(el => {
    if (el.classList.contains('reveal--visible')) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
      markRevealVisible(el);
    }
  });
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) markRevealVisible(entry.target);
  });
}, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });

if (prefersReducedMotion) {
  revealEls.forEach(el => el.classList.add('reveal--visible'));
} else {
  revealEls.forEach(el => revealObserver.observe(el));
  revealInViewport();
  window.addEventListener('load', () => {
    requestAnimationFrame(revealInViewport);
    window.setTimeout(revealInViewport, 120);
    window.setTimeout(revealInViewport, 900);
  });
  window.addEventListener('resize', revealInViewport, { passive: true });
}

/* Member cards — biografia al click */
document.querySelectorAll('.member-card').forEach(card => {
  card.addEventListener('toggle', () => {
    if (!card.open) return;

    document.querySelectorAll('.member-card').forEach(other => {
      if (other !== card) other.open = false;
    });

    requestAnimationFrame(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
});

/* Video YouTube */
const YT_ALLOW = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

function sanitizeVideoId(videoId) {
  const match = String(videoId).match(/^[a-zA-Z0-9_-]{11}$/);
  return match ? match[0] : null;
}

function buildYouTubeUrl(videoId, autoplay = false) {
  const safeId = sanitizeVideoId(videoId);
  if (!safeId) return '';
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1'
  });
  return `https://www.youtube-nocookie.com/embed/${safeId}?${params}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function mountYouTubeIframe(container, videoId, { autoplay = false, title = '' } = {}) {
  if (!container || !sanitizeVideoId(videoId)) return;
  const iframe = document.createElement('iframe');
  const src = buildYouTubeUrl(videoId, autoplay);
  if (!src) return;
  iframe.src = src;
  iframe.title = title || 'Video Sunrise String Jazz Quartet';
  iframe.allow = YT_ALLOW;
  iframe.allowFullscreen = true;
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  container.innerHTML = '';
  container.classList.add('video__player--active');
  container.appendChild(iframe);
}

function mountVideoFacade(container, videoId, { title = '' } = {}) {
  const safeId = sanitizeVideoId(videoId);
  if (!container || !safeId) return;
  const posterUrl = `https://i.ytimg.com/vi/${safeId}/hqdefault.jpg`;
  const safeTitle = escapeHtml(title || 'Riproduci video');

  container.classList.remove('video__player--active');
  container.innerHTML = `
    <button type="button" class="video__facade-btn" aria-label="${safeTitle}">
      <img src="${escapeHtml(posterUrl)}" alt="" loading="lazy">
      <span class="video__facade-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </span>
      <span class="video__facade-label">Riproduci video</span>
    </button>`;

  container.querySelector('.video__facade-btn').addEventListener('click', () => {
    mountYouTubeIframe(container, safeId, { autoplay: true, title });
  }, { once: true });
}

document.querySelectorAll('.video__player[data-video]').forEach(player => {
  mountVideoFacade(player, player.dataset.video, {
    title: player.dataset.title || ''
  });
});

/* Spotify embed — caricato solo al clic (compatibile Brave Shield) */
function sanitizeSpotifyId(id) {
  const match = String(id).match(/^[a-zA-Z0-9]{22}$/);
  return match ? match[0] : null;
}

function mountSpotifyFacade(container, albumId, { title = '' } = {}) {
  const safeId = sanitizeSpotifyId(albumId);
  if (!container || !safeId) return;

  const safeTitle = escapeHtml(title || 'Carica player Spotify');

  container.innerHTML = `
    <button type="button" class="spotify__facade-btn" aria-label="${safeTitle}">
      <span class="spotify__facade-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </span>
      <span class="spotify__facade-label">Ascolta su Spotify</span>
    </button>`;

  container.querySelector('.spotify__facade-btn').addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://open.spotify.com/embed/album/${safeId}?utm_source=generator&theme=0`;
    iframe.title = title || 'Jazz Landscapes su Spotify';
    iframe.width = '100%';
    iframe.height = '352';
    iframe.loading = 'lazy';
    iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    container.innerHTML = '';
    container.classList.add('album__player--active');
    container.appendChild(iframe);
  }, { once: true });
}

document.querySelectorAll('.album__player[data-spotify]').forEach(player => {
  mountSpotifyFacade(player, player.dataset.spotify, {
    title: player.dataset.spotifyTitle || ''
  });
});

/* Concerts — split upcoming / past */
const concertsPast = document.getElementById('concerts-past');
const concertsUpcoming = document.getElementById('concerts-upcoming');
const concertsEmpty = document.getElementById('concerts-empty');

if (concertsPast && concertsUpcoming) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingCards = [...concertsPast.querySelectorAll('.concert-card')]
    .filter(card => new Date(card.dataset.date + 'T12:00:00') >= today)
    .sort((a, b) => new Date(a.dataset.date) - new Date(b.dataset.date));

  upcomingCards.forEach((card, index) => {
    const body = card.querySelector('.concert-card__body');
    if (!body) return;

    card.classList.add('concert-card--upcoming');

    if (index === 0) {
      const badge = document.createElement('span');
      badge.className = 'concert-card__badge';
      badge.textContent = 'Prossimo';
      body.prepend(badge);
    }

    concertsUpcoming.appendChild(card);
  });

  if (!concertsUpcoming.children.length && concertsEmpty) {
    concertsEmpty.classList.add('concerts__empty--visible');
  }

  const heroUpcoming = document.getElementById('hero-upcoming');
  const heroUpcomingText = document.getElementById('hero-upcoming-text');
  const heroUpcomingLabel = document.getElementById('hero-upcoming-label');
  const firstUpcoming = upcomingCards[0];

  if (heroUpcoming && heroUpcomingText && heroUpcomingLabel && firstUpcoming) {
    const title = firstUpcoming.querySelector('.concert-card__title')?.textContent?.trim();
    const location = firstUpcoming.querySelector('.concert-card__location')?.textContent?.trim();
    const venue = firstUpcoming.querySelector('.concert-card__venue')?.textContent?.trim();
    const eventDate = new Date(firstUpcoming.dataset.date + 'T12:00:00');
    const dateLabel = eventDate.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const detailLink = firstUpcoming.querySelector('.concert-card__link')?.getAttribute('href');

    if (title) {
      heroUpcomingText.textContent = title;
      heroUpcomingLabel.textContent = [dateLabel, location, venue].filter(Boolean).join(' · ');
      heroUpcoming.href = detailLink || '#concerts';
      heroUpcoming.hidden = false;
    }
  }
}

/* Form inviato — messaggio di conferma */
const CONTACT_SUCCESS_MSG = 'Richiesta inviata con successo. Ti risponderemo al più presto.';
const CONTACT_SUCCESS_DURATION = 6000;

function showContactSuccess() {
  const contactSection = document.getElementById('contact');
  const form = contactSection?.querySelector('.contact__form');
  if (!contactSection || !form) return;

  contactSection.querySelector('.contact__form-success')?.remove();

  const notice = document.createElement('p');
  notice.className = 'contact__form-success';
  notice.setAttribute('role', 'status');
  notice.setAttribute('aria-live', 'polite');
  notice.textContent = CONTACT_SUCCESS_MSG;
  form.prepend(notice);

  requestAnimationFrame(() => {
    notice.classList.add('contact__form-success--visible');
  });

  if (window.location.hash !== '#contact') {
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const url = new URL(window.location.href);
  if (url.searchParams.has('inviato')) {
    url.searchParams.delete('inviato');
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  window.setTimeout(() => {
    notice.classList.remove('contact__form-success--visible');
    notice.classList.add('contact__form-success--hidden');
  }, CONTACT_SUCCESS_DURATION);

  notice.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'opacity' && notice.classList.contains('contact__form-success--hidden')) {
      notice.remove();
    }
  }, { once: true });
}

if (new URLSearchParams(window.location.search).get('inviato') === '1') {
  showContactSuccess();
}

/* Torna in alto — creato via JS con stili inline per compatibilità Brave Shield */
(function initScrollUp() {
  const OFFSET = 400;
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
    const menuOpen = document.body.classList.contains('menu-open');
    setVisible(!menuOpen && window.scrollY > OFFSET);
  };

  window.addEventListener('scroll', toggle, { passive: true });
  window.addEventListener('resize', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    btn.blur();
  });

  const menuObserver = new MutationObserver(toggle);
  menuObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();