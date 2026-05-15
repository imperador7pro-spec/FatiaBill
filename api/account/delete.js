import { createClient } from '@supabase/supabase-js';

async function cancelStripeSubscriptions(stripeCustomerId) {
  if (!stripeCustomerId || !process.env.STRIPE_SECRET_KEY) return;
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const subs = await stripe.subscriptions.list({ customer: stripeCustomerId, status: 'all', limit: 50 });
    const active = subs.data.filter((s) => ['active', 'trialing', 'past_due'].includes(s.status));
    await Promise.all(active.map((s) => stripe.subscriptions.cancel(s.id).catch(() => {})));
  } catch (e) {
    // Non-blocking: log and continue with account deletion
    console.error('Stripe cancel failed (non-blocking):', e?.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return res.status(500).json({ error: 'Service Supabase non configuré côté serveur' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentification requise' });

  // Confirmation phrase from body — UI requires user to type "SUPPRIMER"
  const { confirmation } = req.body || {};
  if (confirmation !== 'SUPPRIMER') {
    return res.status(400).json({ error: 'Phrase de confirmation invalide' });
  }

  const admin = createClient(url, serviceKey);

  let user;
  try {
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Session invalide' });
    user = data.user;
  } catch (e) {
    return res.status(401).json({ error: 'Impossible de vérifier la session' });
  }

  const uid = user.id;

  try {
    // 1. Fetch profile to get Stripe customer id (best-effort cancel before delete)
    const { data: profile } = await admin.from('profiles').select('stripe_customer_id').eq('id', uid).maybeSingle();
    if (profile?.stripe_customer_id) {
      await cancelStripeSubscriptions(profile.stripe_customer_id);
    }

    // 2. Delete user-owned rows in dependent tables (best-effort, parallel)
    await Promise.all([
      admin.from('expenses').delete().eq('user_id', uid),
      admin.from('transactions').delete().eq('user_id', uid),
      admin.from('goals').delete().eq('user_id', uid),
      admin.from('documents').delete().eq('user_id', uid),
      admin.from('academy_progress').delete().eq('user_id', uid),
    ]);

    // 3. Delete profile row (FK to auth.users)
    await admin.from('profiles').delete().eq('id', uid);

    // 4. Delete the auth user itself
    const { error: delErr } = await admin.auth.admin.deleteUser(uid);
    if (delErr) {
      console.error('Auth user deletion error:', delErr);
      return res.status(500).json({
        error: 'Vos données ont été supprimées, mais la suppression du compte d\'authentification a échoué. Contactez hello@fatiabill.ch pour finaliser.',
      });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Account deletion error:', err);
    res.status(500).json({ error: err?.message || 'Erreur lors de la suppression' });
  }
}
