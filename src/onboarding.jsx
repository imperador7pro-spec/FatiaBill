import React, { useState, useMemo } from 'react';
import {
  User, Briefcase, ChevronRight, ChevronLeft, Check, Sun, Moon,
  MapPin, Heart, GraduationCap, Building2, Shield, Receipt, Sparkles,
} from 'lucide-react';
import {
  CANTONS, NATIONALITY_OPTIONS, CIVIL_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS, BUSINESS_FORM_OPTIONS, BUSINESS_SECTORS, LAMAL_FRANCHISES,
} from './data.js';

const currentYear = new Date().getFullYear();

const parseNameFromEmail = (email) => {
  if (!email) return { first: '', last: '' };
  const local = email.split('@')[0];
  const parts = local.split(/[._\-+]/).filter(Boolean);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  return {
    first: parts[0] ? cap(parts[0]) : '',
    last: parts[1] ? cap(parts[1]) : '',
  };
};

function Label({ children, required }) {
  return (
    <label className="text-[9px] font-black uppercase text-stone-400 tracking-wider">
      {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ theme, value, onChange, placeholder, type = 'text', max }) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={max}
      className={`w-full border rounded-xl p-2.5 text-sm font-medium outline-none ${theme.inp} focus:border-emerald-500 transition-colors`}
    />
  );
}

function Select({ theme, value, onChange, options, placeholder }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border rounded-xl p-2.5 text-sm font-medium outline-none ${theme.inp} focus:border-emerald-500 transition-colors`}
    >
      <option value="" disabled>{placeholder || 'Choisir…'}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
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
      <span className={`text-sm font-bold ${theme.tx}`}>{label}</span>
      <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${value ? 'bg-emerald-500' : 'bg-stone-300'}`}>
        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
      </div>
    </button>
  );
}

