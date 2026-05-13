import React from 'react';
import { FileText } from 'lucide-react';

export function TaxReport({ theme, companyName, expenses, finance }) {
  const { profitAndLoss } = finance;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-lg">Dossier Fiscal</h3>
        <button
          onClick={() => window.print()}
          className={`px-4 py-2 rounded-xl font-bold text-sm ${theme.dk ? 'bg-zinc-100 text-zinc-900' : 'bg-stone-900 text-white'}`}
        >
          <FileText size={15} className="inline mr-1" />PDF
        </button>
      </div>
      <div className={`p-6 rounded-3xl border ${theme.cd} ${theme.bd}`}>
        <div className="flex justify-between border-b-2 border-stone-800 pb-4 mb-4">
          <h1 className="text-xl font-black uppercase tracking-tighter">Compte de Résultat</h1>
          <div className="text-right">
            <h2 className="font-black text-sm">{companyName}</h2>
            <p className="text-[9px] text-stone-500">{new Date().toLocaleDateString('fr-CH')}</p>
          </div>
        </div>
        <div className="space-y-4 text-xs">
          <div>
            <h4 className="text-[10px] font-bold uppercase text-stone-400 mb-1 border-b border-stone-200 pb-1">Produits</h4>
            <div className="flex justify-between py-1">
              <span>CA facturé</span>
              <span className="font-bold tabular-nums">{profitAndLoss.revenue.toFixed(2)}</span>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase text-stone-400 mb-1 border-b border-stone-200 pb-1">Charges</h4>
            {expenses.map((e) => (
              <div key={e.id} className="flex justify-between py-0.5">
                <span>{e.label}</span>
                <span>-{e.amount.toFixed(2)}</span>
              </div>
            ))}
            {Object.entries(profitAndLoss.expenseByCategory).map(([c, a]) => (
              <div key={c} className="flex justify-between py-0.5">
                <span>{c}</span>
                <span>-{a.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t-4 border-stone-900">
            <div className="flex justify-between">
              <span className="text-sm font-black uppercase">Résultat</span>
              <span className="font-black text-lg tabular-nums">{profitAndLoss.ebit.toFixed(2)} CHF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
