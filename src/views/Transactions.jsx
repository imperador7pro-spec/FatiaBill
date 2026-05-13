import React from 'react';
import { Plus, Receipt, TrendingUp, CheckCircle2, Clock, Trash2 } from 'lucide-react';

const FILTERS = [
  { k: 'ALL', l: 'Tout' },
  { k: 'IN', l: 'Recettes' },
  { k: 'OUT', l: 'Dépenses' },
  { k: 'PENDING', l: 'Attente' },
];

export function Transactions({ theme, transactions, filter, onChangeFilter, onAddTx, onToggleStatus, onDeleteTx }) {
  const filtered = transactions.filter((t) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return t.status === 'PENDING';
    return t.type === filter;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-lg">Journal</h3>
        <button onClick={onAddTx} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2">
          <Plus size={16} />Pièce
        </button>
      </div>
      <div className={`flex gap-1 p-1 rounded-xl ${theme.cd} border ${theme.bd}`}>
        {FILTERS.map((f) => (
          <button
            key={f.k}
            onClick={() => onChangeFilter(f.k)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold ${filter === f.k ? 'bg-stone-800 text-white' : `text-stone-500 ${theme.hv}`}`}
          >
            {f.l}
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className={`p-8 text-center rounded-2xl border border-dashed ${theme.bd} ${theme.mt}`}>
          <Receipt size={28} className="mx-auto mb-2 opacity-20" />
          <p className="font-bold text-xs">Vide</p>
        </div>
      )}
      {filtered.map((t) => (
        <div
          key={t.id}
          className={`p-3 flex items-center justify-between rounded-2xl border ${
            t.status === 'PENDING'
              ? (theme.dk ? 'bg-amber-950/20 border-amber-900' : 'bg-amber-50/50 border-amber-200')
              : `${theme.cd} ${theme.bd}`
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.type === 'IN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {t.type === 'IN' ? <TrendingUp size={16} /> : <Receipt size={16} />}
            </div>
            <div>
              <p className="font-bold text-xs">{t.label}</p>
              <p className={`text-[8px] ${theme.mt}`}>{t.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className={`font-black tabular-nums ${t.type === 'IN' ? 'text-emerald-500' : ''}`}>
              {t.type === 'IN' ? '+' : '-'}{parseFloat(t.amount).toFixed(0)}
            </p>
            <div className="flex gap-1">
              <button onClick={() => onToggleStatus(t.id)} className={`p-1 rounded-lg ${theme.sf}`}>
                {t.status === 'PAID' ? <Clock size={13} /> : <CheckCircle2 size={13} />}
              </button>
              <button onClick={() => onDeleteTx(t.id)} className="p-1 text-stone-400 hover:text-rose-500">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
