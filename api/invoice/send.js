import { Resend } from 'resend';
import { buildInvoicePdf, validateInvoicePayload } from '../_lib/pdf.js';

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function defaultBodyHtml({ creditorName, debtorName, invoiceNumber, message, totalLine }) {
  const safeMessage = escapeHtml(message || '').replace(/\n/g, '<br>');
  return `<!DOCTYPE html><html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; max-width: 560px; margin: 0 auto; padding: 20px;">
    <p>Bonjour ${escapeHtml(debtorName)},</p>
    ${safeMessage ? `<p>${safeMessage}</p>` : ''}
    <p>Vous trouverez ci-joint la facture <strong>N° ${escapeHtml(invoiceNumber)}</strong>${totalLine ? ` d'un montant de <strong>${escapeHtml(totalLine)}</strong>` : ''}.</p>
    <p>Le paiement peut être effectué en scannant le QR-code intégré au document avec votre application bancaire.</p>
    <p>Pour toute question, n'hésitez pas à répondre à cet email.</p>
    <p style="margin-top: 24px;">Cordialement,<br><strong>${escapeHtml(creditorName)}</strong></p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
    <p style="font-size: 11px; color: #64748b;">Facture émise via FatiaBill — copilote financier suisse.</p>
  </body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Envoi email non configuré — ajoutez RESEND_API_KEY dans Vercel.' });
  }
  if (!process.env.INVOICE_FROM_EMAIL) {
    return res.status(500).json({ error: 'Adresse expéditeur non configurée — ajoutez INVOICE_FROM_EMAIL dans Vercel.' });
  }

  const { recipient_email, subject, message, payload } = req.body || {};
  if (!recipient_email) return res.status(400).json({ error: 'Email destinataire requis' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient_email)) {
    return res.status(400).json({ error: 'Adresse email destinataire invalide' });
  }

  const error = validateInvoicePayload(payload);
  if (error) return res.status(400).json({ error });

  try {
    const buf = await buildInvoicePdf(payload);

    const totalLine = (() => {
      const subtotalHT = payload.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);
      const tvaPct = Number(payload.tva_rate ?? 8.1) / 100;
      const total = subtotalHT * (1 + tvaPct);
      return `${new Intl.NumberFormat('fr-CH', { minimumFractionDigits: 2 }).format(total)} CHF`;
    })();

    const html = defaultBodyHtml({
      creditorName: payload.creditor.name,
      debtorName: payload.debtor.name,
      invoiceNumber: payload.invoice_number,
      message,
      totalLine,
    });

    const fromName = payload.creditor.name.replace(/"/g, '').slice(0, 60);
    const fromEmail = process.env.INVOICE_FROM_EMAIL;
    const from = `${fromName} <${fromEmail}>`;

    const replyTo = payload.creditor.email || undefined;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error: resendError } = await resend.emails.send({
      from,
      to: recipient_email,
      reply_to: replyTo,
      subject: subject || `Facture ${payload.invoice_number} — ${payload.creditor.name}`,
      html,
      attachments: [
        {
          filename: `facture-${payload.invoice_number}.pdf`,
          content: buf,
        },
      ],
    });

    if (resendError) {
      console.error('Resend error:', resendError);
      const msg = resendError.message || 'Échec de l\'envoi';
      return res.status(502).json({ error: msg });
    }

    res.status(200).json({ ok: true, id: data?.id || null });
  } catch (err) {
    console.error('Invoice send error:', err);
    res.status(500).json({ error: err?.message || 'Échec envoi facture' });
  }
}
