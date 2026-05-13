import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export function Setup({ theme, expenses, setExpenses }) {
  const addExpense = () => {
    setExpenses([
      ...expenses,
      { id: Date.now().toString(), label: 'Nouveau', amount: 0, category: 'Autre', icon: 'Receipt' },
    ]);
  };

  const updateField = (id, field, value) => {
    setExpenses(expenses.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-lg">Charges Fixes</h3>
        <button onClick={addExpense} className={`p-2 rounded-xl text-white bg-${theme.accent}-600`}>
          <Plus size={16} />
        </button>
      </div>
      {expenses.map((e) => (
        <div key={e.id} className={`p-3 rounded-2xl border flex items-center gap-3 ${theme.cd} ${theme.bd}`}>
          <div className="flex-1 space-y-1.5">
            <input
              type="text"
              value={e.label}
              onChange={(v) => updateField(e.id, 'label', v.target.value)}
              className={`w-full text-xs font-bold bg-transparent outline-none border-b pb-0.5 ${theme.dk ? 'border-zinc-800' : 'border-stone-200'}`}
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={e.amount || ''}
                onChange={(v) => updateField(e.id, 'amount', parseFloat(v.target.value) || 0)}
                className={`w-20 px-2 py-1 rounded-lg text-xs font-black ${theme.sf}`}
              />
              <span className="text-[9px] text-stone-500">CHF</span>
            </div>
          </div>
          <button onClick={() => removeExpense(e.id)} className="p-1.5 text-stone-400 hover:text-rose-500">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
