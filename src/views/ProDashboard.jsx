import React from 'react';
import { Lock } from 'lucide-react';

export function ProDashboard({ theme, finance }) {
  const { paidRevenue, expectedRevenue, remaining, vat, avs, tax } = finance;
  const provisions = [
    { l: 'TVA 8.1%', v: vat, c: 'rose' },
    { l: 'AVS 10%', v: avs, c: 'indigo' },
    { l: 'Impôts 15%', v: tax, c: 'amber' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <section className={`rounded-3xl p-6 relative overflow-hidden shadow-2xl ${theme.dk ? 'bg-zinc-900 border border-zinc-800' : 'bg-indigo-950 text-white'}`}>
          <div className="relative z-10 space-y-4">
            <div className={`p-3 rounded-2xl flex justify-between items-center border ${theme.dk ? 'bg-black/30 border-white/5' : 'bg-white/10 border-white/10'}`}>
              <div>
                <p className="text-[8px] font-black uppercase text-indigo-400">CA Encaissé</p>
                <span className="text-lg font-black">{paidRevenue.toFixed(0)} CHF</span>
              </div>
              {expectedRevenue > 0 && (
                <div className="text-right">
                  <p className="text-[7px] font-black text-stone-500">Débiteurs</p>
                  <span className="text-xs font-bold text-stone-300">+{expectedRevenue.toFixed(0)}</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-emerald-400">Trésorerie</p>
              <h2 className="text-4xl font-black tabular-nums tracking-tighter">{remaining.toFixed(0)}.-</h2>
            </div>
          </div>
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-indigo-500 blur-[80px] opacity-15 pointer-events-none" />
        </section>
        <div className={`p-5 rounded-3xl border ${theme.cd} ${theme.bd}`}>
          <h3 className="text-[10px] font-black uppercase mb-3 flex items-center gap-2">
            <Lock size={13} />Provisions
          </h3>
          {provisions.map((x, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between text-[10px] font-bold mb-0.5">
                <span className="text-stone-500">{x.l}</span>
                <span className={`text-${x.c}-500`}>{x.v.toFixed(0)}</span>
              </div>
              <div className={`w-full h-1.5 rounded-full ${theme.sf}`}>
                <div className={`h-full bg-${x.c}-500 rounded-full`} style={{ width: paidRevenue > 0 ? '100%' : '0%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
