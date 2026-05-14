import PDFDocument from 'pdfkit';
import { SwissQRBill } from 'swissqrbill/pdf';

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};

const TVA_RATES = { '0': 0, '2.6': 0.026, '3.8': 0.038, '8.1': 0.081 };

function parseSwissAddress(street) {
  if (!street) return { address: '', buildingNumber: '' };
  const match = street.trim().match(/^(.*?)(?:\s+(\d+[a-zA-Z]?))?$/);
  if (match && match[2]) return { address: match[1].trim(), buildingNumber: match[2] };
  return { address: street.trim(), buildingNumber: '' };
}

function fmtCHF(n) {
  return new Intl.NumberFormat('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
}

function validatePayload(p) {
  if (!p) return 'Payload manquant';
  if (!p.creditor?.name) return 'Nom de l\'émetteur requis';
  if (!p.creditor?.iban) return 'IBAN de l\'émetteur requis';
  if (!p.creditor?.address) return 'Adresse de l\'émetteur requise';
  if (!p.creditor?.zip || !p.creditor?.city) return 'NPA + ville émetteur requis';
  if (!p.debtor?.name) return 'Nom du client requis';
  if (!Array.isArray(p.items) || p.items.length === 0) return 'Au moins une ligne de facture requise';
  if (!p.invoice_number) return 'Numéro de facture requis';
  return null;
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (c) => chunks.push(c));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body || {};
  const error = validatePayload(payload);
  if (error) return res.status(400).json({ error });

  try {
    const { creditor, debtor, items, invoice_number, invoice_date, due_date, notes, tva_rate } = payload;

    const subtotalHT = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);
    const tvaPct = TVA_RATES[String(tva_rate ?? '8.1')] ?? 0;
    const tvaAmount = subtotalHT * tvaPct;
    const total = subtotalHT + tvaAmount;

    const creditorAddr = parseSwissAddress(creditor.address);
    const debtorAddr = parseSwissAddress(debtor.address);

    const qrData = {
      currency: 'CHF',
      amount: Number(total.toFixed(2)),
      creditor: {
        account: creditor.iban.replace(/\s+/g, ''),
        name: creditor.name.slice(0, 70),
        address: creditorAddr.address.slice(0, 70),
        buildingNumber: creditorAddr.buildingNumber || undefined,
        zip: creditor.zip,
        city: creditor.city.slice(0, 35),
        country: creditor.country || 'CH',
      },
      debtor: {
        name: debtor.name.slice(0, 70),
        address: debtorAddr.address.slice(0, 70),
        buildingNumber: debtorAddr.buildingNumber || undefined,
        zip: debtor.zip || '',
        city: (debtor.city || '').slice(0, 35),
        country: debtor.country || 'CH',
      },
      message: `Facture ${invoice_number}`,
    };

    const pdf = new PDFDocument({ size: 'A4', margin: 50, autoFirstPage: false });
    pdf.addPage();

    pdf.font('Helvetica-Bold').fontSize(22).fillColor('#0f172a').text(creditor.name, 50, 50);
    pdf.font('Helvetica').fontSize(10).fillColor('#475569');
    pdf.text(creditor.address || '', 50, 78);
    pdf.text(`${creditor.zip} ${creditor.city}`, 50, 92);
    if (creditor.email) pdf.text(creditor.email, 50, 106);
    if (creditor.ide_uid) pdf.text(`IDE: ${creditor.ide_uid}`, 50, 120);

    pdf.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text(debtor.name, 350, 78);
    pdf.font('Helvetica').fontSize(10).fillColor('#475569');
    pdf.text(debtor.address || '', 350, 92);
    pdf.text(`${debtor.zip || ''} ${debtor.city || ''}`.trim(), 350, 106);

    pdf.moveTo(50, 150).lineTo(545, 150).strokeColor('#e2e8f0').stroke();

    pdf.font('Helvetica-Bold').fontSize(24).fillColor('#0f172a').text('Facture', 50, 170);
    pdf.font('Helvetica').fontSize(10).fillColor('#64748b');
    pdf.text(`N° ${invoice_number}`, 50, 200);
    pdf.text(`Date: ${invoice_date || new Date().toISOString().split('T')[0]}`, 50, 215);
    if (due_date) pdf.text(`Échéance: ${due_date}`, 50, 230);

    const tableTop = 270;
    pdf.font('Helvetica-Bold').fontSize(9).fillColor('#475569');
    pdf.text('DESCRIPTION', 50, tableTop);
    pdf.text('QTÉ', 340, tableTop, { width: 50, align: 'right' });
    pdf.text('PRIX UNIT.', 400, tableTop, { width: 70, align: 'right' });
    pdf.text('TOTAL HT', 480, tableTop, { width: 65, align: 'right' });
    pdf.moveTo(50, tableTop + 14).lineTo(545, tableTop + 14).strokeColor('#cbd5e1').stroke();

    let y = tableTop + 22;
    pdf.font('Helvetica').fontSize(10).fillColor('#0f172a');
    for (const item of items) {
      const qty = Number(item.quantity) || 0;
      const unit = Number(item.unit_price) || 0;
      const line = qty * unit;
      const labelHeight = pdf.heightOfString(item.label || '', { width: 280 });
      pdf.text(item.label || '', 50, y, { width: 280 });
      pdf.text(qty.toString(), 340, y, { width: 50, align: 'right' });
      pdf.text(fmtCHF(unit), 400, y, { width: 70, align: 'right' });
      pdf.text(fmtCHF(line), 480, y, { width: 65, align: 'right' });
      y += Math.max(labelHeight, 14) + 6;
      if (y > 600) break;
    }

    pdf.moveTo(350, y + 4).lineTo(545, y + 4).strokeColor('#e2e8f0').stroke();
    y += 14;
    pdf.font('Helvetica').fontSize(10).fillColor('#475569');
    pdf.text('Sous-total HT', 350, y, { width: 130, align: 'right' });
    pdf.font('Helvetica-Bold').fillColor('#0f172a').text(`${fmtCHF(subtotalHT)} CHF`, 480, y, { width: 65, align: 'right' });
    y += 16;
    if (tvaPct > 0) {
      pdf.font('Helvetica').fillColor('#475569').text(`TVA ${(tvaPct * 100).toFixed(1)}%`, 350, y, { width: 130, align: 'right' });
      pdf.font('Helvetica-Bold').fillColor('#0f172a').text(`${fmtCHF(tvaAmount)} CHF`, 480, y, { width: 65, align: 'right' });
      y += 16;
    }
    pdf.moveTo(350, y + 4).lineTo(545, y + 4).strokeColor('#0f172a').lineWidth(1.5).stroke();
    y += 12;
    pdf.font('Helvetica-Bold').fontSize(13).fillColor('#0f172a');
    pdf.text('TOTAL', 350, y, { width: 130, align: 'right' });
    pdf.text(`${fmtCHF(total)} CHF`, 480, y, { width: 65, align: 'right' });

    if (notes) {
      pdf.font('Helvetica').fontSize(9).fillColor('#64748b').text(notes, 50, y + 40, { width: 495 });
    }

    const qrBill = new SwissQRBill(qrData);
    qrBill.attachTo(pdf);

    pdf.end();
    const buf = await streamToBuffer(pdf);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="facture-${invoice_number}.pdf"`);
    res.setHeader('Content-Length', buf.length);
    res.status(200).send(buf);
  } catch (err) {
    console.error('Invoice PDF error:', err);
    res.status(500).json({ error: err?.message || 'Échec génération PDF' });
  }
}
