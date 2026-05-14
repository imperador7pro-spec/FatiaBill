import React, { useState } from 'react';
import {
  X, Target, CheckCircle2, Clock, HelpCircle, Check, Award, Crown,
  Sparkles, AlertCircle,
} from 'lucide-react';
import { GOAL_PRESETS, EXPENSE_CATEGORIES, getIcon } from './data.js';
import { PLAN_FEATURES } from './plan.js';

export function ModalShell({ theme, modal, onClose, children }) {
  if (!modal) return null;
  const wide = modal === 'upgrade';
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={() => {
        if (modal !== 'lesson') onClose();
      }}
    >
      <div
        className={`w-full ${wide ? 'max-w-lg' : 'max-w-md'} max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl rounded-t-3xl shadow-2xl ${theme.cd} border ${theme.bd}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function SalaryModal({ theme, initial, onClose, onSave }) {
  const [source, setSource] = useState(initial.source);
  const [amount, setAmount] = useState(initial.amount > 0 ? initial.amount.toString() : '');

  return (
    <>
      <div className="bg-stone-950 text-white p-4 flex justify-between items-center">
        <h2 className="text-base font-black">Salaire</h2>
        <button onClick={onClose} className="bg-white/10 p-1.5 rounded-full"><X size={16} /></button>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="text-[8px] font-black uppercase text-stone-400">Source</label>
          <input
            type="text" value={source} onChange={(e) => setSource(e.target.value)}
            className={`w-full border rounded-xl p-3 font-bold outline-none mt-1 ${theme.inp}`}
          />
        </div>
        <div>
          <label className="text-[8px] font-black uppercase text-stone-400">Brut CHF</label>
          <input
            type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            className={`w-full border rounded-xl p-3 text-xl font-black outline-none mt-1 ${theme.inp}`}
          />
        </div>
        <button
          onClick={() => onSave({ amount: parseFloat(amount) || 0, source: source || 'Revenu' })}
          className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl"
        >
          Valider
        </button>
      </div>
    </>
  );
}

export function TransactionModal({ theme, onClose, onSave }) {
  const [form, setForm] = useState({
    type: 'IN', amount: '', label: '', status: 'PENDING', cat: EXPENSE_CATEGORIES[0],
  });

  return (
    <>
      <div className={`p-4 flex justify-between items-center border-b ${theme.bd}`}>
        <h2 className="text-base font-black">Pièce</h2>
        <button onClick={onClose} className={`p-1.5 rounded-full ${theme.sf}`}><X size={16} /></button>
      </div>
      <div className="p-4 space-y-3">
        <div className={`flex gap-2 p-1 rounded-xl ${theme.sf}`}>
          <button
            onClick={() => setForm({ ...form, type: 'IN' })}
            className={`flex-1 py-2 font-bold text-xs rounded-lg ${form.type === 'IN' ? 'bg-emerald-500 text-white' : 'text-stone-500'}`}
          >
            +Recette
          </button>
          <button
            onClick={() => setForm({ ...form, type: 'OUT' })}
            className={`flex-1 py-2 font-bold text-xs rounded-lg ${form.type === 'OUT' ? 'bg-rose-500 text-white' : 'text-stone-500'}`}
          >
            -Dépense
          </button>
        </div>
        <div>
          <label className="text-[8px] font-black uppercase text-stone-400">CHF</label>
          <input
            type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className={`w-full border rounded-xl p-3 text-xl font-black outline-none mt-1 ${theme.inp}`}
          />
        </div>
        <div>
          <label className="text-[8px] font-black uppercase text-stone-400">Libellé</label>
          <input
            type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
            className={`w-full border rounded-xl p-3 font-bold outline-none mt-1 ${theme.inp}`}
          />
        </div>
        {form.type === 'OUT' && (
          <div>
            <label className="text-[8px] font-black uppercase text-stone-400">Catégorie</label>
            <select
              value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}
              className={`w-full border rounded-xl p-3 font-bold outline-none mt-1 ${theme.inp}`}
            >
              {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}
        <div className={`flex gap-2 ${theme.sf} p-1 rounded-xl`}>
          <button
            onClick={() => setForm({ ...form, status: 'PAID' })}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${form.status === 'PAID' ? 'bg-emerald-500 text-white' : 'text-stone-500'}`}
          >
            <CheckCircle2 size={14} />Payé
          </button>
          <button
            onClick={() => setForm({ ...form, status: 'PENDING' })}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${form.status === 'PENDING' ? 'bg-amber-500 text-white' : 'text-stone-500'}`}
          >
            <Clock size={14} />Attente
          </button>
        </div>
        <button
          onClick={() => {
            if (!form.amount || !form.label) return;
            onSave({ ...form, amount: parseFloat(form.amount) });
          }}
          className={`w-full py-3 text-white font-black rounded-xl ${form.type === 'IN' ? 'bg-emerald-600' : 'bg-rose-600'}`}
        >
          Ajouter
        </button>
      </div>
    </>
  );
}

export function GoalModal({ theme, initial, defaultMonthly, onClose, onSave }) {
  const [form, setForm] = useState(initial || { l: '', t: '', s: 0, m: '', cl: '' });

  const submit = () => {
    if (!form.l || !form.t) return;
    onSave(form);
  };

  return (
    <>
      <div className="bg-emerald-700 text-white p-4 flex justify-between items-center">
        <h2 className="text-base font-black flex items-center gap-2">
          <Target size={18} />Objectif
        </h2>
        <button onClick={onClose} className="bg-white/10 p-1.5 rounded-full"><X size={16} /></button>
      </div>
      <div className="p-4 space-y-3 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {GOAL_PRESETS.map((p) => {
            const Pi = getIcon(p.i);
            const selected = form.l === p.l;
            return (
              <button
                key={p.l}
                onClick={() => setForm({ ...form, l: p.l, t: form.t || p.a.toString() })}
                className={`p-2.5 rounded-xl border-2 text-left ${selected ? 'border-emerald-500 bg-emerald-50' : theme.bd}`}
              >
                <Pi size={14} className={selected ? 'text-emerald-500' : 'text-stone-400'} />
                <p className="text-[10px] font-bold mt-1">{p.l}</p>
              </button>
            );
          })}
        </div>
        {form.l === 'Objectif libre' && (
          <input
            type="text" value={form.cl} onChange={(e) => setForm({ ...form, cl: e.target.value })}
            placeholder="Nom"
            className={`w-full border rounded-xl p-3 font-bold outline-none ${theme.inp}`}
          />
        )}
        <div>
          <label className="text-[8px] font-black uppercase text-stone-400">Cible CHF</label>
          <input
            type="number" value={form.t} onChange={(e) => setForm({ ...form, t: e.target.value })}
            className={`w-full border rounded-xl p-3 text-lg font-black outline-none mt-1 ${theme.inp}`}
          />
        </div>
        <div>
          <label className="text-[8px] font-black uppercase text-stone-400">Déjà épargné</label>
          <input
            type="number" value={form.s || ''} onChange={(e) => setForm({ ...form, s: e.target.value })}
            className={`w-full border rounded-xl p-3 font-bold outline-none mt-1 ${theme.inp}`}
          />
        </div>
        <div>
          <label className="text-[8px] font-black uppercase text-stone-400">Épargne/mois (vide = auto)</label>
          <input
            type="number" value={form.m} onChange={(e) => setForm({ ...form, m: e.target.value })}
            placeholder={defaultMonthly.toFixed(0)}
            className={`w-full border rounded-xl p-3 font-bold outline-none mt-1 ${theme.inp}`}
          />
        </div>
        <button onClick={submit} disabled={!form.l || !form.t} className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl disabled:opacity-40">
          Enregistrer
        </button>
      </div>
    </>
  );
}

export function LessonModal({ theme, lesson, onClose, onComplete, onQuizCorrect }) {
  const [answer, setAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <div className={`p-4 flex justify-between items-center border-b ${theme.bd}`}>
        <h2 className="text-sm font-black pr-4">{lesson.title}</h2>
        <button onClick={onClose} className={`p-1.5 rounded-full shrink-0 ${theme.sf}`}><X size={16} /></button>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        <p className={`text-xs leading-relaxed whitespace-pre-line ${theme.mt}`}>{lesson.content}</p>
        {lesson.quiz && (
          <div className={`p-3 rounded-xl border-2 ${
            submitted
              ? (answer === lesson.quiz.c ? 'border-emerald-500 bg-emerald-50' : 'border-rose-500 bg-rose-50')
              : `border-dashed ${theme.bd}`
          }`}>
            <p className="font-black text-xs mb-2 flex items-center gap-2">
              <HelpCircle size={14} className="text-amber-500" />Quiz
            </p>
            <p className={`text-xs font-medium mb-2 ${theme.tx}`}>{lesson.quiz.q}</p>
            {lesson.quiz.o.map((o, oi) => (
              <button
                key={oi} disabled={submitted}
                onClick={() => {
                  setAnswer(oi);
                  setSubmitted(true);
                  if (oi === lesson.quiz.c) onQuizCorrect();
                }}
                className={`w-full p-2.5 rounded-lg text-left text-xs mb-1.5 border ${
                  submitted
                    ? (oi === lesson.quiz.c
                        ? 'border-emerald-500 bg-emerald-100 font-bold'
                        : oi === answer ? 'border-rose-500 bg-rose-100' : theme.bd)
                    : `${theme.bd} ${theme.hv} cursor-pointer`
                }`}
              >
                {o}{submitted && oi === lesson.quiz.c && <Check size={12} className="inline ml-1 text-emerald-500" />}
              </button>
            ))}
            {submitted && (
              <p className={`text-[10px] font-bold mt-1 ${answer === lesson.quiz.c ? 'text-emerald-600' : 'text-rose-600'}`}>
                {answer === lesson.quiz.c ? '+10 XP ✓' : 'Relisez la leçon!'}
              </p>
            )}
          </div>
        )}
      </div>
      <div className={`p-3 border-t ${theme.bd}`}>
        <button onClick={onComplete} className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl flex items-center justify-center gap-2">
          <Award size={16} />Terminée (+25 XP)
        </button>
      </div>
    </>
  );
}

export function UpgradeModal({ theme, mode, effPlan, trialLeft, onClose, onUpgrade }) {
  const isPro = mode === 'pro';
  const price = isPro ? '29.-' : '9.-';
  const planLabel = isPro ? 'Pro' : 'Privé';
  const isTrial = effPlan === 'trial';

  const renderCell = (value) => {
    if (value === true || value === 'pro') return <Check size={14} className="text-emerald-500 mx-auto" strokeWidth={3} />;
    if (value === false) return <X size={14} className="text-stone-300 mx-auto" />;
    return <span className="text-[10px] font-bold text-stone-700">{value}</span>;
  };

  const renderFreeCell = (value) => {
    if (value === true) return <Check size={14} className="text-stone-400 mx-auto" />;
    if (value === false) return <X size={14} className="text-stone-300 mx-auto" />;
    if (value === 'pro') return <X size={14} className="text-stone-300 mx-auto" />;
    return <span className="text-[10px] font-bold text-stone-500">{value}</span>;
  };

  return (
    <>
      <div className={`relative p-5 text-white ${isPro ? 'bg-gradient-to-br from-indigo-600 to-purple-700' : 'bg-gradient-to-br from-emerald-600 to-teal-700'}`}>
        <button onClick={onClose} className="absolute top-3 right-3 bg-white/15 p-1.5 rounded-full hover:bg-white/25 transition-colors">
          <X size={14} />
        </button>
        <Crown size={26} className="mb-2" />
        <h2 className="text-xl font-black tracking-tight">FatiaBill Premium {planLabel}</h2>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-3xl font-black">{price}</span>
          <span className="text-sm opacity-80">CHF / mois</span>
        </div>
        {isTrial && trialLeft > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 text-[10px] font-bold">
            <Sparkles size={12} />
            Essai en cours · {trialLeft} jour{trialLeft > 1 ? 's' : ''} restant{trialLeft > 1 ? 's' : ''}
          </div>
        )}
        {effPlan === 'free' && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 text-[10px] font-bold">
            <AlertCircle size={12} />
            Essai terminé — Premium pour tout débloquer
          </div>
        )}
      </div>

      <div className="overflow-y-auto flex-1">
        <table className="w-full text-xs">
          <thead className={`sticky top-0 ${theme.dk ? 'bg-zinc-900' : 'bg-white'} border-b ${theme.bd}`}>
            <tr>
              <th className="text-left p-3 font-black text-[10px] uppercase text-stone-400 tracking-wider">Ce que vous obtenez</th>
              <th className="p-3 font-black text-[10px] uppercase text-stone-400 tracking-wider w-16">Gratuit</th>
              <th className={`p-3 font-black text-[10px] uppercase tracking-wider w-20 ${isPro ? 'text-indigo-500' : 'text-emerald-500'}`}>
                {planLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {PLAN_FEATURES.map((section) => {
              const showSection = !section.section.startsWith('Pro') || isPro;
              if (!showSection) return null;
              return (
                <React.Fragment key={section.section}>
                  <tr className={theme.dk ? 'bg-zinc-800/40' : 'bg-stone-50'}>
                    <td colSpan={3} className={`p-2 px-3 text-[10px] font-black uppercase tracking-wider ${isPro ? 'text-indigo-500' : 'text-emerald-600'}`}>
                      {section.section}
                    </td>
                  </tr>
                  {section.rows.map((row, ri) => (
                    <tr key={ri} className={`border-b ${theme.bd}`}>
                      <td className={`p-2.5 px-3 ${theme.tx} text-[11px]`}>{row.label}</td>
                      <td className="p-2.5 text-center">{renderFreeCell(row.free)}</td>
                      <td className="p-2.5 text-center">{renderCell(isPro ? row.premium : (row.premium === 'pro' ? false : row.premium))}</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={`p-4 border-t ${theme.bd} space-y-2`}>
        <button
          onClick={() => { onUpgrade(); onClose(); }}
          className={`w-full py-3.5 text-white font-black rounded-2xl text-sm shadow-lg transition-transform hover:scale-[1.02] ${isPro ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-emerald-600 to-teal-600'}`}
        >
          Activer Premium {planLabel} · {price} CHF/mois
        </button>
        <p className={`text-[10px] text-center ${theme.mt}`}>
          Annulable à tout moment · Pas d'engagement · Paiement sécurisé Stripe
        </p>
      </div>
    </>
  );
}