function StepHeader({ theme, step, total, title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 mb-3">
        {[...Array(total)].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? 'bg-emerald-500' : theme.dk ? 'bg-zinc-800' : 'bg-stone-200'}`}
          />
        ))}
      </div>
      <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider mb-1">
        Étape {step} / {total}
      </p>
      <h2 className={`text-2xl font-black ${theme.tx} tracking-tight`}>{title}</h2>
      {subtitle && <p className={`text-sm ${theme.mt} mt-1`}>{subtitle}</p>}
    </div>
  );
}

export function OnboardingWizard({ theme, user, darkMode, onToggleDark, existingProfile, onComplete, onSignOut }) {
  const initialName = useMemo(() => parseNameFromEmail(user?.email), [user]);

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    mode: existingProfile?.mode || null,
    first_name: existingProfile?.first_name || initialName.first,
    last_name: existingProfile?.last_name || initialName.last,
    birth_year: existingProfile?.birth_year || '',
    canton: existingProfile?.canton || '',
    city: existingProfile?.city || '',
    nationality_status: existingProfile?.nationality_status || '',
    civil_status: existingProfile?.civil_status || '',
    num_children: existingProfile?.num_children ?? 0,
    employment_status: existingProfile?.employment_status || '',
    employer_name: existingProfile?.employer_name || '',
    has_3a: existingProfile?.has_3a ?? false,
    has_lpp: existingProfile?.has_lpp ?? false,
    lamal_provider: existingProfile?.lamal_provider || '',
    lamal_franchise: existingProfile?.lamal_franchise || 300,
    business_form: existingProfile?.business_form || '',
    business_sector: existingProfile?.business_sector || '',
    ide_uid: existingProfile?.ide_uid || '',
    company_name: existingProfile?.company_name || '',
    tva_registered: existingProfile?.tva_registered ?? false,
    tva_method: existingProfile?.tva_method || '',
    founded_year: existingProfile?.founded_year || '',
  });

  const totalSteps = 4;
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 1) return !!form.mode;
    if (step === 2) {
      return form.first_name && form.last_name && form.birth_year
        && form.canton && form.nationality_status && form.civil_status;
    }
    if (step === 3) {
      if (form.mode === 'private') return !!form.employment_status;
      return !!form.business_form && !!form.business_sector;
    }
    return true;
  };

  const goNext = () => {
    if (!canNext()) {
      setError('Merci de remplir les champs obligatoires (*)');
      return;
    }
    setError('');
    if (step < totalSteps) setStep(step + 1);
  };
  const goBack = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  const finish = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        mode: form.mode,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        birth_year: parseInt(form.birth_year, 10) || null,
        canton: form.canton,
        city: form.city.trim() || null,
        nationality_status: form.nationality_status,
        civil_status: form.civil_status,
        num_children: parseInt(form.num_children, 10) || 0,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      };
      if (form.mode === 'private') {
        Object.assign(payload, {
          employment_status: form.employment_status,
          employer_name: form.employer_name.trim() || null,
          has_3a: !!form.has_3a,
          has_lpp: !!form.has_lpp,
          lamal_provider: form.lamal_provider.trim() || null,
          lamal_franchise: parseInt(form.lamal_franchise, 10) || 300,
        });
      } else {
        const cname = form.company_name.trim()
          || `${form.first_name} ${form.last_name}`.trim()
          || 'Mon Entreprise';
        Object.assign(payload, {
          business_form: form.business_form,
          business_sector: form.business_sector,
          ide_uid: form.ide_uid.trim() || null,
          company_name: cname,
          tva_registered: !!form.tva_registered,
          tva_method: form.tva_registered ? (form.tva_method || 'TDFN') : null,
          founded_year: parseInt(form.founded_year, 10) || null,
        });
      }
      await onComplete(payload);
    } catch (e) {
      setError(e?.message || 'Erreur lors de l\'enregistrement');
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col`}>
      <header className="flex items-center justify-between p-4 max-w-2xl w-full mx-auto">
        <div>
          <h1 className={`text-2xl font-black italic tracking-tighter ${theme.tx}`}>
            FatiaBill<span className="text-emerald-500">.</span>
          </h1>
          <p className={`text-[10px] font-bold ${theme.mt} uppercase tracking-wider`}>Bienvenue</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDark}
            className={`p-2.5 rounded-full ${darkMode ? 'bg-zinc-800 text-yellow-400' : 'bg-white text-stone-800 shadow'}`}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={onSignOut}
            className={`text-[10px] font-bold uppercase ${theme.mt} hover:text-rose-500 transition-colors`}
          >
            Se déconnecter
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-start md:items-center justify-center p-4">
        <div className={`max-w-2xl w-full p-6 md:p-8 rounded-3xl border ${theme.cd} ${theme.bd} shadow-xl`}>
          {step === 1 && <Step1Mode theme={theme} form={form} update={update} />}
          {step === 2 && <Step2Personal theme={theme} form={form} update={update} />}
          {step === 3 && form.mode === 'private' && <Step3Private theme={theme} form={form} update={update} />}
          {step === 3 && form.mode === 'pro' && <Step3Pro theme={theme} form={form} update={update} />}
          {step === 4 && <Step4Recap theme={theme} form={form} />}

          {error && (
            <div className="p-3 mt-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mt-6 gap-3">
            <button
              onClick={goBack}
              disabled={step === 1 || saving}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : theme.hv} ${theme.tx}`}
            >
              <ChevronLeft size={16} /> Retour
            </button>
            {step < totalSteps ? (
              <button
                onClick={goNext}
                disabled={saving}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-colors ${canNext() ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-stone-300 cursor-not-allowed'}`}
              >
                Continuer <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={finish}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-black text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 transition-colors"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Création…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Démarrer FatiaBill
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Step1Mode({ theme, form, update }) {
  return (
    <>
      <StepHeader
        theme={theme}
        step={1}
        total={4}
        title="Comment utilisez-vous FatiaBill ?"
        subtitle="Vous pourrez changer plus tard depuis votre profil."
      />
      <div className="grid md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => update('mode', 'private')}
          className={`text-left p-5 rounded-2xl border-2 transition-all ${form.mode === 'private' ? 'border-emerald-500 ' + (theme.dk ? 'bg-emerald-500/10' : 'bg-emerald-50') : `${theme.bd} ${theme.cd} hover:border-emerald-300`}`}
        >
          <div className="w-11 h-11 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-3">
            <User size={22} />
          </div>
          <h3 className={`font-black text-base mb-1 ${theme.tx}`}>Particulier</h3>
          <p className={`text-xs ${theme.mt} leading-relaxed`}>
            Salarié·e, retraité·e, étudiant·e, frontalier·e. Budget, impôts, 3ème pilier, objectifs d'épargne.
          </p>
          {form.mode === 'private' && (
            <div className="mt-3 flex items-center gap-1 text-emerald-600 text-[11px] font-black">
              <Check size={14} /> Sélectionné
            </div>
          )}
        </button>
        <button
          type="button"
          onClick={() => update('mode', 'pro')}
          className={`text-left p-5 rounded-2xl border-2 transition-all ${form.mode === 'pro' ? 'border-indigo-500 ' + (theme.dk ? 'bg-indigo-500/10' : 'bg-indigo-50') : `${theme.bd} ${theme.cd} hover:border-indigo-300`}`}
        >
          <div className="w-11 h-11 bg-indigo-500/15 text-indigo-500 rounded-2xl flex items-center justify-center mb-3">
            <Briefcase size={22} />
          </div>
          <h3 className={`font-black text-base mb-1 ${theme.tx}`}>Indépendant·e / Entreprise</h3>
          <p className={`text-xs ${theme.mt} leading-relaxed`}>
            RI, Sàrl, SA. Trésorerie, TVA, charges sociales, scanner factures, génération QR-bills.
          </p>
          {form.mode === 'pro' && (
            <div className="mt-3 flex items-center gap-1 text-indigo-600 text-[11px] font-black">
              <Check size={14} /> Sélectionné
            </div>
          )}
        </button>
      </div>
    </>
  );
}

