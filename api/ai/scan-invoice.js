export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' }
  }
};

const SYSTEM_PROMPT = `Tu es un assistant OCR spécialisé dans les factures et reçus suisses. Tu analyses un document (image ou PDF) de facture/reçu et tu réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de texte avant ou après) avec ces champs:

{
  "label": "Description courte (ex: 'Migros - Courses', 'Restaurant Le Comptoir', 'Facture client ACME SA')",
  "amount": 127.50,
  "date": "2025-03-15",
  "vendor": "Nom du fournisseur ou client",
  "tva_amount": 9.32,
  "category": "Une de: Marchandises | Déplacement | Repas & Représentation | Publicité | Sous-traitants | Admin & Divers | null",
  "suggested_type": "CLIENT | FOURNISSEUR | JUSTIFICATIF",
  "confidence": "high | medium | low",
  "notes": "Détails utiles (TVA visible? document douteux? texte mal scanné?)"
}

Règles:
- "amount" est le TOTAL TTC (avec TVA) en CHF, sous forme de nombre (pas de chaîne)
- "date" au format YYYY-MM-DD. Si tu ne vois pas la date, utilise null
- "tva_amount" est le montant de TVA si visible, sinon null
- "category" si c'est probablement une dépense pro, sinon null
- "suggested_type": CLIENT = facture émise (vous encaissez), FOURNISSEUR = vous avez payé un fournisseur, JUSTIFICATIF = autre pièce à archiver (contrat, reçu sans valeur fiscale)
- Si l'image est illisible/trop sombre/non pertinente, retourne {"error": "Image non lisible"} au lieu du JSON normal.

Rappelle: JSON pur uniquement, rien d'autre.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY manquante' });

  try {
    const { image_base64, mime_type } = req.body || {};
    if (!image_base64) return res.status(400).json({ error: 'image_base64 requis' });

    const cleanBase64 = image_base64.includes(',')
      ? image_base64.split(',')[1]
      : image_base64;
    const mediaType = mime_type || 'image/jpeg';
    const isPdf = mediaType === 'application/pdf';

    const sourceBlock = {
      type: isPdf ? 'document' : 'image',
      source: { type: 'base64', media_type: mediaType, data: cleanBase64 },
    };

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            sourceBlock,
            {
              type: 'text',
              text: 'Analyse ce document (facture / reçu suisse) et réponds UNIQUEMENT en JSON.'
            }
          ]
        }]
      })
    });

    const data = await r.json();
    if (!r.ok) {
      console.error('Anthropic Vision error:', data);
      const upstream = data?.error?.message || '';
      let userFacing = upstream || 'Service Vision indisponible';
      if (r.status === 401 || /invalid x-api-key|authentication/i.test(upstream)) {
        userFacing = 'Clé Anthropic invalide ou suspendue. Vérifiez ANTHROPIC_API_KEY dans Vercel ou regénérez sur console.anthropic.com.';
      } else if (r.status === 429) {
        userFacing = 'Quota Anthropic atteint. Augmentez la limite sur console.anthropic.com.';
      }
      return res.status(502).json({ error: userFacing });
    }

    const text = data.content?.map(c => c.text || '').join('').trim();
    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
      console.error('JSON parse failed. Raw response:', text);
      return res.status(502).json({ error: 'Impossible de structurer la réponse IA', raw: text });
    }

    if (parsed.error) {
      return res.status(422).json({ error: parsed.error });
    }

    res.status(200).json({ extracted: parsed });
  } catch (err) {
    console.error('Scan error:', err.message);
    res.status(500).json({ error: 'Service de scan indisponible' });
  }
}
