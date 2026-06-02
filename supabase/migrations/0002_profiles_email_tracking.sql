-- Add idempotency markers for transactional emails sent by FatiaBill.
alter table public.profiles
  add column if not exists welcome_email_sent_at timestamptz;