function Step2Personal({ theme, form, update }) {
  return (
    <>
      <StepHeader
        theme={theme}
        step={2}
        total={4}
        title="Vos informations"
        subtitle="Nécessaires pour personnaliser les calculs fiscaux et les factures."
      />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Prénom</Label>
            <TextInput theme={theme} value={form.first_name} onChange={(v) => update('first_name', v)} placeholder="Jean" max={50} />
          </div>
          <div>
            <Label required>Nom</Label>
            <TextInput theme={theme} value={form.last_name} onChange={(v) => update('last_name', v)} placeholder="Dupont" max={50} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Année de naissance</Label>
            <TextInput
              theme={theme}
              type="number"
              value={form.birth_year}
              onChange={(v) => update('birth_year', v.replace(/\D/g, '').slice(0, 4))}
              placeholder="1990"
            />
          </div>
          <div>
            <Label required>Statut de résidence</Label>
            <Select theme={theme} value={form.nationality_status} onChange={(v) => update('nationality_status', v)} options={NATIONALITY_OPTIONS} placeholder="Choisir…" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Canton</Label>
            <Select
              theme={theme}
              value={form.canton}
              onChange={(v) => update('canton', v)}
              options={CANTONS.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
              placeholder="Choisir…"
            />
          </div>
          <div>
            <Label>Ville (optionnel)</Label>
            <TextInput theme={theme} value={form.city} onChange={(v) => update('city', v)} placeholder="Lausanne" max={100} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Situation familiale</Label>
            <Select theme={theme} value={form.civil_status} onChange={(v) => update('civil_status', v)} options={CIVIL_STATUS_OPTIONS} placeholder="Choisir…" />
          </div>
          <div>
            <Label>Enfants à charge</Label>
            <Select
              theme={theme}
              value={String(form.num_children)}
              onChange={(v) => update('num_children', parseInt(v, 10) || 0)}
              options={[0, 1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: n === 6 ? '6+' : String(n) }))}
            />
          </div>
        </div>

        <p className={`text-[10px] ${theme.mt} flex items-start gap-1.5 mt-2`}>
          <Shield size={12} className="mt-0.5 flex-shrink-0" />
          Vos données restent privées. Elles servent uniquement à personnaliser FatiaBill (calculs fiscaux, factures, conseils IA).
        </p>
      </div>
    </>
  );
}

