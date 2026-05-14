import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans Vercel.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { userId, email, mode } = req.body || {};
    if (!userId || !email || !mode) {
      return res.status(400).json({ error: 'userId, email et mode requis' });
    }

    const priceId = mode === 'pro' ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_PRIVE;
    if (!priceId) {
      return res.status(500).json({ error: `Price ID manquant pour le mode ${mode}. Configurez STRIPE_PRICE_${mode === 'pro' ? 'PRO' : 'PRIVE'} dans Vercel.` });
    }

    const origin = req.headers.origin || process.env.FRONTEND_URL || 'https://fatiabill.ch';

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}?success=true`,
      cancel_url: `${origin}?canceled=true`,
      metadata: { userId, appMode: mode },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
