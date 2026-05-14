import React from 'react';
import { Lock, Crown, MessageCircle, Sparkles, Send, AlertCircle } from 'lucide-react';

const SUGGESTIONS_PRIVATE = [
  'Ouvrir un 3ème pilier?',
  'Optimiser impôts Vaud?',
  'ETF vs fonds actif?',
  'Épargner pour immobilier?',
];

const SUGGESTIONS_PRO = [
  'Comment structurer ma Sàrl?',
  'Optimiser ma TVA trimestrielle?',
  'Charges sociales indépendant?',
  'Stratégie pricing pour mon service?',
];

export function AICoach({ theme, mode, effPlan, aiUsed, aiLimit, messages, input, loading, onInput, onSend, onUpgrade }) {
  const limitReached = Number.isFinite(aiLimit) && aiUsed >= aiLimit;
  const remaining = Number.isFinite(aiLimit) ? Math.max(aiLimit - aiUsed, 0) : null;
  const showQuotaBadge = effPlan === 'free';

  const suggestions = mode === 'pro' ? SUGGESTIONS_PRO : SUGGESTIONS_PRIVATE;
  const accent = mode === 'pro' ? 'indigo' : 'emerald';

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="text-center mb-3">
        <div className={`w-11 h-11 rounded-full mx-auto mb-2 flex items-center justify-center text-white shadow-lg ${
          mode === 'pro' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
        }`}>
          <MessageCircle size={20} />
        </div>
        <h3 className="font-black text-lg">{mode === 'pro' ? 'Coach Business IA' : 'Coach Financier IA'}</h3>
        <p className={`text-[10px] ${theme.mt}`}>
          {mode === 'pro' ? 'TVA · AVS · Stratégie · Entreprise' : 'Fiscalité · Épargne · Investissement'}
        </p>
        {showQuotaBadge && !limitReached && (
          <div className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-lg text-[10px] font-bold ${theme.dk ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-600'}`}>
            <Sparkles size={11} /> {remaining}/{aiLimit} message{aiLimit > 1 ? 's' : ''} restant{remaining > 1 ? 's' : ''} ce mois · gratuit
          </div>
        )}
        {showQuotaBadge && limitReached && (
          <button onClick={onUpgrade} className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <Crown size={11} /> Quota gratuit épuisé · passer Premium
          </button>
        )}
      </div>
      <div className={`rounded-2xl border ${theme.cd} ${theme.bd} overflow-hidden`} style={{ minHeight: '380px' }}>
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          {messages.length === 0 && (
            <div className={`text-center py-8 ${theme.mt}`}>
              <Sparkles size={28} className="mx-auto mb-2 opacity-20" />
              <p className="font-bold text-xs mb-3">Essayez:</p>
              <div className="space-y-1.5 max-w-xs mx-auto">
                {suggestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onInput(q)}
                    className={`w-full text-left p-2 rounded-xl text-[10px] font-medium border ${theme.bd} ${theme.hv}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.r === 'u' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                m.r === 'u'
                  ? `${mode === 'pro' ? 'bg-indigo-600' : 'bg-emerald-600'} text-white rounded-br-sm`
                  : `${theme.sf} ${theme.tx} rounded-bl-sm`
              }`}>
                {m.t}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className={`p-3 rounded-2xl ${theme.sf}`}>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 bg-${accent}-500 rounded-full animate-bounce`}
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={`p-3 border-t ${theme.bd} flex gap-2`}>
          <input
            value={input}
            onChange={(e) => onInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder={mode === 'pro' ? 'Question business...' : 'Question financière...'}
            className={`flex-1 px-3 py-2 rounded-xl border outline-none text-xs ${theme.inp}`}
          />
          <button
            onClick={onSend}
            disabled={loading || !input.trim()}
            className={`px-3 py-2 ${mode === 'pro' ? 'bg-indigo-600' : 'bg-emerald-600'} text-white rounded-xl font-bold disabled:opacity-40`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
