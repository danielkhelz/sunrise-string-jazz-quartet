const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

(function initCookieNotice() {
  const STORAGE_KEY = 'ssjq_cookie_notice';
  const TTL_MS = 365 * 24 * 60 * 60 * 1000;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved?.ts && Date.now() - saved.ts < TTL_MS) return;
    }
  } catch (_) {
    /* ignore storage errors */
  }

  const banner = document.createElement('div');
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Informativa cookie');
  banner.setAttribute('data-ssjq', 'cookie-notice');

  const text = document.createElement('p');
  text.textContent = 'Questo sito non usa cookie di profilazione. Utilizziamo solo tecnologie necessarie e cookie di terze parti (YouTube, Spotify) se interagisci con i contenuti incorporati. ';
  const link = document.createElement('a');
  link.href = 'cookie-policy.html';
  link.textContent = 'Cookie Policy';
  text.appendChild(link);
  text.append(' · ');
  const privacyLink = document.createElement('a');
  privacyLink.href = 'privacy-policy.html';
  privacyLink.textContent = 'Privacy Policy';
  text.appendChild(privacyLink);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Ho capito';

  banner.append(text, btn);
  document.body.appendChild(banner);

  const styles = {
    position: 'fixed',
    left: 'max(1rem, env(safe-area-inset-left, 0px))',
    right: 'max(1rem, env(safe-area-inset-right, 0px))',
    bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
    zIndex: '200',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.25rem',
    maxWidth: '52rem',
    margin: '0 auto',
    background: '#1a1a1a',
    color: 'rgba(255,255,255,0.88)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    font: '400 0.85rem/1.5 "DM Sans", system-ui, sans-serif'
  };

  Object.entries(styles).forEach(([key, value]) => {
    banner.style.setProperty(key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`), value);
  });

  text.style.setProperty('margin', '0');
  text.style.setProperty('flex', '1 1 16rem');

  [link, privacyLink].forEach(a => {
    a.style.setProperty('color', '#e85d75');
    a.style.setProperty('text-decoration', 'underline');
  });

  btn.style.setProperty('flex-shrink', '0');
  btn.style.setProperty('min-height', '44px');
  btn.style.setProperty('padding', '0.6rem 1.25rem');
  btn.style.setProperty('border', 'none');
  btn.style.setProperty('border-radius', '2px');
  btn.style.setProperty('background', '#c41e3a');
  btn.style.setProperty('color', '#fff');
  btn.style.setProperty('font', '600 0.8rem/1 "DM Sans", system-ui, sans-serif');
  btn.style.setProperty('letter-spacing', '0.06em');
  btn.style.setProperty('text-transform', 'uppercase');
  btn.style.setProperty('cursor', 'pointer');

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now() }));
    } catch (_) {
      /* ignore */
    }
    banner.remove();
  }

  btn.addEventListener('click', dismiss);

  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape' && document.body.contains(banner)) {
      dismiss();
      document.removeEventListener('keydown', onKey);
    }
  });
})();