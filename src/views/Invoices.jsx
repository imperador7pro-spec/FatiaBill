import React, { useState } from 'react';
import {
  FileText, Plus, Trash2, Download, AlertCircle, Sparkles, ChevronRight, Lock, Crown,
  Mail, Send, X, Check,
} from 'lucide-react';

const TVA_OPTIONS = [
  { value: '8.1', label: '8.1% (taux standard)' },
  { value: '3.8', label: '3.8% (hébergement)' },
  { value: '2.6', label: '2.6% (réduit)' },
  { value: '0', label: 'Hors TVA' },
];

const isValidIBAN = (iban) => {
  if (!iban) return false;
  const clean = iban.replace(/\s+/g, '').toUpperCase();
  return /^CH\d{19}$/.test(clean) || /^LI\d{19}$/.test(clean);
};

function fmtCHF(n) {
  return new Intl.NumberFormat('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
}

export function Invoices({ theme, profile, effPlan, isPremium, onUpgrade }) {
  const today = new Date().toISOString().split('T')[0];
  const defaultDue = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const [creditorOverride, setCreditorOverride] = useState({
    name: profile?.company_name || '',
    iban: profile?.iban || '',
    address: profile?.address_street || '',
    zip: profile?.address_postal_code || '',
    city: profile?.address_city || '',
    ide_uid: profile?.ide_uid || '',
  });

  const [debtor, setDebtor] = useState({
    name: '', address: '', zip: '', city: '', email: '',
  });

  const [meta, setMeta] = useState({
    invoice_number: `${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    invoice_date: today,
    due_date: defaultDue,
    tva_rate: profile?.tva_registered ? '8.1' : '0',
    description: '',
    notes: '',
  });

  const [items, setItems] = useState([
    { id: '1', label: '', quantity: 1, unit_price: '' },
  ]);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [sendModal, setSendModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const subtotal = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);
  const tvaPct = Number(meta.tva_rate) / 100;
  const tvaAmount = subtotal * tvaPct;
  const total = subtotal + tvaAmount;

  const updateItem = (id, key, value) => {
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, [key]: value } : it)));
  };
  const addItem = () => {
    setItems((arr) => [...arr, { id: Date.now().toString(), label: '', quantity: 1, unit_price: '' }]);
  };
  const removeItem = (id) => {
    setItems((arr) => (arr.length > 1 ? arr.filter((it) => it.id !== id) : arr));
  };

  const ibanOK = isValidIBAN(creditorOverride.iban);
  const canGenerate = ibanOK
    && creditorOverride.name && creditorOverride.address && creditorOverride.zip && creditorOverride.city
    && debtor.name
    && items.some((it) => it.label && Number(it.unit_price) > 0)
    && total > 0;

  const buildPayload = () => ({
    creditor: {
      name: creditorOverride.name,
      iban: creditorOverride.iban,
      address: creditorOverride.address,
      zip: creditorOverride.zip,
      city: creditorOverride.city,
      country: 'CH',
      ide_uid: creditorOverride.ide_uid || null,
      email: profile?.email || null,
      phone: profile?.phone || null,
    },
    debtor: {
      name: debtor.name,
      address: debtor.address,
      zip: debtor.zip,
      city: debtor.city,
      country: 'CH',
    },
    items: items.filter((it) => it.label && Number(it.unit_price) > 0).map((it) => ({
      label: it.label,
      quantity: Number(it.quantity) || 1,
      unit_price: Number(it.unit_price) || 0,
    })),
    invoice_number: meta.invoice_number,
    invoice_date: meta.invoice_date,
    due_date: meta.due_date,
    tva_rate: meta.tva_rate,
    description: meta.description || null,
    notes: meta.notes || null,
  });

  const generate = async () => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const r = await fetch('/api/invoice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || `Erreur ${r.status}`);
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${meta.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || 'Erreur génération');
    }
    setGenerating(false);
  };

  const sendByEmail = async ({ recipient, subject, message }) => {
    setError(null);
    setSending(true);
    setSendSuccess(false);
    try {
      const r = await fetch('/api/invoice/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_email: recipient,
          subject,
          message,
          payload: buildPayload(),
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.error) throw new Error(d.error || `Erreur ${r.status}`);
      setSendSuccess(true);
      setTimeout(() => { setSendModal(false); setSendSuccess(false); }, 1800);
    } catch (e) {
      setError(e.message || 'Échec envoi');
    }
    setSending(false);
  };

  if (!isPremium) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className={`text-center py-16 ${theme.mt}`}>
          <Lock size={40} className="mx-auto mb-4 opacity-20" />
          <h3 className={`font-black text-lg mb-2 ${theme.tx}`}>Générateur de QR-factures suisses</h3>
          <p className={`text-sm mb-6 max-w-md mx-auto ${theme.mt}`}>
            Créez des factures conformes à la norme QR-bill obligatoire en Suisse depuis 2022. Vos clients scannent et paient en un clic via leur app banking.
          </p>
          <button onClick={onUpgrade} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black rounded-xl flex items-center gap-2 mx-auto">
            <Crown size={16} /> Débloquer avec Pro Premium
          </button>
          <p className={`text-[10px] mt-3 ${theme.mt}`}>
            Inclus dans Pro Premium · Concurrence: Bexio 39 CHF/mois pour cette fonction seule
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="text-center mb-2">
        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <FileText size={26} />
        </div>
        <h3 className="font-black text-lg">QR-factures suisses</h3>
        <p className={`text-[11px] ${theme.mt}`}>Conforme norme QR-bill · obligatoire CH depuis 30 sept 2022</p>
      </div>

      {!ibanOK && (
        <div className={`p-3 rounded-2xl flex items-start gap-2 ${theme.dk ? 'bg-amber-950/40 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'}`}>
          <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-[11px]">
            <p className={`font-black ${theme.tx}`}>IBAN suisse requis</p>
            <p className={theme.mt}>Format CH + 19 chiffres (ex: CH93 0076 2011 6238 5295 7). Renseignez-le ci-dessous ou modifiez votre profil pour le sauvegarder.</p>
          </div>
        </div>
      )}

      <Section theme={theme} title="Émetteur (vous)">
        <div className="grid grid-cols-2 gap-2">
          <Field theme={theme} label="Raison sociale" full>
            <Input theme={theme} value={creditorOverride.name} onChange={(v) => setCreditorOverride({ ...creditorOverride, name: v })} placeholder="Mon Entreprise Sàrl" />
          </Field>
        </div>
        <Field theme={theme} label="IBAN">
          <Input
            theme={theme}
            value={creditorOverride.iban}
            onChange={(v) => setCreditorOverride({ ...creditorOverride, iban: v.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
            placeholder="CH93 0076 2011 6238 5295 7"
            mono
          />
          {!ibanOK && creditorOverride.iban && (
            <p className="text-[10px] text-rose-500 mt-1">Format IBAN invalide</p>
          )}
        </Field>
        <Field theme={theme} label="Rue + numéro">
          <Input theme={theme} value={creditorOverride.address} onChange={(v) => setCreditorOverride({ ...creditorOverride, address: v })} placeholder="Rue du Lac 12" />
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field theme={theme} label="NPA">
            <Input theme={theme} value={creditorOverride.zip} onChange={(v) => setCreditorOverride({ ...creditorOverride, zip: v.replace(/\D/g, '').slice(0, 4) })} placeholder="1003" />
          </Field>
          <Field theme={theme} label="Ville" wide>
            <Input theme={theme} value={creditorOverride.city} onChange={(v) => setCreditorOverride({ ...creditorOverride, city: v })} placeholder="Lausanne" />
          </Field>
        </div>
        <Field theme={theme} label="IDE / UID (optionnel)">
          <Input theme={theme} value={creditorOverride.ide_uid} onChange={(v) => setCreditorOverride({ ...creditorOverride, ide_uid: v.toUpperCase() })} placeholder="CHE-123.456.789" />
        </Field>
      </Section>

      <Section theme={theme} title="Client">
        <Field theme={theme} label="Nom / Raison sociale">
          <Input theme={theme} value={debtor.name} onChange={(v) => setDebtor({ ...debtor, name: v })} placeholder="Client SA" />
        </Field>
        <Field theme={theme} label="Adresse">
          <Input theme={theme} value={debtor.address} onChange={(v) => setDebtor({ ...debtor, address: v })} placeholder="Avenue X 25" />
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field theme={theme} label="NPA">
            <Input theme={theme} value={debtor.zip} onChange={(v) => setDebtor({ ...debtor, zip: v.replace(/\D/g, '').slice(0, 4) })} placeholder="1200" />
          </Field>
          <Field theme={theme} label="Ville" wide>
            <Input theme={theme} value={debtor.city} onChange={(v) => setDebtor({ ...debtor, city: v })} placeholder="Genève" />
          </Field>
        </div>
        <Field theme={theme} label="Email client (pour envoi)">
          <Input theme={theme} type="email" value={debtor.email} onChange={(v) => setDebtor({ ...debtor, email: v })} placeholder="contact@client.ch" />
        </Field>
      </Section>

      <Section theme={theme} title="Informations facture">
        <div className="grid grid-cols-3 gap-2">
          <Field theme={theme} label="N° facture">
            <Input theme={theme} value={meta.invoice_number} onChange={(v) => setMeta({ ...meta, invoice_number: v })} placeholder="2025-001" />
          </Field>
          <Field theme={theme} label="Date">
            <Input theme={theme} type="date" value={meta.invoice_date} onChange={(v) => setMeta({ ...meta, invoice_date: v })} />
          </Field>
          <Field theme={theme} label="Échéance">
            <Input theme={theme} type="date" value={meta.due_date} onChange={(v) => setMeta({ ...meta, due_date: v })} />
          </Field>
        </div>
        <Field theme={theme} label="TVA">
          <Select theme={theme} value={meta.tva_rate} onChange={(v) => setMeta({ ...meta, tva_rate: v })} options={TVA_OPTIONS} />
        </Field>
        <Field theme={theme} label="Description du mandat (optionnel — affichée en haut de la facture)">
          <Input
            theme={theme}
            value={meta.description}
            onChange={(v) => setMeta({ ...meta, description: v })}
            placeholder="Fabrication et vente de vêtements selon demande client"
          />
        </Field>
      </Section>

      <Section theme={theme} title="Lignes de facture" right={(
        <button onClick={addItem} className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-500">
          <Plus size={12} /> Ligne
        </button>
      )}>
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className={`p-3 rounded-xl border ${theme.bd} space-y-2`}>
              <Input theme={theme} value={it.label} onChange={(v) => updateItem(it.id, 'label', v)} placeholder="Prestation, produit, mandat…" />
              <div className="grid grid-cols-[80px_1fr_1fr_auto] gap-2 items-center">
                <Input theme={theme} type="number" step="1" value={it.quantity} onChange={(v) => updateItem(it.id, 'quantity', v)} placeholder="Qté" />
                <Input theme={theme} type="number" step="0.05" value={it.unit_price} onChange={(v) => updateItem(it.id, 'unit_price', v)} placeholder="Prix unit. CHF" />
                <div className={`px-2 py-2 rounded-lg text-xs font-black tabular-nums text-right ${theme.sf}`}>
                  {fmtCHF((Number(it.quantity) || 0) * (Number(it.unit_price) || 0))} CHF
                </div>
                <button onClick={() => removeItem(it.id)} disabled={items.length === 1} className={`p-2 rounded-lg ${items.length === 1 ? 'opacity-30' : 'hover:bg-rose-100 text-rose-500'}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className={`p-4 rounded-2xl ${theme.cd} border ${theme.bd} space-y-1`}>
        <div className="flex justify-between text-xs">
          <span className={theme.mt}>Sous-total HT</span>
          <span className="font-bold tabular-nums">{fmtCHF(subtotal)} CHF</span>
        </div>
        {Number(meta.tva_rate) > 0 && (
          <div className="flex justify-between text-xs">
            <span className={theme.mt}>TVA {meta.tva_rate}%</span>
            <span className="font-bold tabular-nums">{fmtCHF(tvaAmount)} CHF</span>
          </div>
        )}
        <div className={`flex justify-between pt-2 mt-2 border-t ${theme.bd}`}>
          <span className="font-black text-sm">TOTAL TTC</span>
          <span className="font-black text-base tabular-nums text-indigo-500">{fmtCHF(total)} CHF</span>
        </div>
      </div>

      <Field theme={theme} label="Notes (optionnel — affichées en bas de facture)">
        <textarea
          value={meta.notes}
          onChange={(e) => setMeta({ ...meta, notes: e.target.value })}
          placeholder="Conditions de paiement, mentions spéciales…"
          rows={2}
          className={`w-full border rounded-xl p-2.5 text-xs font-medium outline-none ${theme.inp} focus:border-indigo-500 transition-colors`}
        />
      </Field>

      {error && (
        <div className={`p-3 rounded-xl text-xs font-bold ${theme.dk ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={generate}
          disabled={!canGenerate || generating}
          className={`py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${canGenerate && !generating
            ? `${theme.cd} border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50`
            : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
        >
          {generating ? (
            <>
              <Sparkles size={16} className="animate-spin" /> Génération…
            </>
          ) : (
            <>
              <Download size={16} /> Télécharger PDF
            </>
          )}
        </button>
        <button
          onClick={() => { setError(null); setSendModal(true); }}
          disabled={!canGenerate || generating}
          className={`py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${canGenerate
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:scale-[1.02]'
            : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
        >
          <Send size={16} /> Envoyer par email
        </button>
      </div>

      {!canGenerate && (
        <p className={`text-[10px] text-center ${theme.mt}`}>
          Complétez IBAN + adresses + au moins une ligne pour générer.
        </p>
      )}

      {sendModal && (
        <SendInvoiceModal
          theme={theme}
          defaultRecipient={debtor.email}
          defaultSubject={`Facture ${meta.invoice_number} — ${creditorOverride.name}`}
          defaultMessage={`Voici la facture pour notre prestation du ${meta.invoice_date}. Merci pour votre confiance.`}
          sending={sending}
          success={sendSuccess}
          error={error}
          onClose={() => { setSendModal(false); setError(null); }}
          onSend={sendByEmail}
        />
      )}
    </div>
  );
}

function SendInvoiceModal({ theme, defaultRecipient, defaultSubject, defaultMessage, sending, success, error, onClose, onSend }) {
  const [recipient, setRecipient] = useState(defaultRecipient || '');
  const [subject, setSubject] = useState(defaultSubject || '');
  const [message, setMessage] = useState(defaultMessage || '');
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div
        className={`w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl rounded-t-3xl shadow-2xl ${theme.cd} border ${theme.bd}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`relative p-5 text-white bg-gradient-to-br from-indigo-600 to-purple-700`}>
          <button onClick={onClose} className="absolute top-3 right-3 bg-white/15 p-1.5 rounded-full hover:bg-white/25 transition-colors">
            <X size={14} />
          </button>
          <Mail size={22} className="mb-2" />
          <h2 className="text-lg font-black">Envoyer la facture par email</h2>
          <p className="text-xs opacity-80 mt-0.5">PDF + QR-bill envoyé directement à votre client</p>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          <div>
            <label className="text-[8px] font-black uppercase text-stone-400 tracking-wider">Destinataire</label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="contact@client.ch"
              className={`w-full border rounded-xl p-2.5 text-xs font-bold outline-none ${theme.inp} focus:border-indigo-500 transition-colors`}
            />
            {recipient && !validEmail && (
              <p className="text-[10px] text-rose-500 mt-1">Adresse email invalide</p>
            )}
          </div>
          <div>
            <label className="text-[8px] font-black uppercase text-stone-400 tracking-wider">Objet</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`w-full border rounded-xl p-2.5 text-xs font-bold outline-none ${theme.inp} focus:border-indigo-500`}
            />
          </div>
          <div>
            <label className="text-[8px] font-black uppercase text-stone-400 tracking-wider">Message (optionnel)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className={`w-full border rounded-xl p-2.5 text-xs font-medium outline-none ${theme.inp} focus:border-indigo-500`}
            />
            <p className={`text-[10px] ${theme.mt} mt-1`}>
              Le PDF avec QR-bill est ajouté automatiquement. Une mention "envoyé via FatiaBill" apparaît en pied de mail.
            </p>
          </div>

          {error && !success && (
            <div className={`p-3 rounded-xl text-[11px] font-bold flex items-start gap-2 ${theme.dk ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}
        </div>

        <div className={`p-4 border-t ${theme.bd}`}>
          <button
            onClick={() => onSend({ recipient, subject, message })}
            disabled={!validEmail || !subject || sending}
            className={`w-full py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all ${success
              ? 'bg-emerald-500 text-white'
              : validEmail && subject && !sending
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-[1.02] shadow-lg'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
          >
            {success ? (
              <>
                <Check size={16} /> Envoyé !
              </>
            ) : sending ? (
              <>
                <Sparkles size={16} className="animate-spin" /> Envoi en cours…
              </>
            ) : (
              <>
                <Send size={16} /> Envoyer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ theme, title, children, right }) {
  return (
    <div className={`p-4 rounded-2xl border ${theme.cd} ${theme.bd} space-y-3`}>
      <div className="flex items-center justify-between">
        <h4 className={`font-black text-[10px] uppercase tracking-wider ${theme.mt}`}>{title}</h4>
        {right}
      </div>
      {children}
    </div>
  );
}

function Field({ theme, label, children, full, wide }) {
  return (
    <div className={full ? 'col-span-2' : wide ? 'col-span-2' : ''}>
      <label className="text-[8px] font-black uppercase text-stone-400 tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Input({ theme, value, onChange, placeholder, type = 'text', step, mono }) {
  return (
    <input
      type={type}
      step={step}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border rounded-lg px-2.5 py-2 text-xs font-bold outline-none ${theme.inp} focus:border-indigo-500 transition-colors ${mono ? 'font-mono' : ''}`}
    />
  );
}

function Select({ theme, value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border rounded-lg px-2.5 py-2 text-xs font-bold outline-none ${theme.inp} focus:border-indigo-500`}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
