import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendPaymentReceiptEmail, sendSubscriptionCanceledEmail } from '../_lib/email.js';
import { withSentry, captureException } from '../_lib/sentry.js';

export const config = {
  api: { bodyParser: false }
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Stripe non configuré' });
  }
  if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Supabase admin non configuré' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supaAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const sig = req.headers['stripe-signature'];
  const rawBody = await readRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook sig error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const appMode = session.metadata?.appMode;
      if (userId) {
        await supaAdmin.from('profiles').update({
          plan: 'premium',
          stripe_customer_id: session.customer,
          updated_at: new Date().toISOString()
        }).eq('id', userId);

        // Fire payment receipt email (non-blocking failures)
        const { data: profile } = await supaAdmin
          .from('profiles')
          .select('first_name')
          .eq('id', userId)
          .maybeSingle();
        const email = session.customer_details?.email || session.customer_email;
        const planLabel = appMode === 'pro' ? 'Pro Premium (29 CHF/mois)' : 'Privé Premium (9 CHF/mois)';
        const amountChf = typeof session.amount_total === 'number' ? session.amount_total / 100 : null;
        if (email) {
          await sendPaymentReceiptEmail({
            to: email,
            firstName: profile?.first_name || '',
            planLabel,
            amountChf,
          }).catch((e) => captureException(e, { route: 'webhook/payment-receipt', userId }));
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      if (sub.customer) {
        const { data: profile } = await supaAdmin
          .from('profiles')
          .update({
            plan: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', sub.customer)
          .select('id, first_name')
          .maybeSingle();

        try {
          const customer = await stripe.customers.retrieve(sub.customer);
          const email = !customer.deleted ? customer.email : null;
          const endsAt = sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toLocaleDateString('fr-CH')
            : null;
          if (email) {
            await sendSubscriptionCanceledEmail({
              to: email,
              firstName: profile?.first_name || '',
              endsAt,
            }).catch((e) => captureException(e, { route: 'webhook/cancel-email', userId: profile?.id }));
          }
        } catch (e) {
          await captureException(e, { route: 'webhook/cancel-fetch-customer' });
        }
      }
    }
  } catch (err) {
    await captureException(err, { route: 'stripe/webhook', eventType: event?.type });
  }

  res.status(200).json({ received: true });
}

export default withSentry(handler, 'stripe/webhook');