function Step3Private({ theme, form, update }) {
  return (
    <>
      <StepHeader
        theme={theme}
        step={3}
        total={4}
        title="Votre situation professionnelle"
        subtitle="Pour des conseils 3ème pilier, LPP et fiscalité adaptés."
      />
      <div className="space-y-4">
        <div>
          <Label required>Statut professionnel</Label>
          <Select theme={theme} value={form.employment_status} onChange={(v) => update('employment_status', v)} options={EMPLOYMENT_STATUS_OPTIONS} placeholder="Choisir…" />
        </div>

        {['employee', 'public_servant'].includes(form.employment_status) && (
          <div>
            <Label>Employeur (optionnel)</Label>
            <TextInput theme={theme} value={form.employer_name} onChange={(v) => update('employer_name', v)} placeholder="ex: CFF, Migros, État de Vaud…" max={100} />
          </div>
        )}

        <div className="space-y-2.5 pt-2">
          <Toggle theme={theme} value={form.has_3a} onChange={(v) => update('has_3a', v)} label="J'ai un 3ème pilier A" />
          <Toggle theme={theme} value={form.has_lpp} onChange={(v) => update('has_lpp', v)} label="Je cotise à la LPP (2e pilier)" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <Label>Caisse maladie</Label>
            <TextInput theme={theme} value={form.lamal_provider} onChange={(v) => update('lamal_provider', v)} placeholder="ex: Assura, Helsana…" max={100} />
          </div>
          <div>
            <Label>Franchise LAMal</Label>
            <Select
              theme={theme}
              value={String(form.lamal_franchise)}
              onChange={(v) => update('lamal_franchise', parseInt(v, 10) || 300)}
              options={LAMAL_FRANCHISES.map((f) => ({ value: String(f), label: `CHF ${f}` }))}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function Step3Pro({ theme, form, update }) {
  return (
    <>
      <StepHeader
        theme={theme}
        step={3}
        total={4}
        title="Votre activité"
        subtitle="Pour adapter la comptabilité, la TVA et les factures."
      />
      <div className="space-y-4">
        <div>
          <Label required>Forme juridique</Label>
          <div className="space-y-2 mt-1">
            {BUSINESS_FORM_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => update('business_form', opt.value)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${form.business_form === opt.value ? 'border-indigo-500 ' + (theme.dk ? 'bg-indigo-500/10' : 'bg-indigo-50') : `${theme.bd} ${theme.cd} hover:border-indigo-300`}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-black text-sm ${theme.tx}`}>{opt.label}</p>
                    {opt.hint && <p className={`text-[11px] ${theme.mt} mt-0.5`}>{opt.hint}</p>}
                  </div>
                  {form.business_form === opt.value && <Check size={16} className="text-indigo-500 flex-shrink-0" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label required>Secteur d'activité</Label>
          <Select
            theme={theme}
            value={form.business_sector}
            onChange={(v) => update('business_sector', v)}
            options={BUSINESS_SECTORS.map((s) => ({ value: s, label: s }))}
            placeholder="Choisir un secteur…"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Nom commercial (optionnel)</Label>
            <TextInput theme={theme} value={form.company_name} onChange={(v) => update('company_name', v)} placeholder="Mon Entreprise Sàrl" max={100} />
          </div>
          <div>
            <Label>Année de création</Label>
            <TextInput
              theme={theme}
              type="number"
              value={form.founded_year}
              onChange={(v) => update('founded_year', v.replace(/\D/g, '').slice(0, 4))}
              placeholder={String(currentYear)}
            />
          </div>
        </div>

        <div>
          <Label>IDE / UID (optionnel)</Label>
          <TextInput
            theme={theme}
            value={form.ide_uid}
            onChange={(v) => update('ide_uid', v.toUpperCase())}
            placeholder="CHE-123.456.789"
            max={20}
          />
        </div>

        <div className="pt-2">
          <Toggle theme={theme} value={form.tva_registered} onChange={(v) => update('tva_registered', v)} label="Je suis assujetti·e à la TVA (CA > 100'000 CHF)" />
          {form.tva_registered && (
            <div className="mt-3">
              <Label>Méthode TVA</Label>
              <Select
                theme={theme}
                value={form.tva_method}
                onChange={(v) => update('tva_method', v)}
                options={[
                  { value: 'TDFN', label: 'TDFN (taux de la dette fiscale nette, simplifié)' },
                  { value: 'effective', label: 'Effective (déductible préalable)' },
                ]}
                placeholder="Choisir…"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Step4Recap({ theme, form }) {
  const isPrivate = form.mode === 'private';
  const accent = isPrivate ? 'emerald' : 'indigo';
  const Icon = isPrivate ? User : Briefcase;
  const fullName = `${form.first_name} ${form.last_name}`.trim();
  const cantonName = CANTONS.find((c) => c.code === form.canton)?.name || form.canton;
  const nationalityLabel = NATIONALITY_OPTIONS.find((o) => o.value === form.nationality_status)?.label;
  const civilLabel = CIVIL_STATUS_OPTIONS.find((o) => o.value === form.civil_status)?.label;
  const employmentLabel = EMPLOYMENT_STATUS_OPTIONS.find((o) => o.value === form.employment_status)?.label;
  const businessFormLabel = BUSINESS_FORM_OPTIONS.find((o) => o.value === form.business_form)?.label;

  return (
    <>
      <StepHeader
        theme={theme}
        step={4}
        total={4}
        title={`Bienvenue ${form.first_name} !`}
        subtitle="Voici votre profil. Vous pourrez tout modifier depuis Paramètres."
      />

      <div className={`p-5 rounded-2xl bg-${accent}-500/10 border border-${accent}-500/30 mb-4`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-2xl bg-${accent}-500 text-white flex items-center justify-center`}>
            <Icon size={20} />
          </div>
          <div>
            <p className={`font-black text-base ${theme.tx}`}>{fullName}</p>
            <p className={`text-[11px] ${theme.mt}`}>
              {isPrivate ? 'Mode Particulier' : `Mode Pro · ${businessFormLabel}`}
            </p>
          </div>
        </div>

        <div className={`space-y-1.5 text-xs ${theme.tx}`}>
          <RecapLine icon={<MapPin size={12} />} label="Canton">{cantonName} {form.city && `· ${form.city}`}</RecapLine>
          <RecapLine icon={<User size={12} />} label="Résidence">{nationalityLabel}</RecapLine>
          <RecapLine icon={<Heart size={12} />} label="Situation">{civilLabel}{form.num_children > 0 && ` · ${form.num_children} enfant${form.num_children > 1 ? 's' : ''}`}</RecapLine>
          {isPrivate && (
            <>
              <RecapLine icon={<GraduationCap size={12} />} label="Activité">{employmentLabel}</RecapLine>
              {form.employer_name && <RecapLine icon={<Building2 size={12} />} label="Employeur">{form.employer_name}</RecapLine>}
              <RecapLine icon={<Shield size={12} />} label="Prévoyance">
                {form.has_3a ? '3A ✓' : '3A ✗'} · {form.has_lpp ? 'LPP ✓' : 'LPP ✗'} · Franchise CHF {form.lamal_franchise}
              </RecapLine>
            </>
          )}
          {!isPrivate && (
            <>
              <RecapLine icon={<Briefcase size={12} />} label="Secteur">{form.business_sector}</RecapLine>
              {form.company_name && <RecapLine icon={<Building2 size={12} />} label="Entreprise">{form.company_name}</RecapLine>}
              <RecapLine icon={<Receipt size={12} />} label="TVA">{form.tva_registered ? `Assujetti·e (${form.tva_method || 'TDFN'})` : 'Non assujetti·e'}</RecapLine>
            </>
          )}
        </div>
      </div>

      <div className={`p-4 rounded-2xl ${theme.dk ? 'bg-zinc-800/50' : 'bg-stone-100'}`}>
        <p className={`text-xs ${theme.tx} font-bold mb-1`}>🎁 Prochaine étape</p>
        <p className={`text-xs ${theme.mt} leading-relaxed`}>
          Vous démarrez gratuitement avec accès à toutes les bases. Vous pourrez passer à Premium quand vous voulez débloquer le coach IA illimité, les leçons avancées et le scanner de factures.
        </p>
      </div>
    </>
  );
}

function RecapLine({ icon, label, children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-stone-400">{icon}</span>
      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider w-20 flex-shrink-0">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
