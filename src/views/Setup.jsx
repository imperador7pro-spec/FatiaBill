import React, { useState } from 'react';
import {
  User, Building2, Wallet, Plus, Trash2, Save, Check, AlertCircle,
  ShieldAlert, Download, Trash, X,
} from 'lucide-react';
import {
  CANTONS, NATIONALITY_OPTIONS, CIVIL_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS, BUSINESS_FORM_OPTIONS, BUSINESS_SECTORS, LAMAL_FRANCHISES,
} from '../data.js';
import { auth } from '../supabase.js';

const isValidIBAN = (iban) => {
  if (!iban) return true;
  const clean = iban.replace(/\s+/g, '').toUpperCase();
  return /^CH\d{19}$/.test(clean) || /^LI\d{19}$/.test(clean);
};

export function Setup({ theme, mode, profile, expenses, setExpenses, onSaveProfile, onAccountDeleted }) {
  const [section, setSection] = useState('profile');

  const sections = [
    { id: 'profile', label: 'Mon profil', icon: User, available: true },
    { id: 'business', label: 'Mon entreprise', icon: Building2, available: mode === 'pro' },
    { id: 'expenses', label: 'Charges fixes', icon: Wallet, available: true },
    { id: 'data', label: 'Mes données', icon: ShieldAlert, available: true },
  ].filter((s) => s.available);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className={`flex p-1 rounded-2xl ${theme.dk ? 'bg-zinc-900' : 'bg-stone-200/80'}`}>
        {sections.map((s) => {
          const Sicon = s.icon;
          const active = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-[11px] uppercase transition-colors ${
                active
                  ? (theme.dk ? 'bg-zinc-800 text-white' : 'bg-white text-stone-900 shadow-sm')
                  : theme.mt
              }`}
            >
              <Sicon size={13} />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      {section === 'profile' && (
        <ProfileSection theme={theme} mode={mode} profile={profile} onSave={onSaveProfile} />
      )}
      {section === 'business' && mode === 'pro' && (
        <BusinessSection theme={theme} profile={profile} onSave={onSaveProfile} />
      )}
      {section === 'expenses' && (
        <ExpensesSection theme={theme} expenses={expenses} setExpenses={setExpenses} />
      )}
      {section === 'data' && (
        <DataRightsSection theme={theme} onAccountDeleted={onAccountDeleted} />
      )}
    </div>
  );
}

function DataRightsSection({ theme, onAccountDeleted }) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleExport = async () => {
    setExportError(null);
    setExporting(true);
    try {
      const token = await auth.getAccessToken();
      if (!token) throw new Error('Session expirée — reconnectez-vous');
      const r = await fetch('/api/account/export', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || `Erreur ${r.status}`);
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fatiabill-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(e?.message || 'Erreur export');
    }
    setExporting(false);
  };

  return (
    <>
      <Card theme={theme} title="Exporter mes données">
        <p className={`text-xs ${theme.mt} mb-3`}>
          Téléchargez l'intégralité de vos données FatiaBill (profil, transactions, objectifs, scans, progression Académie) dans un fichier JSON lisible et portable. <strong className={theme.tx}>Conforme RGPD art. 20 — droit à la portabilité</strong>.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${theme.dk ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-100 hover:bg-zinc-200'} ${theme.tx} transition-colors disabled:opacity-60`}
        >
          {exporting ? (
            <>
              <div className="w-3 h-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              Préparation…
            </>
          ) : (
            <>
              <Download size={13} /> Télécharger ma copie (.json)
            </>
          )}
        </button>
        {exportError && (
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-rose-500">
            <AlertCircle size={12} /> {exportError}
          </div>
        )}
      </Card>

      <div className={`p-5 rounded-2xl border-2 border-rose-500/30 ${theme.dk ? 'bg-rose-950/20' : 'bg-rose-50/40'} space-y-4`}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={18} />
          </div>
          <div className="flex-1">
            <h3 className={`font-black text-base ${theme.tx}`}>Supprimer mon compte</h3>
            <p className={`text-[11px] ${theme.mt} mt-1 leading-relaxed`}>
              Suppression définitive de votre compte et de toutes les données associées sous 30 jours. <strong>Cette action est irréversible.</strong> Conforme RGPD art. 17 — droit à l'oubli.
            </p>
          </div>
        </div>
        <ul className={`text-[11px] space-y-1 pl-12 ${theme.mt}`}>
          <li>• Toutes vos données (transactions, objectifs, scans, profil) supprimées</li>
          <li>• Votre abonnement Premium est annulé immédiatement (pas de remboursement au pro rata)</li>
          <li>• Aucun email de relance</li>
          <li>• Vous pourrez recréer un compte avec le même email plus tard</li>
        </ul>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="ml-12 px-4 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-2"
        >
          <Trash size={13} /> Supprimer définitivement mon compte
        </button>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          theme={theme}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={onAccountDeleted}
        />
      )}
    </>
  );
}

