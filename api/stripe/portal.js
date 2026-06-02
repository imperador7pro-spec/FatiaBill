import Stripe from 'stripe';
import { requireUser } from '../_lib/auth.js';
import { withSentry, captureException } from '../_lib/sentry.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe non configuré' });
  }

  const auth = await requireUser(req, res);
  if (!auth) return;

  try {
    const { data: profile } = await auth.admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', auth.user.id)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      return res.status(400).json({
        error: 'Aucun abonnement actif à gérer. Souscrivez Premium d\'abord.',
      });
    }

    const origin = req.headers.origin || process.env.FRONTEND_URL || 'https://fatiabill.ch';
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/?from=portal`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    await captureException(err, { route: 'stripe/portal', userId: auth.user.id });
    res.status(500).json({ error: err?.message || 'Erreur d\'ouverture du portail' });
  }
}

export default withSentry(handler, 'stripe/portal');
