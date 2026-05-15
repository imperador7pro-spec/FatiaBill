import { buildInvoicePdf, validateInvoicePayload } from '../_lib/pdf.js';

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body || {};
  const error = validateInvoicePayload(payload);
  if (error) return res.status(400).json({ error });

  try {
    const buf = await buildInvoicePdf(payload);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="facture-${payload.invoice_number}.pdf"`);
    res.setHeader('Content-Length', buf.length);
    res.status(200).send(buf);
  } catch (err) {
    console.error('Invoice PDF error:', err);
    res.status(500).json({ error: err?.message || 'Échec génération PDF' });
  }
}
