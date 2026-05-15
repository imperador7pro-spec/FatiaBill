import PDFDocument from 'pdfkit';
import { SwissQRBill } from 'swissqrbill/pdf';

const TVA_RATES = { '0': 0, '2.6': 0.026, '3.8': 0.038, '8.1': 0.081 };

const EMERALD = '#059669';
const EMERALD_DARK = '#047857';
const STONE_900 = '#0f172a';
const STONE_500 = '#64748b';
const STONE_300 = '#cbd5e1';
const STONE_200 = '#e2e8f0';
const HIGHLIGHT = '#d1fae5';

function fmtSwiss(n) {
  const rounded = Math.round((Number(n) || 0) * 100) / 100;
  if (rounded % 1 === 0) {
    return new Intl.NumberFormat('fr-CH', { maximumFractionDigits: 0 }).format(rounded) + '.-';
  }
  return new Intl.NumberFormat('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(rounded);
}

function parseSwissAddress(street) {
  if (!street) return { address: '', buildingNumber: '' };
  const match = street.trim().match(/^(.*?)(?:\s+(\d+[a-zA-Z]?))?$/);
  if (match && match[2]) return { address: match[1].trim(), buildingNumber: match[2] };
  return { address: street.trim(), buildingNumber: '' };
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (c) => chunks.push(c));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export function validateInvoicePayload(p) {
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

export async function buildInvoicePdf(payload) {
  const {
    creditor, debtor, items, invoice_number, invoice_date, due_date,
    notes, tva_rate, description,
  } = payload;

  const subtotalHT = items.reduce(
    (s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
    0,
  );
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

  // ═══════════════════════════════════════════════
  // HEADER — 2 columns
  // ═══════════════════════════════════════════════

  // LEFT: Creditor (sender) — bold block
  pdf.font('Helvetica-Bold').fontSize(11).fillColor(STONE_900);
  let y = 50;
  pdf.text(creditor.name, 50, y);
  y += 14;
  pdf.font('Helvetica').fontSize(10).fillColor(STONE_900);
  if (creditor.address) { pdf.text(creditor.address, 50, y); y += 13; }
  pdf.text(`${creditor.zip} ${creditor.city}`, 50, y); y += 13;
  if (creditor.phone) { pdf.text(creditor.phone, 50, y); y += 13; }
  if (creditor.email) { pdf.text(creditor.email, 50, y); y += 13; }
  if (creditor.ide_uid) { pdf.font('Helvetica-Bold').text(creditor.ide_uid, 50, y); y += 13; }

  // RIGHT: Date + "Facture" title + Debtor
  pdf.font('Helvetica').fontSize(9).fillColor(STONE_500);
  pdf.text(`Date: ${invoice_date || new Date().toISOString().split('T')[0]}`, 350, 50, { width: 195, align: 'right' });

  pdf.font('Helvetica-Bold').fontSize(22).fillColor(EMERALD);
  pdf.text('Facture', 350, 70, { width: 195, align: 'right' });

  pdf.font('Helvetica-Bold').fontSize(10).fillColor(STONE_900);
  pdf.text(debtor.name, 350, 105, { width: 195, align: 'right' });
  pdf.font('Helvetica').fontSize(10);
  let ry = 120;
  if (debtor.address) { pdf.text(debtor.address, 350, ry, { width: 195, align: 'right' }); ry += 13; }
  if (debtor.zip || debtor.city) {
    pdf.text(`${debtor.zip || ''} ${debtor.city || ''}`.trim(), 350, ry, { width: 195, align: 'right' });
    ry += 13;
  }

  // N° facture (small, right)
  if (invoice_number) {
    pdf.font('Helvetica').fontSize(9).fillColor(STONE_500);
    pdf.text(`N° ${invoice_number}`, 350, ry + 4, { width: 195, align: 'right' });
  }

  // ═══════════════════════════════════════════════
  // DESCRIPTION (centered, emerald, underlined)
  // ═══════════════════════════════════════════════

  const headerBottom = Math.max(y, ry + 20);
  let cursor = headerBottom + 30;

  if (description) {
    pdf.font('Helvetica-Oblique').fontSize(13).fillColor(EMERALD);
    pdf.text(description, 50, cursor, { width: 495, align: 'center', underline: true });
    cursor += 30;
  }

  // ═══════════════════════════════════════════════
  // TABLE
  // ═══════════════════════════════════════════════

  cursor += 10;
  pdf.font('Helvetica-Bold').fontSize(10).fillColor(STONE_900);
  pdf.text('Facture et détails :', 50, cursor);
  cursor += 22;

  // Table header
  pdf.font('Helvetica-Bold').fontSize(9).fillColor(STONE_500);
  pdf.text('DESCRIPTION', 50, cursor);
  pdf.text('QTÉ', 340, cursor, { width: 50, align: 'right' });
  pdf.text('PRIX UNIT.', 400, cursor, { width: 70, align: 'right' });
  pdf.text('PRIX TTC', 480, cursor, { width: 65, align: 'right' });
  cursor += 13;
  pdf.moveTo(50, cursor).lineTo(545, cursor).strokeColor(STONE_300).lineWidth(0.7).stroke();
  cursor += 10;

  // Items
  pdf.font('Helvetica').fontSize(10).fillColor(STONE_900);
  for (const item of items) {
    const qty = Number(item.quantity) || 0;
    const unit = Number(item.unit_price) || 0;
    const line = qty * unit;
    const labelHeight = pdf.heightOfString(item.label || '', { width: 280 });
    pdf.text(item.label || '', 50, cursor, { width: 280 });
    pdf.text(qty.toString(), 340, cursor, { width: 50, align: 'right' });
    pdf.text(fmtSwiss(unit), 400, cursor, { width: 70, align: 'right' });
    pdf.text(fmtSwiss(line), 480, cursor, { width: 65, align: 'right' });
    cursor += Math.max(labelHeight, 14) + 6;
    if (cursor > 580) break;
  }

  cursor += 6;
  pdf.moveTo(350, cursor).lineTo(545, cursor).strokeColor(STONE_200).lineWidth(0.7).stroke();
  cursor += 10;

  // Subtotal
  pdf.font('Helvetica').fontSize(10).fillColor(STONE_500);
  pdf.text('Sous-total HT', 350, cursor, { width: 130, align: 'right' });
  pdf.font('Helvetica-Bold').fillColor(STONE_900).text(`${fmtSwiss(subtotalHT)} CHF`, 480, cursor, { width: 65, align: 'right' });
  cursor += 16;

  // TVA
  if (tvaPct > 0) {
    pdf.font('Helvetica').fillColor(STONE_500).text(`TVA ${(tvaPct * 100).toFixed(1)}%`, 350, cursor, { width: 130, align: 'right' });
    pdf.font('Helvetica-Bold').fillColor(STONE_900).text(`${fmtSwiss(tvaAmount)} CHF`, 480, cursor, { width: 65, align: 'right' });
    cursor += 16;
  }

  // Total — highlighted box
  cursor += 4;
  pdf.rect(350, cursor - 4, 195, 26).fill(HIGHLIGHT);
  pdf.font('Helvetica-Bold').fontSize(13).fillColor(EMERALD_DARK);
  pdf.text(`Total TTC : ${fmtSwiss(total)} CHF`, 350, cursor + 4, { width: 185, align: 'right' });
  cursor += 36;

  // Notes (italic, underlined)
  if (notes) {
    pdf.font('Helvetica-Oblique').fontSize(10).fillColor(STONE_900);
    pdf.text(notes, 50, cursor, { width: 495, underline: false });
    cursor += 30;
  } else {
    cursor += 10;
  }

  pdf.font('Helvetica-Oblique').fontSize(9).fillColor(STONE_500);
  pdf.text(`Montant total TTC — CHF ${fmtSwiss(total)} à régler via la QR-facture ci-dessous.`, 50, cursor, { width: 495 });

  // ═══════════════════════════════════════════════
  // QR-BILL (auto positioned at bottom)
  // ═══════════════════════════════════════════════

  const qrBill = new SwissQRBill(qrData);
  qrBill.attachTo(pdf);

  // ═══════════════════════════════════════════════
  // FOOTER — moved INSIDE the page bottom margin
  // (PDFKit auto-creates a 2nd page if QR-bill pushes us; that's OK)
  // ═══════════════════════════════════════════════

  // Footer is rendered on whatever the final page is, before pdf.end()
  // PDFKit doesn't easily let us write below the QR-bill section — skip
  // footer block for now (the QR-bill already includes creditor coordinates)

  pdf.end();
  return await streamToBuffer(pdf);
}
