import { Resend } from 'resend';

const APP_URL = process.env.FRONTEND_URL || 'https://fatiabill.ch';

function fromAddress() {
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.INVOICE_FROM_EMAIL;
  if (!fromEmail) return null;
  return `FatiaBill <${fromEmail}>`;
}

function wrap(title, contentHtml) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${title}</title></head>
  <body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c1917;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="font-size:22px;font-weight:900;letter-spacing:-0.02em;color:#059669;margin-bottom:24px;">FatiaBill</div>
      <div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;padding:28px;">
        ${contentHtml}
      </div>
      <div style="margin-top:24px;font-size:11px;color:#78716c;text-align:center;line-height:1.6;">
        FatiaBill — Copilote financier suisse · Un produit Duares Systems, Aclens<br>
        <a href="${APP_URL}/legal" style="color:#78716c;text-decoration:underline;">Mentions légales</a> ·
        <a href="${APP_URL}/legal#privacy" style="color:#78716c;text-decoration:underline;">Confidentialité</a> ·
        <a href="mailto:hello@fatiabill.ch" style="color:#78716c;text-decoration:underline;">hello@fatiabill.ch</a>
      </div>
    </div>
  </body></html>`;
}

function btn(label, href, color = '#059669') {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#ffffff;font-weight:800;font-size:13px;padding:12px 22px;border-radius:10px;text-decoration:none;margin-top:8px;">${label}</a>`;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function send({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = fromAddress();
  if (!apiKey || !from) {
    console.warn('[email] Resend non configuré (RESEND_API_KEY ou RESEND_FROM_EMAIL manquant) — email ignoré:', subject);
    return { skipped: true };
  }
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error('[email] Resend error:', error.message || error);
      return { error };
    }
    return { id: data?.id || null };
  } catch (e) {
    console.error('[email] send threw:', e?.message);
    return { error: e };
  }
}

export async function sendWelcomeEmail({ to, firstName }) {
  const name = escapeHtml(firstName || '');
  const greeting = name ? `Bonjour ${name},` : 'Bonjour,';
  const html = wrap('Bienvenue chez FatiaBill', `
    <h1 style="font-size:20px;font-weight:900;margin:0 0 14px;">${greeting} bienvenue à bord 👋</h1>
    <p style="font-size:14px;line-height:1.6;margin:0 0 14px;">
      Votre essai gratuit de <strong>14 jours</strong> est actif — toutes les fonctionnalités sont débloquées, sans carte bancaire.
    </p>
    <p style="font-size:14px;line-height:1.6;margin:0 0 14px;">
      Pour bien démarrer :
    </p>
    <ul style="font-size:13px;line-height:1.7;padding-left:20px;margin:0 0 18px;color:#44403c;">
      <li>Complétez votre profil (canton, statut, situation) pour des conseils précis</li>
      <li>Saisissez vos premières dépenses ou scannez une facture</li>
      <li>Posez une question au coach IA — il connaît votre contexte suisse</li>
    </ul>
    ${btn('Ouvrir FatiaBill', APP_URL)}
    <p style="font-size:12px;color:#78716c;margin:22px 0 0;line-height:1.6;">
      Une question ? Répondez simplement à cet email — on lit tout.
    </p>
  `);
  return send({ to, subject: 'Bienvenue chez FatiaBill — votre essai de 14 jours est actif', html });
}

export async function sendPaymentReceiptEmail({ to, firstName, planLabel, amountChf }) {
  const name = escapeHtml(firstName || '');
  const greeting = name ? `Bonjour ${name},` : 'Bonjour,';
  const amount = typeof amountChf === 'number'
    ? new Intl.NumberFormat('fr-CH', { minimumFractionDigits: 2 }).format(amountChf)
    : null;
  const html = wrap('Paiement reçu', `
    <h1 style="font-size:20px;font-weight:900;margin:0 0 14px;">${greeting}</h1>
    <p style="font-size:14px;line-height:1.6;margin:0 0 14px;">
      Merci ! Votre abonnement <strong>${escapeHtml(planLabel)}</strong> est actif.
      ${amount ? `Nous venons de débiter <strong>${amount} CHF</strong>.` : ''}
    </p>
    <p style="font-size:14px;line-height:1.6;margin:0 0 14px;">
      Toutes les fonctionnalités Premium sont débloquées.
      Vous pouvez retrouver vos factures et gérer votre abonnement depuis Réglages.
    </p>
    ${btn('Ouvrir FatiaBill', APP_URL)}
    <p style="font-size:12px;color:#78716c;margin:22px 0 0;line-height:1.6;">
      Vos reçus officiels Stripe sont également envoyés automatiquement par Stripe pour votre comptabilité.
    </p>
  `);
  return send({
    to,
    subject: `Paiement reçu — abonnement ${planLabel} actif`,
    html,
  });
}

export async function sendSubscriptionCanceledEmail({ to, firstName, endsAt }) {
  const name = escapeHtml(firstName || '');
  const greeting = name ? `Bonjour ${name},` : 'Bonjour,';
  const endsLine = endsAt
    ? `Votre accès Premium reste actif jusqu'au <strong>${escapeHtml(endsAt)}</strong>.`
    : 'Votre abonnement a été résilié.';
  const html = wrap('Résiliation enregistrée', `
    <h1 style="font-size:20px;font-weight:900;margin:0 0 14px;">${greeting}</h1>
    <p style="font-size:14px;line-height:1.6;margin:0 0 14px;">
      Nous confirmons la résiliation de votre abonnement FatiaBill.
      ${endsLine}
    </p>
    <p style="font-size:14px;line-height:1.6;margin:0 0 14px;">
      À l'issue, votre compte passera en lecture seule : vos données restent consultables et exportables,
      les actions productives (nouvelles transactions, coach IA, scanner) sont mises en pause.
      Vous pouvez réactiver Premium en un clic depuis Réglages.
    </p>
    ${btn('Gérer mon abonnement', `${APP_URL}/settings`)}
    <p style="font-size:12px;color:#78716c;margin:22px 0 0;line-height:1.6;">
      Une remarque sur ce qui n'a pas fonctionné ? Répondez à cet email — votre retour nous aide à améliorer FatiaBill.
    </p>
  `);
  return send({
    to,
    subject: 'FatiaBill — résiliation enregistrée',
    html,
  });
}
