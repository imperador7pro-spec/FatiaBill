-- Bug fix: profiles.email was never populated at signup. Two fixes:
--   1. Trigger to auto-sync email from auth.users on insert/update
--   2. Backfill existing rows

-- Sync function: keep profiles.email aligned with auth.users.email
create or replace function public.sync_profile_email()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.sync_profile_email();

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.sync_profile_email();

-- Backfill existing profiles
update public.profiles p
   set email = u.email
  from auth.users u
 where p.id = u.id
   and p.email is null
   and u.email is not null;