function DeleteAccountModal({ theme, onClose, onSuccess }) {
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const canDelete = confirmation === 'SUPPRIMER';

  const handleDelete = async () => {
    if (!canDelete) return;
    setError(null);
    setDeleting(true);
    try {
      const token = await auth.getAccessToken();
      if (!token) throw new Error('Session expirée — reconnectez-vous');
      const r = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmation }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.error) throw new Error(d.error || `Erreur ${r.status}`);
      onSuccess?.();
    } catch (e) {
      setError(e?.message || 'Erreur suppression');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div
        className={`w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl rounded-t-3xl shadow-2xl ${theme.cd} border ${theme.bd}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-5 text-white bg-gradient-to-br from-rose-600 to-rose-800">
          <button onClick={onClose} className="absolute top-3 right-3 bg-white/15 p-1.5 rounded-full hover:bg-white/25 transition-colors">
            <X size={14} />
          </button>
          <ShieldAlert size={26} className="mb-2" />
          <h2 className="text-lg font-black">Suppression définitive</h2>
          <p className="text-xs opacity-90 mt-0.5">Cette action ne peut pas être annulée.</p>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          <p className={`text-xs leading-relaxed ${theme.tx}`}>
            En cliquant sur "Supprimer définitivement", vous demandez la suppression complète de votre compte FatiaBill et de toutes les données associées.
          </p>
          <p className={`text-xs leading-relaxed ${theme.mt}`}>
            La suppression est effective immédiatement côté authentification. Vos données opérationnelles (transactions, objectifs, scans, profil) seront supprimées sous 30 jours. Les données comptables légalement obligatoires (factures émises par FatiaBill à votre nom) peuvent être conservées 10 ans, conformément à l'article 958f du Code des obligations suisse.
          </p>
          <div>
            <label className="text-[8px] font-black uppercase text-stone-400 tracking-wider">
              Pour confirmer, tapez exactement : <strong className="text-rose-500">SUPPRIMER</strong>
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="SUPPRIMER"
              autoFocus
              className={`w-full mt-1 border rounded-xl p-3 text-sm font-bold outline-none ${theme.inp} focus:border-rose-500`}
            />
          </div>
          {error && (
            <div className={`p-3 rounded-xl text-[11px] font-bold flex items-start gap-2 ${theme.dk ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}
        </div>

        <div className={`p-4 border-t ${theme.bd} flex gap-2`}>
          <button
            onClick={onClose}
            disabled={deleting}
            className={`flex-1 py-3 rounded-2xl text-sm font-black ${theme.sf} ${theme.tx} ${theme.hv} transition-colors disabled:opacity-60`}
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            className={`flex-1 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all ${canDelete && !deleting
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
          >
            {deleting ? (
              <>
                <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Suppression…
              </>
            ) : (
              'Supprimer définitivement'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ theme, mode, profile, onSave }) {
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    birth_year: profile?.birth_year || '',
    canton: profile?.canton || '',
    city: profile?.city || '',
    nationality_status: profile?.nationality_status || '',
    civil_status: profile?.civil_status || '',
    num_children: profile?.num_children ?? 0,
    employment_status: profile?.employment_status || '',
    employer_name: profile?.employer_name || '',
    has_3a: profile?.has_3a ?? false,
    has_lpp: profile?.has_lpp ?? false,
    lamal_provider: profile?.lamal_provider || '',
    lamal_franchise: profile?.lamal_franchise ?? 300,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const update = (k, v) => { setSaved(false); setForm((f) => ({ ...f, [k]: v })); };

  const submit = async () => {
    setError(null);
    setSaving(true);
    try {
      await onSave({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        birth_year: parseInt(form.birth_year, 10) || null,
        canton: form.canton || null,
        city: form.city.trim() || null,
        nationality_status: form.nationality_status || null,
        civil_status: form.civil_status || null,
        num_children: parseInt(form.num_children, 10) || 0,
        employment_status: form.employment_status || null,
        employer_name: form.employer_name.trim() || null,
        has_3a: !!form.has_3a,
        has_lpp: !!form.has_lpp,
        lamal_provider: form.lamal_provider.trim() || null,
        lamal_franchise: parseInt(form.lamal_franchise, 10) || 300,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e?.message || 'Erreur');
    }
    setSaving(false);
  };

  return (
    <Card theme={theme} title="Identité & situation">
      <div className="grid grid-cols-2 gap-3">
        <Field theme={theme} label="Prénom">
          <Input theme={theme} value={form.first_name} onChange={(v) => update('first_name', v)} />
        </Field>
        <Field theme={theme} label="Nom">
          <Input theme={theme} value={form.last_name} onChange={(v) => update('last_name', v)} />
        </Field>
        <Field theme={theme} label="Année de naissance">
          <Input
            theme={theme}
            type="number"
            value={form.birth_year}
            onChange={(v) => update('birth_year', v.replace(/\D/g, '').slice(0, 4))}
            placeholder="1990"
          />
        </Field>
        <Field theme={theme} label="Statut résidence">
          <Select theme={theme} value={form.nationality_status} onChange={(v) => update('nationality_status', v)} options={NATIONALITY_OPTIONS} placeholder="Choisir…" />
        </Field>
        <Field theme={theme} label="Canton">
          <Select
            theme={theme}
            value={form.canton}
            onChange={(v) => update('canton', v)}
            options={CANTONS.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
            placeholder="Choisir…"
          />
        </Field>
        <Field theme={theme} label="Ville">
          <Input theme={theme} value={form.city} onChange={(v) => update('city', v)} placeholder="Lausanne" />
        </Field>
        <Field theme={theme} label="Situation familiale">
          <Select theme={theme} value={form.civil_status} onChange={(v) => update('civil_status', v)} options={CIVIL_STATUS_OPTIONS} placeholder="Choisir…" />
        </Field>
        <Field theme={theme} label="Enfants à charge">
          <Select
            theme={theme}
            value={String(form.num_children)}
            onChange={(v) => update('num_children', parseInt(v, 10) || 0)}
            options={[0, 1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: n === 6 ? '6+' : String(n) }))}
          />
        </Field>
      </div>

      {mode === 'private' && (
        <>
          <Divider theme={theme} label="Situation pro & prévoyance" />
          <div className="space-y-3">
            <Field theme={theme} label="Statut professionnel">
              <Select theme={theme} value={form.employment_status} onChange={(v) => update('employment_status', v)} options={EMPLOYMENT_STATUS_OPTIONS} placeholder="Choisir…" />
            </Field>
            {['employee', 'public_servant'].includes(form.employment_status) && (
              <Field theme={theme} label="Employeur">
                <Input theme={theme} value={form.employer_name} onChange={(v) => update('employer_name', v)} placeholder="ex: CFF, Migros…" />
              </Field>
            )}
            <Toggle theme={theme} value={form.has_3a} onChange={(v) => update('has_3a', v)} label="J'ai un 3ème pilier A" />
            <Toggle theme={theme} value={form.has_lpp} onChange={(v) => update('has_lpp', v)} label="Je cotise à la LPP (2e pilier)" />
            <div className="grid grid-cols-2 gap-3">
              <Field theme={theme} label="Caisse maladie">
                <Input theme={theme} value={form.lamal_provider} onChange={(v) => update('lamal_provider', v)} placeholder="ex: Assura" />
              </Field>
              <Field theme={theme} label="Franchise LAMal">
                <Select
                  theme={theme}
                  value={String(form.lamal_franchise)}
                  onChange={(v) => update('lamal_franchise', parseInt(v, 10) || 300)}
                  options={LAMAL_FRANCHISES.map((f) => ({ value: String(f), label: `CHF ${f}` }))}
                />
              </Field>
            </div>
          </div>
        </>
      )}

      <SaveBar theme={theme} saving={saving} saved={saved} error={error} onSave={submit} />
    </Card>
  );
}

function BusinessSection({ theme, profile, onSave }) {
  const [form, setForm] = useState({
    business_form: profile?.business_form || '',
    business_sector: profile?.business_sector || '',
    ide_uid: profile?.ide_uid || '',
    company_name: profile?.company_name || '',
    tva_registered: profile?.tva_registered ?? false,
    tva_method: profile?.tva_method || '',
    founded_year: profile?.founded_year || '',
    iban: profile?.iban || '',
    address_street: profile?.address_street || '',
    address_postal_code: profile?.address_postal_code || '',
    address_city: profile?.address_city || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const update = (k, v) => { setSaved(false); setForm((f) => ({ ...f, [k]: v })); };
  const ibanOK = isValidIBAN(form.iban);

  const submit = async () => {
    if (form.iban && !ibanOK) {
      setError('IBAN invalide (format CH ou LI + 19 chiffres)');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave({
        business_form: form.business_form || null,
        business_sector: form.business_sector || null,
        ide_uid: form.ide_uid.trim() || null,
        company_name: form.company_name.trim() || null,
        tva_registered: !!form.tva_registered,
        tva_method: form.tva_registered ? (form.tva_method || 'TDFN') : null,
        founded_year: parseInt(form.founded_year, 10) || null,
        iban: form.iban.replace(/\s+/g, '').toUpperCase() || null,
        address_street: form.address_street.trim() || null,
        address_postal_code: form.address_postal_code.trim() || null,
        address_city: form.address_city.trim() || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e?.message || 'Erreur');
    }
    setSaving(false);
  };

  return (
    <Card theme={theme} title="Mon entreprise">
      <div className="space-y-3">
        <Field theme={theme} label="Forme juridique">
          <Select
            theme={theme}
            value={form.business_form}
            onChange={(v) => update('business_form', v)}
            options={BUSINESS_FORM_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            placeholder="Choisir…"
          />
        </Field>
        <Field theme={theme} label="Secteur d'activité">
          <Select
            theme={theme}
            value={form.business_sector}
            onChange={(v) => update('business_sector', v)}
            options={BUSINESS_SECTORS.map((s) => ({ value: s, label: s }))}
            placeholder="Choisir…"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field theme={theme} label="Nom commercial">
            <Input theme={theme} value={form.company_name} onChange={(v) => update('company_name', v)} placeholder="Mon Entreprise Sàrl" />
          </Field>
          <Field theme={theme} label="Année de création">
            <Input
              theme={theme}
              type="number"
              value={form.founded_year}
              onChange={(v) => update('founded_year', v.replace(/\D/g, '').slice(0, 4))}
            />
          </Field>
        </div>
        <Field theme={theme} label="IDE / UID">
          <Input
            theme={theme}
            value={form.ide_uid}
            onChange={(v) => update('ide_uid', v.toUpperCase())}
            placeholder="CHE-123.456.789"
          />
        </Field>

        <Toggle
          theme={theme}
          value={form.tva_registered}
          onChange={(v) => update('tva_registered', v)}
          label="Assujetti·e à la TVA"
        />
        {form.tva_registered && (
          <Field theme={theme} label="Méthode TVA">
            <Select
              theme={theme}
              value={form.tva_method}
              onChange={(v) => update('tva_method', v)}
              options={[
                { value: 'TDFN', label: 'TDFN (forfaitaire simplifiée)' },
                { value: 'effective', label: 'Effective (déductible préalable)' },
              ]}
              placeholder="Choisir…"
            />
          </Field>
        )}
      </div>

      <Divider theme={theme} label="Coordonnées de facturation (QR-bills)" />

      <div className="space-y-3">
        <Field theme={theme} label="IBAN suisse">
          <Input
            theme={theme}
            value={form.iban}
            onChange={(v) => update('iban', v.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder="CH93 0076 2011 6238 5295 7"
            mono
          />
          {form.iban && !ibanOK && (
            <p className="text-[10px] text-rose-500 mt-1">Format invalide — attendu CH/LI + 19 chiffres</p>
          )}
          <p className={`text-[10px] mt-1 ${theme.mt}`}>Compte CHF où vos clients vous paient via QR-facture.</p>
        </Field>
        <Field theme={theme} label="Adresse (rue + numéro)">
          <Input theme={theme} value={form.address_street} onChange={(v) => update('address_street', v)} placeholder="Rue du Lac 12" />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field theme={theme} label="NPA">
            <Input
              theme={theme}
              value={form.address_postal_code}
              onChange={(v) => update('address_postal_code', v.replace(/\D/g, '').slice(0, 4))}
              placeholder="1003"
            />
          </Field>
          <div className="col-span-2">
            <Field theme={theme} label="Ville">
              <Input theme={theme} value={form.address_city} onChange={(v) => update('address_city', v)} placeholder="Lausanne" />
            </Field>
          </div>
        </div>
      </div>

      <SaveBar theme={theme} saving={saving} saved={saved} error={error} onSave={submit} />
    </Card>
  );
}

function ExpensesSection({ theme, expenses, setExpenses }) {
  const addExpense = () => {
    setExpenses([
      ...expenses,
      { id: Date.now().toString(), label: 'Nouvelle charge', amount: 0, category: 'Autre', icon: 'Receipt' },
    ]);
  };
  const updateField = (id, field, value) => {
    setExpenses(expenses.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };
  const removeExpense = (id) => setExpenses(expenses.filter((e) => e.id !== id));

  return (
    <Card theme={theme} title="Charges fixes mensuelles">
      <p className={`text-[10px] ${theme.mt} mb-2`}>Loyer, assurances, abos — tout ce qui sort tous les mois.</p>
      <div className="space-y-2">
        {expenses.map((e) => (
          <div key={e.id} className={`p-3 rounded-xl border flex items-center gap-2 ${theme.bd} ${theme.cd}`}>
            <input
              type="text"
              value={e.label}
              onChange={(v) => updateField(e.id, 'label', v.target.value)}
              className={`flex-1 text-xs font-bold bg-transparent outline-none border-b pb-0.5 ${theme.dk ? 'border-zinc-800' : 'border-stone-200'}`}
            />
            <input
              type="number"
              value={e.amount || ''}
              onChange={(v) => updateField(e.id, 'amount', parseFloat(v.target.value) || 0)}
              className={`w-20 px-2 py-1 rounded-lg text-xs font-black text-right ${theme.sf}`}
            />
            <span className="text-[9px] text-stone-500">CHF</span>
            <button onClick={() => removeExpense(e.id)} className="p-1.5 text-stone-400 hover:text-rose-500">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addExpense}
        className={`mt-3 w-full py-2.5 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 ${theme.sf} ${theme.mt}`}
      >
        <Plus size={13} /> Ajouter une charge
      </button>
    </Card>
  );
}

function Card({ theme, title, children }) {
  return (
    <div className={`p-5 rounded-2xl border ${theme.cd} ${theme.bd} space-y-4`}>
      <h3 className={`text-[11px] font-black uppercase tracking-wider ${theme.mt}`}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ theme, label, children }) {
  return (
    <div>
      <label className="text-[8px] font-black uppercase text-stone-400 tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Input({ theme, value, onChange, placeholder, type = 'text', mono }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border rounded-lg px-2.5 py-2 text-xs font-bold outline-none ${theme.inp} focus:border-emerald-500 transition-colors ${mono ? 'font-mono' : ''}`}
    />
  );
}

