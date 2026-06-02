import { getAdmin } from '../_lib/auth.js';
import {
  sendTrialEndingIn3DaysEmail,
  sendTrialEndingTomorrowEmail,
  sendTrialExpiredEmail,
} from '../_lib/email.js';
import { withSentry, captureException } from '../_lib/sentry.js';

// Daily cron: scan profiles, send D-3 / D-1 / expired reminders.
// Each column flips once per user, so re-runs are no-ops.
// Vercel cron schedules this — see vercel.json `crons` section.

function verifyCronAuth(req) {
  // Vercel cron sends Authorization: Bearer ${CRON_SECRET} when env var is set.
  const expected = process.env.CRON_SECRET;
  if (!expected) return true; // No secret = open (dev only — Vercel always sets it in prod)
  const got = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return got === expected;
}

async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyCronAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const admin = getAdmin();
  if (!admin) {
    return res.status(500).json({ error: 'Supabase admin non configuré' });
  }

  const now = new Date();
  const inHours = (h) => new Date(now.getTime() + h * 3600 * 1000).toISOString();

  const results = { d3: 0, d1: 0, expired: 0, errors: [] };

  // D-3: trial ends in 2.5–3.5 days, email not yet sent
  try {
    const { data: rowsD3, error } = await admin
      .from('profiles')
      .select('id, email, first_name')
      .eq('plan', 'trial')
      .gte('trial_ends_at', inHours(60))   // 60h = 2.5j
      .lt('trial_ends_at', inHours(84))    // 84h = 3.5j
      .is('trial_email_d3_sent_at', null)
      .not('email', 'is', null)
      .limit(200);
    if (error) throw error;
    for (const p of rowsD3 || []) {
      const r = await sendTrialEndingIn3DaysEmail({ to: p.email, firstName: p.first_name }).catch((e) => ({ error: e }));
      if (r?.error) {
        results.errors.push({ stage: 'd3', userId: p.id, msg: r.error?.message });
        await captureException(r.error, { route: 'cron/trial-emails', stage: 'd3', userId: p.id });
        continue;
      }
      if (!r?.skipped) {
        await admin
          .from('profiles')
          .update({ trial_email_d3_sent_at: new Date().toISOString() })
          .eq('id', p.id);
        results.d3 += 1;
      }
    }
  } catch (e) {
    await captureException(e, { route: 'cron/trial-emails', stage: 'd3-query' });
    results.errors.push({ stage: 'd3-query', msg: e?.message });
  }

  // D-1: trial ends in 12–36h
  try {
    const { data: rowsD1, error } = await admin
      .from('profiles')
      .select('id, email, first_name')
      .eq('plan', 'trial')
      .gte('trial_ends_at', inHours(12))
      .lt('trial_ends_at', inHours(36))
      .is('trial_email_d1_sent_at', null)
      .not('email', 'is', null)
      .limit(200);
    if (error) throw error;
    for (const p of rowsD1 || []) {
      const r = await sendTrialEndingTomorrowEmail({ to: p.email, firstName: p.first_name }).catch((e) => ({ error: e }));
      if (r?.error) {
        results.errors.push({ stage: 'd1', userId: p.id, msg: r.error?.message });
        await captureException(r.error, { route: 'cron/trial-emails', stage: 'd1', userId: p.id });
        continue;
      }
      if (!r?.skipped) {
        await admin
          .from('profiles')
          .update({ trial_email_d1_sent_at: new Date().toISOString() })
          .eq('id', p.id);
        results.d1 += 1;
      }
    }
  } catch (e) {
    await captureException(e, { route: 'cron/trial-emails', stage: 'd1-query' });
    results.errors.push({ stage: 'd1-query', msg: e?.message });
  }

  // Expired: trial ended in the last 36h, still 'trial' (about to flip) or just flipped to 'free'
  try {
    const { data: rowsExp, error } = await admin
      .from('profiles')
      .select('id, email, first_name, plan, trial_ends_at')
      .in('plan', ['trial', 'free'])
      .gte('trial_ends_at', inHours(-36))
      .lt('trial_ends_at', inHours(0))
      .is('trial_email_expired_sent_at', null)
      .not('email', 'is', null)
      .limit(200);
    if (error) throw error;
    for (const p of rowsExp || []) {
      // Belt-and-suspenders: skip if somehow premium snuck in
      if (p.plan === 'premium') continue;
      const r = await sendTrialExpiredEmail({ to: p.email, firstName: p.first_name }).catch((e) => ({ error: e }));
      if (r?.error) {
        results.errors.push({ stage: 'expired', userId: p.id, msg: r.error?.message });
        await captureException(r.error, { route: 'cron/trial-emails', stage: 'expired', userId: p.id });
        continue;
      }
      if (!r?.skipped) {
        await admin
          .from('profiles')
          .update({ trial_email_expired_sent_at: new Date().toISOString() })
          .eq('id', p.id);
        results.expired += 1;
      }
    }
  } catch (e) {
    await captureException(e, { route: 'cron/trial-emails', stage: 'expired-query' });
    results.errors.push({ stage: 'expired-query', msg: e?.message });
  }

  res.status(200).json({ ok: true, ...results });
}

export default withSentry(handler, 'cron/trial-emails');
