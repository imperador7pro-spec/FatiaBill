import React from 'react';
import { BookOpen } from 'lucide-react';
import { ACADEMY_PRO_CARDS, getIcon } from '../data.js';

export function GuidePro({ theme }) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-3">
        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <BookOpen size={26} />
        </div>
        <h3 className="font-black text-lg">Guide Fédéral</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {ACADEMY_PRO_CARDS.map((card, i) => {
          const Ci = getIcon(card.icon);
          return (
            <div key={i} className={`p-5 rounded-2xl border ${theme.cd} ${theme.bd}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl bg-${card.color}-500/10 text-${card.color}-500`}>
                  <Ci size={22} />
                </div>
                <h4 className="font-black text-xs uppercase leading-tight">{card.title}</h4>
              </div>
              <p className={`text-[10px] leading-relaxed whitespace-pre-line ${theme.mt}`}>{card.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
