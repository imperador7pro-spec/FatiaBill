-- Idempotency markers for the trial-expiry email sequence
-- (D-3, D-1, D0/expired). Each column flips once per user, ever.

alter table public.profiles
  add column if not exists trial_email_d3_sent_at timestamptz,
  add column if not exists trial_email_d1_sent_at timestamptz,
  add column if not exists trial_email_expired_sent_at timestamptz;
