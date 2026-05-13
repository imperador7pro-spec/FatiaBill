import React from 'react';
import { Edit3, CheckCircle2 } from 'lucide-react';
import { getIcon } from '../data.js';

export function PrivateDashboard({ theme, salary, salarySource, freeMoney, expenses, checkedIds, onOpenSalary, onToggleCheck }) {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <section className={`rounded-3xl p-6 relative overflow-hidden shadow-2xl ${theme.dk ? 'bg-zinc-900 border border-zinc-800' : 'bg-stone-900 text-white'}`}>
        <div className="relative z-10 space-y-4">
          <div
            onClick={onOpenSalary}
            className={`p-3 rounded-2xl flex justify-between items-center cursor-pointer border ${theme.dk ? 'bg-black/30 border-white/5' : 'bg-white/10 border-white/10'}`}
          >
            <div>
              <p className="text-[8px] font-black uppercase text-stone-400">{salarySource}</p>
              <span className="text-lg font-black">
                {salary.toFixed(0)} <span className="text-xs text-stone-400">CHF</span>
              </span>
            </div>
            <Edit3 size={14} className="text-stone-500" />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase text-emerald-400 mb-1">Argent de liberté</p>
            <div className="flex items-baseline gap-1">
              <h2 className="text-5xl font-black tabular-nums tracking-tighter">{freeMoney.toFixed(0)}</h2>
              <span className="text-lg font-bold opacity-40">.-</span>
            </div>
            <p className="text-[9px] text-stone-400">Après charges + 20% épargne</p>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-emerald-500 blur-[80px] opacity-15 pointer-events-none" />
      </section>
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-sm">Factures du mois</h3>
          <span className={`text-xs font-bold ${theme.mt}`}>{checkedIds.length}/{expenses.length}</span>
        </div>
        {expenses.map((e) => {
          const on = checkedIds.includes(e.id);
          const Ic = getIcon(e.icon);
          return (
            <div
              key={e.id}
              onClick={() => onToggleCheck(e.id)}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between ${
                on
                  ? (theme.dk ? 'border-emerald-500 bg-emerald-900/20' : 'border-stone-900 bg-white shadow-lg')
                  : (theme.dk ? 'border-zinc-800 bg-zinc-900/50' : 'border-transparent bg-white shadow-sm')
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${on ? 'bg-emerald-600 text-white' : (theme.dk ? 'bg-zinc-800 text-zinc-500' : 'bg-stone-100 text-stone-400')}`}>
                  {on ? <CheckCircle2 size={18} /> : <Ic size={18} />}
                </div>
                <div>
                  <p className={`font-bold text-sm ${on ? '' : theme.mt}`}>{e.label}</p>
                  <p className="text-[8px] font-bold text-stone-500 uppercase">{e.category}</p>
                </div>
              </div>
              <p className={`font-black text-sm tabular-nums ${on ? '' : 'text-stone-400'}`}>{e.amount.toFixed(0)}.-</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
