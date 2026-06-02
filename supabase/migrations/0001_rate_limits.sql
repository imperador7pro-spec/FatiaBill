-- Rate limiting table — used by api/_lib/rate-limit.js
-- Service role only (writes from serverless functions). No RLS needed since
-- it's never accessed from the SPA via the anon key.

create table if not exists public.rate_limits (
  id bigserial primary key,
  key text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limits_key_time_idx
  on public.rate_limits (key, created_at desc);

-- Retention: drop rows older than 24h (best-effort cleanup via pg_cron if
-- available, otherwise the table stays small enough for the count(*) queries).
-- To enable scheduled cleanup, run once:
--   create extension if not exists pg_cron;
--   select cron.schedule('rate_limits_cleanup', '0 * * * *',
--     $$delete from public.rate_limits where created_at < now() - interval '24 hours'$$);

alter table public.rate_limits enable row level security;
-- No policies = no access from anon/authenticated keys. Only service_role can read/write.
