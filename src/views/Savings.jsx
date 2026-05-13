import React, { useState } from 'react';
import {
  Target, Plus, Wallet, Edit3, Trash2, ChevronDown, BarChart3, Sparkles, Check, AlertCircle,
  ArrowUpRight, Star, TrendingUp,
} from 'lucide-react';
import { getIcon } from '../data.js';

export function Savings({ theme, goals, monthlyCapacity, salary, computeProjection, onOpenSalary, onAddGoal, onEditGoal, onDeleteGoal }) {
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
        <div className={`p-10 text-center rounded-3xl border border-dashed ${theme.bd} ${theme.mt}`}>
          <Target size={36} className="mx-auto mb-2 opacity-20" />
          <p className="font-bold text-sm mb-4">Créez votre premier objectif</p>
          <button onClick={() => onAddGoal()} className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm">Créer</button>
        </div>
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
