import { getAdmin } from './auth.js';

/**
 * Sliding-window rate limit backed by Postgres.
 * Requires `rate_limits` table — see supabase/migrations/0001_rate_limits.sql.
 *
 * @param {{ key: string, max: number, windowSec: number }} opts
 * @returns {Promise<{ allowed: boolean, remaining: number, retryAfterSec: number }>}
 */
export async function checkRateLimit({ key, max, windowSec }) {
  const a = getAdmin();
  if (!a) {
    // Fail-open if admin not configured — caller will surface the misconfig elsewhere.
    return { allowed: true, remaining: max, retryAfterSec: 0 };
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSec * 1000).toISOString();

  // 1. Insert this request
  const insert = await a.from('rate_limits').insert({ key, created_at: now.toISOString() });
  if (insert.error) {
    // If the table is missing, log and fail open rather than 500
    console.error('rate_limits insert failed (failing open):', insert.error.message);
    return { allowed: true, remaining: max, retryAfterSec: 0 };
  }

  // 2. Count requests for this key in the window
  const { count, error: countErr } = await a
    .from('rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('key', key)
    .gte('created_at', windowStart);

  if (countErr) {
    console.error('rate_limits count failed (failing open):', countErr.message);
    return { allowed: true, remaining: max, retryAfterSec: 0 };
  }

  const used = count || 0;
  const allowed = used <= max;
  const remaining = Math.max(0, max - used);

  return {
    allowed,
    remaining,
    retryAfterSec: allowed ? 0 : Math.ceil(windowSec / 2),
  };
}

/**
 * Apply rate limit and send a 429 if exceeded. Returns true if request should proceed.
 */
export async function enforceRateLimit(req, res, { key, max, windowSec, label }) {
  const r = await checkRateLimit({ key, max, windowSec });
  res.setHeader('X-RateLimit-Limit', String(max));
  res.setHeader('X-RateLimit-Remaining', String(r.remaining));
  if (!r.allowed) {
    res.setHeader('Retry-After', String(r.retryAfterSec));
    res.status(429).json({
      error: `Limite de requêtes atteinte (${label || 'API'}). Réessayez dans ${r.retryAfterSec}s.`,
    });
    return false;
  }
  return true;
}
