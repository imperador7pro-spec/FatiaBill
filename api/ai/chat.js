export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY manquante dans les variables Vercel' });

  try {
    const { message, context, mode } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message requis' });

    const systemPro = `Tu es un coach business expert suisse dans FatiaBill. Français, concis, actionnable. Tu es spécialisé en: création d'entreprise en Suisse (Sàrl, SA, RI), TVA (8.1%, méthode TDFN), charges sociales (AVS 10%, LPP), optimisation fiscale pour indépendants, stratégie de pricing, gestion de trésorerie, et développement commercial. Tu connais parfaitement le droit des obligations suisse et les pratiques comptables. Ne donne JAMAIS de conseil juridique spécifique mais éduque sur les options. Contexte: ${context || ''}. 2-3 paragraphes max, ton professionnel mais accessible.`;
    const systemPrive = `Tu es un conseiller financier expert suisse dans FatiaBill. Français, concis, actionnable. Fiscalité suisse (TVA 8.1%, AVS, 3A, LPP). Ne donne JAMAIS de conseil d'investissement spécifique. Contexte: ${context || ''}. 2-3 paragraphes max.`;

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 800,
        system: mode === 'pro' ? systemPro : systemPrive,
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await r.json();
    if (!r.ok) {
      console.error('Anthropic error:', data);
      return res.status(502).json({ error: data?.error?.message || 'Service IA indisponible' });
    }
    const text = data.content?.map(c => c.text || '').join('\n') || 'Erreur.';
    res.status(200).json({ response: text });
  } catch (err) {
    console.error('AI error:', err.message);
    res.status(500).json({ error: 'Service IA indisponible' });
  }
}
