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
}

if (toggle && menu) {
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('nav__menu--open')) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('click', e => {
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

/* Scroll reveal */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal--visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

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

function buildYouTubeUrl(videoId, autoplay = false) {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1'
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function mountYouTubeIframe(container, videoId, { autoplay = false, title = '' } = {}) {
  if (!container) return;
  const iframe = document.createElement('iframe');
  iframe.src = buildYouTubeUrl(videoId, autoplay);
  iframe.title = title || 'Video Sunrise String Jazz Quartet';
  iframe.allow = YT_ALLOW;
  iframe.allowFullscreen = true;
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  container.innerHTML = '';
  container.classList.add('video__player--active');
  container.appendChild(iframe);
}

function mountVideoFacade(container, videoId, { title = '' } = {}) {
  if (!container) return;
  const posterUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
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
    mountYouTubeIframe(container, videoId, { autoplay: true, title });
  }, { once: true });
}

document.querySelectorAll('.video__player[data-video]').forEach(player => {
  mountVideoFacade(player, player.dataset.video, {
    title: player.dataset.title || ''
  });
});

/* Concerts — split upcoming / past */
const concertsPast = document.getElementById('concerts-past');
const concertsUpcoming = document.getElementById('concerts-upcoming');
const concertsEmpty = document.getElementById('concerts-empty');

if (concertsPast && concertsUpcoming) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  [...concertsPast.querySelectorAll('.concert-card')].forEach(card => {
    const date = new Date(card.dataset.date + 'T12:00:00');
    const body = card.querySelector('.concert-card__body');
    if (date >= today && body) {
      card.classList.add('concert-card--upcoming');
      const badge = document.createElement('span');
      badge.className = 'concert-card__badge';
      badge.textContent = 'Prossimo';
      body.prepend(badge);
      concertsUpcoming.appendChild(card);
    }
  });

  if (!concertsUpcoming.children.length && concertsEmpty) {
    concertsEmpty.classList.add('concerts__empty--visible');
  }

  const heroUpcoming = document.getElementById('hero-upcoming');
  const heroUpcomingText = document.getElementById('hero-upcoming-text');
  const firstUpcoming = concertsUpcoming.querySelector('.concert-card');

  if (heroUpcoming && heroUpcomingText && firstUpcoming) {
    const title = firstUpcoming.querySelector('.concert-card__title')?.textContent?.trim();
    const location = firstUpcoming.querySelector('.concert-card__location')?.textContent?.trim();
    const day = firstUpcoming.querySelector('.concert-card__day')?.textContent?.trim();
    const month = firstUpcoming.querySelector('.concert-card__month')?.textContent?.trim();
    const year = firstUpcoming.querySelector('.concert-card__year')?.textContent?.trim();
    const label = heroUpcoming.querySelector('.hero__upcoming-label');

    if (title && day && month) {
      if (label) {
        label.textContent = firstUpcoming.dataset.type === 'release' ? 'Prossima uscita' : 'Prossimo concerto';
      }
      heroUpcomingText.textContent = `${title} — ${day} ${month} ${year || ''}${location ? ` · ${location}` : ''}`.trim();
      heroUpcoming.href = firstUpcoming.dataset.type === 'release' ? '#album-upcoming' : '#concerts';
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