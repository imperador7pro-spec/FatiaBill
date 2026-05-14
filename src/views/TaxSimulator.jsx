import React, { useState, useMemo } from 'react';
import { MapPin, TrendingDown, TrendingUp, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { CANTONS, CIVIL_STATUS_OPTIONS } from '../data.js';
import { rankCantons } from '../cantonTax.js';

function fmtCHF(n) {
  return new Intl.NumberFormat('fr-CH', { maximumFractionDigits: 0 }).format(n || 0);
}

const cantonName = (code) => CANTONS.find((c) => c.code === code)?.name || code;

export function TaxSimulator({ theme, profile, mode }) {
  const [income, setIncome] = useState(profile?.salary ? Math.round(profile.salary * 12) : 100000);
  const [civilStatus, setCivilStatus] = useState(profile?.civil_status || 'single');
  const [numChildren, setNumChildren] = useState(profile?.num_children ?? 0);
  const [currentCanton, setCurrentCanton] = useState(profile?.canton || 'VD');

  const ranked = useMemo(
    () => rankCantons({
      income: Math.max(0, Number(income) || 0),
      civil_status: civilStatus,
      num_children: Number(numChildren) || 0,
      currentCanton,
    }),
    [income, civilStatus, numChildren, currentCanton],
  );

  const current = ranked.find((r) => r.canton === currentCanton);
  const cheapest = ranked[0];
  const mostExpensive = ranked[ranked.length - 1];
  const savings = current && cheapest && current.canton !== cheapest.canton
    ? current.tax - cheapest.tax
    : 0;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="text-center mb-2">
        <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <MapPin size={26} />
        </div>
        <h3 className="font-black text-lg">Simulateur fiscal 26 cantons</h3>
        <p className={`text-[11px] ${theme.mt}`}>Combien paieriez-vous d'impôts ailleurs ?</p>
      </div>

      <div className={`p-4 rounded-2xl border ${theme.cd} ${theme.bd} space-y-3`}>
        <h4 className={`text-[10px] font-black uppercase tracking-wider ${theme.mt}`}>Votre situation</h4>
        <div className="grid grid-cols-2 gap-3">
          <Field theme={theme} label="Revenu brut annuel CHF">
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className={`w-full border rounded-lg px-2.5 py-2 text-sm font-bold outline-none ${theme.inp} focus:border-rose-500`}
            />
          </Field>
          <Field theme={theme} label="Situation familiale">
            <select
              value={civilStatus}
              onChange={(e) => setCivilStatus(e.target.value)}
              className={`w-full border rounded-lg px-2.5 py-2 text-xs font-bold outline-none ${theme.inp} focus:border-rose-500`}
            >
              {CIVIL_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field theme={theme} label="Enfants à charge">
            <select
              value={numChildren}
              onChange={(e) => setNumChildren(parseInt(e.target.value, 10))}
              className={`w-full border rounded-lg px-2.5 py-2 text-xs font-bold outline-none ${theme.inp} focus:border-rose-500`}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n === 6 ? '6+' : n}</option>)}
            </select>
          </Field>
          <Field theme={theme} label="Canton actuel">
            <select
              value={currentCanton}
              onChange={(e) => setCurrentCanton(e.target.value)}
              className={`w-full border rounded-lg px-2.5 py-2 text-xs font-bold outline-none ${theme.inp} focus:border-rose-500`}
            >
              {CANTONS.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {current && cheapest && current.canton !== cheapest.canton && (
        <div className={`p-5 rounded-2xl border-2 border-emerald-500 ${theme.dk ? 'bg-emerald-950/30' : 'bg-emerald-50'} space-y-3`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl text-white flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-black uppercase tracking-wider ${theme.dk ? 'text-emerald-300' : 'text-emerald-700'}`}>Économie maximum possible</p>
              <p className={`text-3xl font-black ${theme.tx} mt-0.5 tabular-nums`}>
                {fmtCHF(savings)} <span className="text-base text-stone-500">CHF/an</span>
              </p>
              <p className={`text-xs ${theme.mt} mt-1`}>
                en déménageant de <strong>{cantonName(currentCanton)}</strong> à <strong>{cantonName(cheapest.canton)}</strong>
              </p>
              <p className={`text-[10px] ${theme.mt} mt-2 italic`}>
                Soit {fmtCHF(savings * 10)} CHF sur 10 ans. Bien sûr, à pondérer avec loyer/coût de vie/famille/travail.
              </p>
            </div>
          </div>
        </div>
      )}

      {current && (
        <div className={`p-4 rounded-2xl border ${theme.cd} ${theme.bd} space-y-2`}>
          <div className="flex justify-between items-baseline">
            <span className={`text-[10px] font-black uppercase tracking-wider ${theme.mt}`}>
              Votre estimation à {cantonName(currentCanton)}
            </span>
            <span className={`text-[10px] font-bold ${theme.mt}`}>Rang {current.rank}/26</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className={`text-3xl font-black ${theme.tx} tabular-nums`}>{fmtCHF(current.tax)}</span>
            <span className={`text-sm font-bold ${theme.mt}`}>CHF d'impôts/an</span>
            <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-lg ${
              theme.dk ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-700'
            }`}>{(current.rate * 100).toFixed(1)}%</span>
          </div>
          <p className={`text-[10px] ${theme.mt}`}>
            Soit {fmtCHF(income - current.tax)} CHF net après impôts (avant LAMal, LPP, charges courantes)
          </p>
        </div>
      )}

      <div className={`rounded-2xl border ${theme.cd} ${theme.bd} overflow-hidden`}>
        <div className={`p-3 border-b ${theme.bd} flex items-center justify-between`}>
          <h4 className="font-black text-xs uppercase">Classement complet</h4>
          <span className={`text-[9px] ${theme.mt}`}>Trié du moins cher au plus cher</span>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {ranked.map((r) => {
            const isCurrent = r.canton === currentCanton;
            const isWin = r.gap_vs_current > 0;
            const isLose = r.gap_vs_current < 0;
            return (
              <div
                key={r.canton}
                className={`px-3 py-2.5 flex items-center gap-3 border-b last:border-b-0 ${theme.bd} ${isCurrent ? (theme.dk ? 'bg-rose-950/30' : 'bg-rose-50') : ''}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                  r.rank === 1 ? 'bg-emerald-500 text-white'
                    : r.rank <= 5 ? 'bg-emerald-500/20 text-emerald-600'
                    : r.rank === 26 ? 'bg-rose-500 text-white'
                    : r.rank >= 22 ? 'bg-rose-500/20 text-rose-600'
                    : (theme.dk ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-100 text-stone-500')
                }`}>
                  {r.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-black text-xs ${theme.tx} flex items-center gap-1.5`}>
                    {r.canton} <span className={`font-medium ${theme.mt}`}>· {cantonName(r.canton)}</span>
                    {isCurrent && <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-rose-500 text-white">Vous</span>}
                  </p>
                  <p className={`text-[10px] ${theme.mt}`}>{(r.rate * 100).toFixed(1)}% effectif</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-black text-xs tabular-nums ${theme.tx}`}>{fmtCHF(r.tax)} CHF</p>
                  {!isCurrent && current && r.gap_vs_current !== 0 && (
                    <p className={`text-[10px] font-bold tabular-nums flex items-center justify-end gap-0.5 ${
                      isWin ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {isWin ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                      {isWin ? '-' : '+'}{fmtCHF(Math.abs(r.gap_vs_current))}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`p-3 rounded-xl flex items-start gap-2 ${theme.dk ? 'bg-amber-950/30 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'}`}>
        <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className={`text-[10px] ${theme.tx} leading-relaxed`}>
          <strong>Estimation à ±15%.</strong> Les chiffres incluent IFD + impôt cantonal + communal (chef-lieu).
          Selon la commune exacte, les primes LAMal, les loyers et votre situation pro, l'écart réel peut varier.
          Pour une décision de déménagement: simuler aussi loyer + LAMal + trajet pendulaire + un audit fiduciaire (300-500 CHF).
        </p>
      </div>

      {current && cheapest && current.canton !== cheapest.canton && (
        <div className={`p-3 rounded-xl ${theme.dk ? 'bg-zinc-800/50' : 'bg-stone-100'} flex items-center gap-2`}>
          <ArrowRight size={14} className="text-rose-500" />
          <p className={`text-[10px] ${theme.tx}`}>
            <strong>Conseil suivant</strong> — Avant tout déménagement: avez-vous maximisé vos déductions actuelles ?
            3A, rachats LPP, frais de transport pro, formation continue. Demandez à votre coach IA: <em>"Quelles déductions je peux activer à {cantonName(currentCanton)} ?"</em>
          </p>
        </div>
      )}
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
