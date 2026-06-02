// Lazy Sentry init. Only loads the SDK when VITE_SENTRY_DSN is defined
// so dev builds without DSN don't ship the SDK bytes.

let initialized = false;

export async function initSentry() {
  if (initialized) return;
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  initialized = true;
  try {
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE || 'production',
      release: import.meta.env.VITE_GIT_COMMIT_SHA || undefined,
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      ignoreErrors: [
        // Browser quirks worth filtering
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
      ],
    });
  } catch (e) {
    console.warn('Sentry init failed (non-blocking):', e?.message);
  }
}
