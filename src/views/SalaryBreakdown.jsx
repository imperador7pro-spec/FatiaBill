import React, { useState, useMemo } from 'react';
import { Coins, ArrowDown, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { CANTONS, CIVIL_STATUS_OPTIONS } from '../data.js';
import { computeFullBreakdown } from '../swissCharges.js';

function fmtCHF(n) {
  return new Intl.NumberFormat('fr-CH', { maximumFractionDigits: 0 }).format(Math.round(n || 0));
}

const cantonName = (code) => CANTONS.find((c) => c.code === code)?.name || code;

export function SalaryBreakdown({ theme, profile }) {
  const currentYear = new Date().getFullYear();
  const defaultAge = profile?.birth_year ? currentYear - profile.birth_year : 35;
  const monthlyDefault = profile?.salary || 6000;

  const [monthly, setMonthly] = useState(monthlyDefault);
  const [age, setAge] = useState(defaultAge);
  const [canton, setCanton] = useState(profile?.canton || 'VD');
  const [civilStatus, setCivilStatus] = useState(profile?.civil_status || 'single');
  const [numChildren, setNumChildren] = useState(profile?.num_children ?? 0);
  const [hasLpp, setHasLpp] = useState(profile?.has_lpp ?? true);
  const [advanced, setAdvanced] = useState(false);

  const b = useMemo(
    () => computeFullBreakdown({
      annual_brut: Math.max(0, (Number(monthly) || 0) * 12),
      age: Number(age) || 35,
      canton,
      civil_status: civilStatus,
      num_children: Number(numChildren) || 0,
      has_lpp: hasLpp,
    }),
    [monthly, age, canton, civilStatus, numChildren, hasLpp],
  );

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="text-center mb-2">
        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <Coins size={26} />
        </div>
        <h3 className="font-black text-lg">Brut → Net réel</h3>
        <p className={`text-[11px] ${theme.mt}`}>Où va chaque CHF de votre salaire</p>
      </div>

      <div className={`p-4 rounded-2xl border ${theme.cd} ${theme.bd} space-y-3`}>
        <h4 className={`text-[10px] font-black uppercase tracking-wider ${theme.mt}`}>Paramètres</h4>
        <div className="grid grid-cols-2 gap-3">
          <Field theme={theme} label="Brut mensuel CHF">
            <input
              type="number"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              className={`w-full border rounded-lg px-2.5 py-2 text-sm font-bold outline-none ${theme.inp} focus:border-emerald-500`}
            />
          </Field>
          <Field theme={theme} label="Âge">
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={16} max={80}
              className={`w-full border rounded-lg px-2.5 py-2 text-sm font-bold outline-none ${theme.inp} focus:border-emerald-500`}
            />
          </Field>
          <Field theme={theme} label="Canton">
            <select
              value={canton}
              onChange={(e) => setCanton(e.target.value)}
              className={`w-full border rounded-lg px-2.5 py-2 text-xs font-bold outline-none ${theme.inp} focus:border-emerald-500`}
            >
              {CANTONS.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
            </select>
          </Field>
          <Field theme={theme} label="Situation">
            <select
              value={civilStatus}
              onChange={(e) => setCivilStatus(e.target.value)}
              className={`w-full border rounded-lg px-2.5 py-2 text-xs font-bold outline-none ${theme.inp} focus:border-emerald-500`}
            >
              {CIVIL_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        </div>

        <button
          onClick={() => setAdvanced(!advanced)}
          className={`text-[10px] font-bold uppercase ${theme.mt} flex items-center gap-1`}
        >
          Options avancées {advanced ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>

        {advanced && (
          <div className="grid grid-cols-2 gap-3">
            <Field theme={theme} label="Enfants à charge">
              <select
                value={numChildren}
                onChange={(e) => setNumChildren(parseInt(e.target.value, 10))}
                className={`w-full border rounded-lg px-2.5 py-2 text-xs font-bold outline-none ${theme.inp}`}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n === 6 ? '6+' : n}</option>)}
              </select>
            </Field>
            <Field theme={theme} label="Cotise LPP ?">
              <select
                value={hasLpp ? 'yes' : 'no'}
                onChange={(e) => setHasLpp(e.target.value === 'yes')}
                className={`w-full border rounded-lg px-2.5 py-2 text-xs font-bold outline-none ${theme.inp}`}
              >
                <option value="yes">Oui</option>
                <option value="no">Non</option>
              </select>
            </Field>
          </div>
        )}
      </div>

      <div className={`rounded-2xl border ${theme.cd} ${theme.bd} overflow-hidden`}>
        <div className={`p-4 bg-gradient-to-br ${theme.dk ? 'from-emerald-950/40 to-zinc-900' : 'from-emerald-50 to-white'} border-b ${theme.bd}`}>
          <p className={`text-[10px] font-black uppercase tracking-wider ${theme.mt}`}>Salaire brut annuel</p>
          <p className={`text-3xl font-black ${theme.tx} tabular-nums`}>{fmtCHF(b.brut)} CHF</p>
          <p className={`text-[11px] ${theme.mt}`}>≈ {fmtCHF(b.brut / 12)} CHF/mois × 12</p>
        </div>

        <BreakdownRow theme={theme} label="AVS / AI / APG" sub="5.3% — sans plafond" amount={-b.avs} />
        <BreakdownRow theme={theme} label="AC chômage" sub="1.1% jusqu'à 148'200 · 0.5% au-dessus" amount={-b.ac} />
        <BreakdownRow theme={theme} label="LAA non-pro" sub="~1.0% accident hors travail" amount={-b.laa} />
        {b.lpp > 0 && (
          <BreakdownRow theme={theme} label="LPP 2ème pilier" sub={`Selon âge (${age} ans) · part employé`} amount={-b.lpp} />
        )}

        <SubtotalRow theme={theme} label="Net imposable" amount={b.net_imposable} />

        <BreakdownRow
          theme={theme}
          label="Impôts"
          sub={`${cantonName(canton)} · taux effectif ${(b.tax_rate * 100).toFixed(1)}%`}
          amount={-b.tax}
        />
        <BreakdownRow
          theme={theme}
          label="LAMal"
          sub={`Prime moyenne ${cantonName(canton)} · franchise 300`}
          amount={-b.lamal}
        />

        <div className={`p-4 bg-gradient-to-br ${theme.dk ? 'from-emerald-900/30 to-emerald-950/30' : 'from-emerald-50 to-emerald-100/50'} border-t ${theme.bd}`}>
          <div className="flex items-baseline justify-between">
            <div>
              <p className={`text-[10px] font-black uppercase tracking-wider ${theme.dk ? 'text-emerald-300' : 'text-emerald-700'}`}>Net en main réel</p>
              <p className={`text-3xl font-black ${theme.tx} tabular-nums mt-0.5`}>{fmtCHF(b.net_en_main)} CHF/an</p>
              <p className={`text-xs ${theme.mt} mt-0.5`}>≈ {fmtCHF(b.net_en_main_monthly)} CHF/mois</p>
            </div>
            <div className="text-right">
              <p className={`text-[10px] font-black uppercase tracking-wider ${theme.mt}`}>Take-home</p>
              <p className={`text-2xl font-black ${theme.dk ? 'text-emerald-300' : 'text-emerald-700'} tabular-nums`}>
                {(b.take_home_ratio * 100).toFixed(0)}%
              </p>
              <p className={`text-[10px] ${theme.mt}`}>du brut</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`p-3 rounded-xl flex items-start gap-2 ${theme.dk ? 'bg-amber-950/30 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'}`}>
        <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className={`text-[10px] ${theme.tx} leading-relaxed`}>
          <strong>Estimation 2025.</strong> AVS/AC/LAA: taux légaux exacts. LPP: minimum légal (votre caisse peut prélever plus).
          LAMal: moyenne cantonale franchise 300 (votre prime réelle varie ±30% selon caisse + modèle).
          Impôts: chef-lieu — votre commune peut être ±10%.
        </p>
      </div>
    </div>
  );
}

function BreakdownRow({ theme, label, sub, amount }) {
  const negative = amount < 0;
  return (
    <div className={`px-4 py-2.5 flex items-start justify-between border-t ${theme.bd}`}>
      <div className="min-w-0 flex items-start gap-2">
        <ArrowDown size={12} className="text-rose-400 mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <p className={`font-bold text-xs ${theme.tx}`}>{label}</p>
          <p className={`text-[10px] ${theme.mt}`}>{sub}</p>
        </div>
      </div>
      <p className={`font-black text-xs tabular-nums whitespace-nowrap ${negative ? 'text-rose-500' : 'text-emerald-500'}`}>
        {negative ? '−' : ''}{fmtCHF(Math.abs(amount))}
      </p>
    </div>
  );
}

function SubtotalRow({ theme, label, amount }) {
  return (
    <div className={`px-4 py-2.5 flex items-baseline justify-between ${theme.dk ? 'bg-zinc-800/50' : 'bg-stone-50'} border-t ${theme.bd}`}>
      <p className={`font-black text-[10px] uppercase tracking-wider ${theme.mt}`}>{label}</p>
      <p className={`font-black text-sm tabular-nums ${theme.tx}`}>{fmtCHF(amount)} CHF</p>
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
