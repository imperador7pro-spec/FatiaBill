import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Stripe (will be null if key not set yet — graceful fallback)
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Supabase Admin (server-side with service_role key)
const supaAdmin = (process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// ═══ STRIPE WEBHOOK (must be BEFORE json middleware) ═══
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !supaAdmin) return res.status(500).json({ error: 'Not configured' });

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook sig error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (userId) {
        await supaAdmin.from('profiles').update({
          plan: 'premium',
          stripe_customer_id: session.customer,
          updated_at: new Date().toISOString()
        }).eq('id', userId);
        console.log(`✅ User ${userId} upgraded to premium`);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      if (sub.customer) {
        await supaAdmin.from('profiles').update({
          plan: 'free',
          updated_at: new Date().toISOString()
        }).eq('stripe_customer_id', sub.customer);
        console.log(`⬇️ Customer ${sub.customer} downgraded to free`);
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  res.json({ received: true });
});

// ═══ MIDDLEWARE (after webhook route) ═══
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ═══ HEALTH ═══
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '4.0.0',
    stripe: !!stripe,
    supabase: !!supaAdmin,
    ai: !!process.env.ANTHROPIC_API_KEY,
    ts: new Date().toISOString()
  });
});

// ═══ STRIPE CHECKOUT ═══
app.post('/api/stripe/checkout', async (req, res) => {
  if (!stripe) return res.status(500).json({ error: 'Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env' });

  try {
    const { userId, email, mode } = req.body;
    const priceId = mode === 'pro' ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_PRIVE;

    if (!priceId) return res.status(500).json({ error: 'Price ID manquant dans .env' });

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'https://fatiabill.ch'}?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://fatiabill.ch'}?canceled=true`,
      metadata: { userId, appMode: mode },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══ AI CHAT ═══
app.post('/api/ai/chat', async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY manquante' });

  try {
    const { message, context, mode } = req.body;
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: mode === 'pro'
          ? `Tu es un coach business expert suisse dans FatiaBill. Français, concis, actionnable. Tu es spécialisé en: création d'entreprise en Suisse (Sàrl, SA, RI), TVA (8.1%, méthode TDFN), charges sociales (AVS 10%, LPP), optimisation fiscale pour indépendants, stratégie de pricing, gestion de trésorerie, et développement commercial. Tu connais parfaitement le droit des obligations suisse et les pratiques comptables. Ne donne JAMAIS de conseil juridique spécifique mais éduque sur les options. Contexte: ${context || ''}. 2-3 paragraphes max, ton professionnel mais accessible.`
          : `Tu es un conseiller financier expert suisse dans FatiaBill. Français, concis, actionnable. Fiscalité suisse (TVA 8.1%, AVS, 3A, LPP). Ne donne JAMAIS de conseil d'investissement spécifique. Contexte: ${context || ''}. 2-3 paragraphes max.`,
        messages: [{ role: 'user', content: message }]
      })
    });
    const data = await r.json();
    const text = data.content?.map(c => c.text || '').join('\n') || 'Erreur.';
    res.json({ response: text });
  } catch (err) {
    console.error('AI error:', err.message);
    res.status(500).json({ error: 'Service IA indisponible' });
  }
});

// ═══ SERVE REACT ═══
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ FatiaBill V3 → port ${PORT}`);
  console.log(`   Stripe: ${stripe ? '✓' : '✗ (STRIPE_SECRET_KEY manquante)'}`);
  console.log(`   Supabase: ${supaAdmin ? '✓' : '✗ (clés manquantes)'}`);
  console.log(`   AI: ${process.env.ANTHROPIC_API_KEY ? '✓' : '✗ (ANTHROPIC_API_KEY manquante)'}`);
});
