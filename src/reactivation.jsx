import React, { useEffect, useMemo } from 'react';
import { Sparkles, Lock, Receipt, Target, FileText, ArrowRight, X, Download } from 'lucide-react';
import { track } from './analytics.js';

const STORAGE_KEY = 'fb_reactivation_shown_session';

export function shouldShowReactivation() {
  try {
    return !sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

export function markReactivationShown() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {}
}

export function ReactivationScreen({
  theme,
  profile,
  mode,
  expensesCount,
  transactionsCount,
  goalsCount,
  documentsCount,
  onUpgrade,
  onContinue,
  onExport,
}) {
  const stats = useMemo(() => buildStats({
    mode, expensesCount, transactionsCount, goalsCount, documentsCount,
  }), [mode, expensesCount, transactionsCount, goalsCount, documentsCount]);

  const firstName = profile?.first_name || '';
  const greeting = firstName ? `Bon retour ${firstName}` : 'Bon retour';

  useEffect(() => {
    track('Reactivation Shown', {
      mode: mode || 'private',
      has_data: stats.totalItems > 0 ? 'yes' : 'no',
    });
  }, [mode, stats.totalItems]);

  const accent = mode === 'pro' ? 'indigo' : 'emerald';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm">
      <div className={`w-full max-w-lg ${theme.cd} rounded-t-3xl md:rounded-3xl shadow-2xl border ${theme.bd} max-h-[94vh] overflow-y-auto`}>
        <div className={`relative p-6 pb-5 ${theme.dk ? 'bg-gradient-to-br from-zinc-900 to-zinc-800' : 'bg-gradient-to-br from-amber-50 to-orange-50'}`}>
          <button
            onClick={() => { track('Reactivation Choice', { action: 'dismiss' }); onContinue(); }}
            className={`absolute top-3 right-3 p-1.5 rounded-full ${theme.dk ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-white/40 text-stone-500'}`}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-${accent}-500 text-white`}>
              <Sparkles size={20} />
            </div>
            <div className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${theme.dk ? 'bg-amber-950 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>
              <Lock size={9} className="inline mr-1 -mt-px" />Lecture seule
            </div>
          </div>
          <h2 className={`text-xl font-black tracking-tight ${theme.tx} mb-1`}>
            {greeting}.
          </h2>
          <p className={`text-xs ${theme.mt} leading-relaxed`}>
            Votre essai est terminé. Vos données sont conservées et consultables — les ajouts et le coach IA sont en pause jusqu'à activation Premium.
          </p>
        </div>

        {stats.totalItems > 0 && (
          <div className="p-5 pb-2">
            <p className={`text-[10px] font-black uppercase mb-2 ${theme.mt}`}>Ce que vous avez construit :</p>
            <div className="grid grid-cols-2 gap-2">
              {stats.rows.map((r) => (
                <div key={r.label} className={`p-3 rounded-2xl border ${theme.bd} ${theme.dk ? 'bg-zinc-900' : 'bg-white'} flex items-center gap-2.5`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${r.accent}-500/10 text-${r.accent}-500 flex-shrink-0`}>
                    <r.icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-black text-base tabular-nums leading-tight ${theme.tx}`}>{r.value}</p>
                    <p className={`text-[10px] ${theme.mt} truncate`}>{r.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-5 pt-3 space-y-2">
          <button
            onClick={() => { track('Reactivation Choice', { action: 'upgrade' }); markReactivationShown(); onUpgrade(); }}
            className={`plausible-event-name=Reactivation+Choice plausible-event-action=Upgrade w-full py-3.5 bg-gradient-to-r from-${accent}-600 to-${accent === 'emerald' ? 'teal' : 'purple'}-600 text-white font-black rounded-2xl text-sm transition-transform hover:scale-[1.01] flex items-center justify-center gap-2`}
          >
            Débloquer Premium {mode === 'pro' ? 'Pro · 29' : 'Privé · 9'} CHF/mois <ArrowRight size={15} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => { track('Reactivation Choice', { action: 'readonly' }); markReactivationShown(); onContinue(); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-2xl border ${theme.bd} ${theme.tx} ${theme.dk ? 'hover:bg-zinc-800' : 'hover:bg-stone-50'}`}
            >
              Continuer en lecture seule
            </button>
            {onExport && (
              <button
                onClick={() => { track('Reactivation Choice', { action: 'export' }); onExport(); }}
                className={`px-4 py-2.5 text-xs font-bold rounded-2xl border ${theme.bd} ${theme.mt} ${theme.dk ? 'hover:bg-zinc-800' : 'hover:bg-stone-50'} flex items-center gap-1.5`}
                title="Exporter mes données (RGPD)"
              >
                <Download size={13} />Export
              </button>
            )}
          </div>
          <p className={`text-[10px] ${theme.mt} text-center leading-relaxed pt-1`}>
            Aucun engagement · Annulable en 1 clic · Vos données restent à vous (export RGPD à tout moment).
          </p>
        </div>
      </div>
    </div>
  );
}

function buildStats({ mode, expensesCount, transactionsCount, goalsCount, documentsCount }) {
  const rows = [];
  if (mode === 'pro') {
    if (transactionsCount > 0) rows.push({ icon: Receipt, label: transactionsCount > 1 ? 'transactions saisies' : 'transaction saisie', value: transactionsCount, accent: 'indigo' });
    if (documentsCount > 0) rows.push({ icon: FileText, label: documentsCount > 1 ? 'documents scannés' : 'document scanné', value: documentsCount, accent: 'amber' });
    if (expensesCount > 0) rows.push({ icon: Receipt, label: 'charges fixes suivies', value: expensesCount, accent: 'rose' });
    if (goalsCount > 0) rows.push({ icon: Target, label: goalsCount > 1 ? 'objectifs définis' : 'objectif défini', value: goalsCount, accent: 'emerald' });
  } else {
    if (expensesCount > 0) rows.push({ icon: Receipt, label: 'charges fixes suivies', value: expensesCount, accent: 'rose' });
    if (goalsCount > 0) rows.push({ icon: Target, label: goalsCount > 1 ? 'objectifs définis' : 'objectif défini', value: goalsCount, accent: 'emerald' });
    if (transactionsCount > 0) rows.push({ icon: Receipt, label: transactionsCount > 1 ? 'transactions saisies' : 'transaction saisie', value: transactionsCount, accent: 'indigo' });
    if (documentsCount > 0) rows.push({ icon: FileText, label: 'document scanné', value: documentsCount, accent: 'amber' });
  }
  return { rows: rows.slice(0, 4), totalItems: rows.reduce((s, r) => s + r.value, 0) };
}
