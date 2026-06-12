import React from 'react';
import { Plus, Receipt, TrendingUp, CheckCircle2, Clock, Trash2, Copy, AlertTriangle } from 'lucide-react';
import { EmptyState } from '../components/EmptyState.jsx';
import { useToast } from '../toast.jsx';

const FILTERS = [
  { k: 'ALL', l: 'Tout' },
  { k: 'IN', l: 'Recettes' },
  { k: 'OUT', l: 'Dépenses' },
  { k: 'PENDING', l: 'Attente' },
];

// Relance cadence relative to a 30-day net due date (Swiss practice).
// Mirrors the academy "recouvrement" lesson: rappel 1 → rappel 2 → sommation → poursuite.
function relanceInfo(dateStr) {
  const issued = new Date(dateStr);
  if (Number.isNaN(issued.getTime())) return null;
  const days = Math.floor((Date.now() - issued.getTime()) / 86400000);
  const overdue = days - 30;
  if (overdue < 0) return { overdue, step: 'pending', label: `Échéance dans ${-overdue} j`, urgent: false };
  if (overdue < 14) return { overdue, step: 'Rappel 1', label: `Retard ${overdue} j · Rappel 1`, urgent: false };
  if (overdue < 21) return { overdue, step: 'Rappel 2', label: `Retard ${overdue} j · Rappel 2`, urgent: true };
  if (overdue < 30) return { overdue, step: 'Sommation', label: `Retard ${overdue} j · Sommation`, urgent: true };
  return { overdue, step: 'Poursuite', label: `Retard ${overdue} j · Poursuite envisageable`, urgent: true };
}

function relanceMessage(t, info) {
  const amount = `${parseFloat(t.amount).toFixed(2)} CHF`;
  const ref = t.label || 'notre facture';
  if (info.step === 'Rappel 1') {
    return `Objet : Rappel — ${ref}\n\nMadame, Monsieur,\n\nSauf erreur de notre part, le paiement de ${amount} relatif à « ${ref} » reste en attente. Nous vous remercions de bien vouloir le régler sous 10 jours.\n\nSi le paiement a été effectué entre-temps, merci de ne pas tenir compte de ce message.\n\nMeilleures salutations.`;
  }
  if (info.step === 'Rappel 2') {
    return `Objet : 2e rappel — ${ref}\n\nMadame, Monsieur,\n\nMalgré notre premier rappel, le montant de ${amount} pour « ${ref} » demeure impayé. Nous vous prions de procéder au règlement sous 10 jours, faute de quoi nous serons contraints d'engager la procédure de recouvrement.\n\nMeilleures salutations.`;
  }
  return `Objet : Mise en demeure — ${ref}\n\nMadame, Monsieur,\n\nNous vous mettons formellement en demeure de régler le montant de ${amount} relatif à « ${ref} » dans un délai de 10 jours. À défaut, une réquisition de poursuite sera déposée auprès de l'Office des poursuites compétent, des intérêts moratoires de 5%/an (art. 104 CO) s'ajoutant au montant dû.\n\nMeilleures salutations.`;
}

export function Transactions({ theme, transactions, filter, onChangeFilter, onAddTx, onToggleStatus, onDeleteTx }) {
  const toast = useToast();
  const filtered = transactions.filter((t) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return t.status === 'PENDING';
    return t.type === filter;
  });

  const receivables = transactions.filter((t) => t.type === 'IN' && t.status === 'PENDING');
  const receivableTotal = receivables.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
  const overdueCount = receivables.filter((t) => {
    const info = relanceInfo(t.date);
    return info && info.overdue >= 0;
  }).length;

  const copyRelance = async (t, info) => {
    try {
      await navigator.clipboard.writeText(relanceMessage(t, info));
      toast.success('Texte de relance copié');
    } catch {
      toast.error('Copie impossible sur cet appareil');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-lg">Journal</h3>
        <button onClick={onAddTx} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2">
          <Plus size={16} />Pièce
        </button>
      </div>

      {receivables.length > 0 && (
        <div className={`p-3 rounded-2xl border ${overdueCount > 0
          ? (theme.dk ? 'bg-amber-950/30 border-amber-900' : 'bg-amber-50 border-amber-200')
          : `${theme.cd} ${theme.bd}`}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-[8px] font-black uppercase ${theme.mt}`}>Créances en attente</p>
              <p className="font-black text-base tabular-nums">{receivableTotal.toLocaleString('fr-CH')} CHF</p>
            </div>
            <button onClick={() => onChangeFilter('PENDING')} className={`text-right ${overdueCount > 0 ? 'text-amber-600' : theme.mt}`}>
              <p className="font-black text-base tabular-nums">{overdueCount}</p>
              <p className="text-[8px] font-black uppercase">à relancer</p>
            </button>
          </div>
        </div>
      )}

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
        <EmptyState
          theme={theme}
          icon={Receipt}
          accent="indigo"
          title={filter === 'ALL' ? 'Aucune transaction' : filter === 'PENDING' ? 'Aucune attente' : filter === 'IN' ? 'Aucune recette' : 'Aucune dépense'}
          description={filter === 'ALL'
            ? 'Ajoutez votre 1ère pièce — recette client, dépense pro ou justificatif. Tout reste organisé par catégorie et statut.'
            : 'Changez de filtre ou ajoutez une nouvelle pièce.'}
          ctaLabel="Ajouter une pièce"
          onCta={onAddTx}
          hint={filter === 'ALL' ? 'Astuce : utilisez le Scanner pour importer une facture en photo' : null}
        />
      )}
      {filtered.map((t) => {
        const isReceivable = t.type === 'IN' && t.status === 'PENDING';
        const info = isReceivable ? relanceInfo(t.date) : null;
        return (
          <div
            key={t.id}
            className={`rounded-2xl border ${
              t.status === 'PENDING'
                ? (theme.dk ? 'bg-amber-950/20 border-amber-900' : 'bg-amber-50/50 border-amber-200')
                : `${theme.cd} ${theme.bd}`
            }`}
          >
            <div className="p-3 flex items-center justify-between">
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
                  <button onClick={() => onToggleStatus(t.id)} className={`p-1 rounded-lg ${theme.sf}`} aria-label={t.status === 'PAID' ? 'Marquer en attente' : 'Marquer payée'}>
                    {t.status === 'PAID' ? <Clock size={13} /> : <CheckCircle2 size={13} />}
                  </button>
                  <button onClick={() => onDeleteTx(t.id)} className="p-1 text-stone-400 hover:text-rose-500" aria-label="Supprimer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
            {info && (
              <div className={`px-3 pb-3 flex items-center justify-between gap-2 -mt-1`}>
                <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wide ${info.urgent ? 'text-amber-600' : theme.mt}`}>
                  {info.urgent && <AlertTriangle size={11} />}{info.label}
                </span>
                {info.overdue >= 0 && (
                  <button
                    onClick={() => copyRelance(t, info)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-amber-500 text-white"
                  >
                    <Copy size={11} /> Texte {info.step}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
