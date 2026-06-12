import React, { useState } from 'react';
import {
  Target, Plus, Wallet, Edit3, Trash2, ChevronDown, BarChart3, Sparkles, Check, AlertCircle,
  ArrowUpRight, Star, TrendingUp, Landmark, CalendarClock,
} from 'lucide-react';
import { getIcon } from '../data.js';
import { estimateTax } from '../cantonTax.js';
import { EmptyState } from '../components/EmptyState.jsx';

export function Savings({ theme, goals, monthlyCapacity, salary, profile, computeProjection, onOpenSalary, onAddGoal, onEditGoal, onDeleteGoal }) {
  const [openIdx, setOpenIdx] = useState(null);
  const [productDetailKey, setProductDetailKey] = useState(null);

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-lg flex items-center gap-2">
          <Target className="text-emerald-500" size={20} />Épargne
        </h3>
        <button onClick={() => onAddGoal()} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center gap-2">
          <Plus size={16} />Objectif
        </button>
      </div>
      <ThreeAWidget theme={theme} profile={profile} salary={salary} />
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${theme.cd} ${theme.bd}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Wallet size={18} /></div>
          <div>
            <p className="text-[8px] font-black uppercase text-stone-500">Capacité/mois (20%)</p>
            <p className="font-black text-lg tabular-nums">{monthlyCapacity.toFixed(0)} CHF</p>
          </div>
        </div>
        {salary === 0 && (
          <button onClick={onOpenSalary} className="text-xs font-bold text-emerald-600 underline">Salaire</button>
        )}
      </div>
      {goals.length === 0 ? (
        <EmptyState
          theme={theme}
          icon={Target}
          title="Créez votre 1er objectif"
          description="Achat immobilier, voyage, 3A pour économiser jusqu'à 1'500 CHF d'impôts par an, fonds d'urgence (6 mois de charges)… FatiaBill projette automatiquement la durée et les meilleurs véhicules d'épargne."
          ctaLabel="Créer un objectif"
          onCta={() => onAddGoal()}
          hint="Exemple : 3A à 7'258 CHF/an = ~ 1'450 CHF d'économie d'impôts dans la plupart des cantons"
        />
      ) : (
        goals.map((g, idx) => {
          const Ic = getIcon(g.i);
          const projection = computeProjection(g);
          const pct = g.t > 0 ? Math.min(100, (g.s / g.t) * 100) : 0;
          const open = openIdx === idx;
          return (
            <div key={g.id} className={`rounded-2xl border overflow-hidden ${theme.cd} ${theme.bd}`}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Ic size={20} /></div>
                    <div>
                      <h4 className="font-black text-sm">{g.l}</h4>
                      <p className={`text-[10px] ${theme.mt}`}>Cible: {g.t.toLocaleString('fr-CH')} CHF</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEditGoal(idx)} className={`p-1.5 rounded-lg ${theme.hv}`}>
                      <Edit3 size={13} className="text-stone-400" />
                    </button>
                    <button onClick={() => onDeleteGoal(idx)} className={`p-1.5 rounded-lg ${theme.hv}`}>
                      <Trash2 size={13} className="text-stone-400" />
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-[9px] font-bold mb-1">
                    <span>{g.s.toLocaleString('fr-CH')} CHF</span>
                    <span className={theme.mt}>{pct.toFixed(0)}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${theme.sf}`}>
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                {projection.ms > 0 && (
                  <div className={`grid grid-cols-3 gap-2 mt-2 p-2.5 rounded-xl text-center ${theme.sf}`}>
                    <div>
                      <p className="text-[7px] font-black uppercase text-stone-400">Reste</p>
                      <p className="font-black text-xs tabular-nums">{projection.r?.toLocaleString('fr-CH')}</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black uppercase text-stone-400">/mois</p>
                      <p className="font-black text-xs tabular-nums">{projection.mo?.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black uppercase text-stone-400">Sans invest.</p>
                      <p className="font-black text-xs tabular-nums">{(projection.ms / 12).toFixed(1)} ans</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setOpenIdx(open ? null : idx)}
                  className={`w-full mt-2 py-2 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 ${open ? 'bg-emerald-600 text-white' : `${theme.sf} ${theme.mt}`}`}
                >
                  <BarChart3 size={13} />{open ? 'Masquer' : 'Stratégies'}
                  <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {open && projection.ms > 0 && (
                <div className={`border-t ${theme.bd} p-4 space-y-3`}>
                  <p className="flex items-center gap-2 font-black text-xs">
                    <Sparkles size={14} className="text-amber-500" />Véhicules d'investissement
                  </p>
                  {projection.ps.map((p, pi) => (
                    <div
                      key={pi}
                      className={`rounded-xl border p-3 cursor-pointer ${productDetailKey === `${idx}-${pi}` ? 'ring-1 ring-emerald-500/30' : ''} ${theme.bd} ${theme.cd}`}
                      onClick={() => setProductDetailKey(productDetailKey === `${idx}-${pi}` ? null : `${idx}-${pi}`)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <span className="font-bold text-xs">{p.n}</span>
                          <span className={`ml-2 text-[7px] font-bold px-1.5 py-0.5 rounded-full ${p.rc}`}>{p.ri}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-base tabular-nums text-emerald-500">
                            {p.yrs} <span className="text-[10px]">ans</span>
                          </p>
                          {p.saved > 0 && <p className="text-[8px] font-bold text-emerald-600">{p.saved} mois gagnés</p>}
                        </div>
                      </div>
                      {p.gains > 0 && (
                        <div className={`text-[9px] font-bold p-1.5 rounded-lg flex items-center gap-1 ${theme.dk ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                          <ArrowUpRight size={11} />+{p.gains.toFixed(0)} CHF composés
                        </div>
                      )}
                      {productDetailKey === `${idx}-${pi}` && (
                        <div className={`mt-2 pt-2 border-t ${theme.bd} space-y-2`}>
                          <p className={`text-[10px] ${theme.mt}`}>{p.d}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className={`p-2 rounded-lg ${theme.sf}`}>
                              <p className="text-[8px] font-black text-emerald-500 mb-1">+</p>
                              {p.p.map((x, i) => (
                                <div key={i} className="flex items-start gap-1 mb-0.5">
                                  <Check size={9} className="text-emerald-500 mt-0.5 shrink-0" />
                                  <span className="text-[9px]">{x}</span>
                                </div>
                              ))}
                            </div>
                            <div className={`p-2 rounded-lg ${theme.sf}`}>
                              <p className="text-[8px] font-black text-rose-500 mb-1">−</p>
                              {p.c.map((x, i) => (
                                <div key={i} className="flex items-start gap-1 mb-0.5">
                                  <AlertCircle size={9} className="text-rose-400 mt-0.5 shrink-0" />
                                  <span className="text-[9px]">{x}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className={`p-2 rounded-lg border border-dashed ${theme.dk ? 'border-amber-800 bg-amber-900/10' : 'border-amber-200 bg-amber-50'}`}>
                            <p className="text-[8px] font-black text-amber-600 flex items-center gap-1">
                              <TrendingUp size={10} />Levier
                            </p>
                            <p className={`text-[10px] ${theme.dk ? 'text-amber-200' : 'text-amber-800'}`}>{p.lv}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className={`p-3 rounded-xl border ${theme.dk ? 'border-emerald-800 bg-emerald-900/10' : 'border-emerald-200 bg-emerald-50'}`}>
                    <p className="flex items-center gap-1.5 font-black text-[10px] text-emerald-700 mb-1">
                      <Star size={13} />Conseil
                    </p>
                    <p className={`text-[10px] ${theme.dk ? 'text-emerald-200' : 'text-emerald-800'}`}>
                      {projection.ms > 24
                        ? 'Horizon long: combinez 3A Titres + ETF.'
                        : projection.ms > 12
                          ? 'Horizon 1-2 ans: 3A compte pour sécurité + fiscal.'
                          : 'Court terme: sécurité. Pas de risque marché.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// 3ème pilier 3a tracker — ceiling, year-to-date contribution, estimated tax
// saving and the 31 Dec deadline. The contributed amount is stored locally
// (per user + year) — a server column can replace localStorage later.
function ThreeAWidget({ theme, profile, salary }) {
  const YEAR = new Date().getFullYear();
  const selfEmployedNoLpp = profile?.employment_status === 'self_employed' && profile?.has_lpp === false;
  const ceiling = selfEmployedNoLpp ? 36288 : 7258;

  const lsKey = `fb_3a_${profile?.id || 'anon'}_${YEAR}`;
  const [contributed, setContributed] = useState(() => {
    try { return Math.min(ceiling, Math.max(0, Number(localStorage.getItem(lsKey)) || 0)); } catch { return 0; }
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(contributed || ''));

  const save = () => {
    const v = Math.min(ceiling, Math.max(0, Number(draft) || 0));
    setContributed(v);
    try { localStorage.setItem(lsKey, String(v)); } catch {}
    setEditing(false);
  };

  const remaining = Math.max(0, ceiling - contributed);
  const pct = Math.min(100, (contributed / ceiling) * 100);

  // Estimated tax saving = drop in tax from deducting the 3a contribution.
  const annualIncome = (salary || 0) * 12;
  const canton = profile?.canton;
  let savingRemaining;
  let isEstimate = false;
  if (annualIncome > 0 && canton) {
    const args = { civil_status: profile?.civil_status, num_children: profile?.num_children, canton };
    const taxNow = estimateTax({ income: annualIncome, ...args }).tax;
    const taxAfter = estimateTax({ income: Math.max(0, annualIncome - remaining), ...args }).tax;
    savingRemaining = Math.max(0, taxNow - taxAfter);
  } else {
    isEstimate = true;
    savingRemaining = Math.round(remaining * 0.22); // generic marginal-rate fallback
  }

  const daysLeft = Math.max(0, Math.ceil((new Date(YEAR, 11, 31) - new Date()) / 86400000));
  const done = remaining === 0;

  return (
    <div className={`rounded-2xl border overflow-hidden ${theme.cd} ${theme.bd}`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><Landmark size={18} /></div>
            <div>
              <h4 className="font-black text-sm">3ᵉ pilier 3a · {YEAR}</h4>
              <p className={`text-[10px] ${theme.mt}`}>
                Plafond {ceiling.toLocaleString('fr-CH')} CHF{selfEmployedNoLpp ? ' (indépendant·e sans LPP)' : ''}
              </p>
            </div>
          </div>
          <button onClick={() => { setDraft(String(contributed || '')); setEditing((e) => !e); }} className={`p-1.5 rounded-lg ${theme.hv}`}>
            <Edit3 size={13} className="text-stone-400" />
          </button>
        </div>

        {editing && (
          <div className={`flex items-center gap-2 mb-3 p-2 rounded-xl ${theme.sf}`}>
            <span className={`text-[10px] font-bold ${theme.mt}`}>Déjà versé en {YEAR}</span>
            <input
              type="number" inputMode="decimal" autoFocus
              value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              placeholder="0"
              className={`flex-1 min-w-0 border rounded-lg px-2 py-1.5 text-xs font-bold outline-none ${theme.inp} focus:border-amber-500`}
            />
            <button onClick={save} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase">OK</button>
          </div>
        )}

        <div className="mb-1 flex justify-between text-[10px] font-bold">
          <span>{contributed.toLocaleString('fr-CH')} CHF versés</span>
          <span className={theme.mt}>{pct.toFixed(0)}%</span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${theme.sf}`}>
          <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>

        <div className={`grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-xl text-center ${theme.sf}`}>
          <div>
            <p className="text-[7px] font-black uppercase text-stone-400">Reste à verser</p>
            <p className="font-black text-xs tabular-nums">{remaining.toLocaleString('fr-CH')}</p>
          </div>
          <div>
            <p className="text-[7px] font-black uppercase text-stone-400">Impôts à gagner</p>
            <p className="font-black text-xs tabular-nums text-emerald-500">{isEstimate ? '~' : ''}{savingRemaining.toLocaleString('fr-CH')}</p>
          </div>
          <div>
            <p className="text-[7px] font-black uppercase text-stone-400">Échéance</p>
            <p className="font-black text-xs tabular-nums">{daysLeft} j</p>
          </div>
        </div>

        <div className={`mt-3 p-2.5 rounded-xl flex items-start gap-2 ${done
          ? (theme.dk ? 'bg-emerald-900/15 text-emerald-300' : 'bg-emerald-50 text-emerald-800')
          : (theme.dk ? 'bg-amber-900/15 text-amber-200' : 'bg-amber-50 text-amber-800')}`}>
          {done ? <Check size={14} className="mt-0.5 shrink-0" /> : <CalendarClock size={14} className="mt-0.5 shrink-0" />}
          <p className="text-[10px] leading-relaxed">
            {done
              ? `Plafond ${YEAR} atteint. Versement maximisé — rien à ajouter cette année.`
              : `Versez les ${remaining.toLocaleString('fr-CH')} CHF restants avant le 31 décembre pour ${isEstimate ? 'récupérer environ' : 'récupérer'} ${savingRemaining.toLocaleString('fr-CH')} CHF d'impôts${isEstimate ? '. Renseignez salaire + canton pour le chiffre exact.' : ' cette année.'}`}
          </p>
        </div>
      </div>
    </div>
  );
}
