// Analytics: Plausible (cookieless, RGPD-friendly, no consent banner needed)
// + first-touch UTM attribution stored in localStorage so we can credit signups
// back to the campaign that brought them (jersey ad, partner referral, etc.).

const STORAGE_KEY = 'fb_attribution';
const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

export function initAnalytics() {
  captureAttribution();
  loadPlausible();
}

function captureAttribution() {
  try {
    // First-touch: never overwrite once set
    if (localStorage.getItem(STORAGE_KEY)) return;

    const params = new URLSearchParams(window.location.search);
    const attribution = {};
    let hasAny = false;

    for (const key of UTM_PARAMS) {
      const v = params.get(key);
      if (v) {
        attribution[key] = v.slice(0, 100);
        hasAny = true;
      }
    }

    const ref = document.referrer;
    if (ref && !ref.startsWith(window.location.origin)) {
      attribution.referrer = ref.slice(0, 200);
      hasAny = true;
    }

    if (hasAny) {
      attribution.first_seen_at = new Date().toISOString();
      attribution.landing_path = window.location.pathname.slice(0, 200);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    }
  } catch {
    // localStorage unavailable (private browsing) — silently skip
  }
}

function loadPlausible() {
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (!domain || typeof document === 'undefined') return;
  if (document.querySelector('script[data-plausible]')) return;

  // Queue track() calls before the script loads
  window.plausible = window.plausible || function () {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };

  const s = document.createElement('script');
  s.defer = true;
  s.dataset.plausible = 'true';
  s.dataset.domain = domain;
  s.src = 'https://plausible.io/js/script.tagged-events.js';
  document.head.appendChild(s);
}

export function track(event, props) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.plausible === 'function') {
      window.plausible(event, props ? { props } : undefined);
    }
  } catch {
    // never let analytics break the app
  }
}

export function getAttribution() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
