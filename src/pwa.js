// Register the service worker only in production builds. In dev (vite dev),
// the SW gets in the way of HMR.
export function registerServiceWorker() {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((err) => {
        console.warn('SW registration failed:', err?.message);
      });
  });
}
