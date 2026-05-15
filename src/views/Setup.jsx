import React, { useState } from 'react';
import {
  User, Building2, Wallet, Plus, Trash2, Save, Check, AlertCircle,
} from 'lucide-react';
import {
  CANTONS, NATIONALITY_OPTIONS, CIVIL_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS, BUSINESS_FORM_OPTIONS, BUSINESS_SECTORS, LAMAL_FRANCHISES,
} from '../data.js';

const isValidIBAN = (iban) => {
  if (!iban) return true;
  const clean = iban.replace(/\s+/g, '').toUpperCase();
  return /^CH\d{19}$/.test(clean) || /^LI\d{19}$/.test(clean);
};

export function Setup({ theme, mode, profile, expenses, setExpenses, onSaveProfile }) {
  const [section, setSection] = useState('profile');

  const sections = [
    { id: 'profile', label: 'Mon profil', icon: User, available: true },
    { id: 'business', label: 'Mon entreprise', icon: Building2, available: mode === 'pro' },
    { id: 'expenses', label: 'Charges fixes', icon: Wallet, available: true },
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