function Select({ theme, value, onChange, options, placeholder }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border rounded-lg px-2.5 py-2 text-xs font-bold outline-none ${theme.inp} focus:border-emerald-500`}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Toggle({ theme, value, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-full flex items-center justify-between p-3 rounded-xl border ${theme.bd} ${theme.cd} hover:border-emerald-500 transition-colors`}
    >
      <span className={`text-xs font-bold ${theme.tx}`}>{label}</span>
      <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${value ? 'bg-emerald-500' : 'bg-stone-300'}`}>
        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
      </div>
    </button>
  );
}

function Divider({ theme, label }) {
  return (
    <div className={`pt-3 mt-3 border-t ${theme.bd}`}>
      <p className={`text-[10px] font-black uppercase tracking-wider ${theme.mt} mb-2`}>{label}</p>
    </div>
  );
}

function SaveBar({ theme, saving, saved, error, onSave }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <button
        onClick={onSave}
        disabled={saving}
        className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${saved
          ? 'bg-emerald-500 text-white'
          : 'bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50'}`}
      >
        {saving ? (
          <>
            <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Sauvegarde…
          </>
        ) : saved ? (
          <>
            <Check size={14} /> Enregistré
          </>
        ) : (
          <>
            <Save size={14} /> Sauvegarder
          </>
        )}
      </button>
      {error && (
        <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500">
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  );
}
