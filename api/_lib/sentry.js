let initialized = false;
let SentryRef = null;

async function ensureInit() {
  if (initialized) return SentryRef;
  initialized = true;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return null;

  try {
    const Sentry = await import('@sentry/node');
    Sentry.init({
      dsn,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'production',
      release: process.env.VERCEL_GIT_COMMIT_SHA || undefined,
      tracesSampleRate: 0,
    });
    SentryRef = Sentry;
    return Sentry;
  } catch (e) {
    console.error('Sentry init failed:', e?.message);
    return null;
  }
}

export async function captureException(err, context = {}) {
  const S = await ensureInit();
  if (!S) {
    console.error('[sentry-disabled]', err?.message, context);
    return;
  }
  S.withScope((scope) => {
    Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    S.captureException(err);
  });
}

/**
 * Wrap a Vercel serverless handler so unhandled exceptions are sent to Sentry
 * before returning a 500. Returns the same handler signature.
 */
export function withSentry(handler, route) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (err) {
      await captureException(err, { route, method: req.method, url: req.url });
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erreur serveur' });
      }
    }
  };
}
