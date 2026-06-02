-- Store first-touch marketing attribution (UTM params + referrer) on profile
-- so signups can be attributed back to the campaign that drove the visit.
-- Captured client-side in src/analytics.js and persisted server-side at signup.

alter table public.profiles
  add column if not exists attribution jsonb;
