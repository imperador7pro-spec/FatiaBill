import React, { useMemo, useEffect } from 'react';
import { Sparkles, TrendingUp, Wallet, Receipt, X, ArrowRight } from 'lucide-react';
import { computeFullBreakdown } from './swissCharges.js';
import { estimateTax } from './cantonTax.js';
import { track } from './analytics.js';

const STORAGE_KEY = 'fb_first_win_shown_at';

export function hasSeenFirstWin() {
  try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; }
}

export function markFirstWinSeen() {
  try { localStorage.setItem(STORAGE_KEY, new Date().toISOString()); } catch {}
}

export function FirstWinModal({ theme, profile, mode, onClose, onOpenCoach }) {
  const insight = useMemo(() => buildInsight(profile, mode), [profile, mode]);

  useEffect(() => {
    track('First Win Shown', {
      mode: mode || 'private',
      canton: profile?.canton || 'unknown',
      has_salary: insight ? 'yes' : 'no',
    });
  }, [mode, profile, insight]);

  if (!insight) return null;

  const accent = mode === 'pro' ? 'indigo' : 'emerald';

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md ${theme.cd} rounded-t-3xl md:rounded-3xl shadow-2xl border ${theme.bd} max-h-[92vh] overflow-y-auto`}>
        <div className={`relative p-6 pb-5 ${theme.dk ? 'bg-zinc-900' : 'bg-gradient-to-br from-emerald-50 to-teal-50'} ${theme.dk ? '' : 'border-b ' + theme.bd}`}>
          <button onClick={onClose} className={`absolute top-3 right-3 p-1.5 rounded-full ${theme.dk ? 'hover:bg-zinc-800' : 'hover:bg-white/40'} ${theme.mt}`}>
            <X size={16} />
          </button>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-${accent}-500 text-white mb-3`}>
            <Sparkles size={20} />
          </div>
          <h2 className={`text-xl font-black tracking-tight ${theme.tx} mb-1`}>
            {insight.greeting}, voici votre 1ère analyse
          </h2>
          <p className={`text-xs ${theme.mt} leading-relaxed`}>
            Basée sur ce que vous venez de saisir — canton, situation, salaire — sans aucun calcul de votre part.
          </p>
        </div>

        <div className="p-5 space-y-3">
          <Row theme={theme} icon={Wallet} accent={accent}
            label={mode === 'pro' ? 'Capacité d\'épargne estimée' : 'Net en main estimé'}
            value={`${insight.netMonthly.toLocaleString('fr-CH')} CHF`}
            sub={`par mois${insight.brutMonthly ? ` · sur ${insight.brutMonthly.toLocaleString('fr-CH')} brut` : ''}`}
          />
          {insight.taxAnnual > 0 && (
            <Row theme={theme} icon={Receipt} accent="amber"
              label={`Impôts ${insight.cantonName}`}
              value={`~ ${Math.round(insight.taxAnnual).toLocaleString('fr-CH')} CHF/an`}
              sub={`soit ${Math.round(insight.taxAnnual / 12).toLocaleString('fr-CH')} CHF/mois`}
            />
          )}
          {insight.savingsCapacityMonthly > 0 && (
            <Row theme={theme} icon={TrendingUp} accent="emerald"
              label="Capacité d'épargne (règle 20%)"
              value={`${Math.round(insight.savingsCapacityMonthly).toLocaleString('fr-CH')} CHF/mois`}
              sub={`= ${Math.round(insight.savingsCapacityMonthly * 12).toLocaleString('fr-CH')} CHF/an`}
            />
          )}

          {insight.tip && (
            <div className={`p-3 rounded-2xl border ${theme.dk ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'}`}>
              <p className={`text-[10px] font-black uppercase mb-1 ${theme.dk ? 'text-emerald-400' : 'text-emerald-700'} flex items-center gap-1`}>
                <Sparkles size={11} /> Opportunité repérée
              </p>
              <p className={`text-xs leading-relaxed ${theme.dk ? 'text-emerald-200' : 'text-emerald-900'}`}>
                {insight.tip}
              </p>
            </div>
          )}

          <p className={`text-[10px] ${theme.mt} text-center leading-relaxed pt-1`}>
            Ces estimations ont une précision ±15% — pour des chiffres exacts, demandez au coach IA en bas de page.
          </p>
        </div>

        <div className={`p-4 border-t ${theme.bd} space-y-2`}>
          <button
            onClick={() => { track('First Win Continue', { action: 'coach' }); onOpenCoach?.(); onClose(); }}
            className={`plausible-event-name=First+Win+Continue plausible-event-action=Coach w-full py-3 bg-${accent}-600 hover:bg-${accent}-500 text-white font-black rounded-2xl text-sm transition-colors flex items-center justify-center gap-2`}
          >
            Demander au coach IA <ArrowRight size={14} />
          </button>
          <button
            onClick={() => { track('First Win Continue', { action: 'explore' }); onClose(); }}
            className={`w-full py-2.5 text-xs font-bold rounded-2xl ${theme.mt} hover:${theme.tx}`}
          >
            Explorer FatiaBill d'abord
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ theme, icon: Icon, accent, label, value, sub }) {
  return (
    <div className={`p-3 rounded-2xl border ${theme.bd} ${theme.cd} flex items-center gap-3`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${accent}-500/10 text-${accent}-500 flex-shrink-0`}>
        <Icon size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-[10px] font-black uppercase ${theme.mt}`}>{label}</p>
        <p className={`font-black text-base tabular-nums ${theme.tx} leading-tight`}>{value}</p>
        {sub && <p className={`text-[10px] ${theme.mt}`}>{sub}</p>}
      </div>
    </div>
  );
}

const CANTON_NAMES = {
  AG: 'Argovie', BE: 'Berne', BS: 'Bâle-Ville', BL: 'Bâle-Campagne', FR: 'Fribourg',
  GE: 'Genève', GL: 'Glaris', GR: 'Grisons', JU: 'Jura', LU: 'Lucerne',
  NE: 'Neuchâtel', NW: 'Nidwald', OW: 'Obwald', SG: 'Saint-Gall', SH: 'Schaffhouse',
  SO: 'Soleure', SZ: 'Schwyz', TG: 'Thurgovie', TI: 'Tessin', UR: 'Uri',
  VD: 'Vaud', VS: 'Valais', ZG: 'Zoug', ZH: 'Zurich', AI: 'Appenzell RI', AR: 'Appenzell RE',
};

function buildInsight(profile, mode) {
  if (!profile) return null;

  const firstName = profile.first_name || '';
  const greeting = firstName ? `Bonjour ${firstName}` : 'Bonjour';
  const canton = profile.canton || 'VD';
  const cantonName = CANTON_NAMES[canton] || canton;

  if (mode === 'pro') {
    // Pro path: we have less reliable monthly numbers, so emit a generic
    // but still concrete first analysis.
    return {
      greeting,
      cantonName,
      netMonthly: 0,
      brutMonthly: 0,
      taxAnnual: 0,
      savingsCapacityMonthly: 0,
      tip: profile.business_form === 'Sarl' || profile.business_form === 'SA'
        ? `En tant que ${profile.business_form === 'Sarl' ? 'gérant·e Sàrl' : 'administrateur·trice SA'} en ${cantonName}, l'arbitrage salaire vs dividendes peut représenter plusieurs milliers de CHF d'écart annuel. Le coach business saura modéliser votre cas.`
        : `Vous démarrez en Raison Individuelle dans le canton de ${cantonName}. Première étape critique : valider votre rattachement TVA (seuil 100k CHF de CA) et choisir entre méthode TDFN et effective. Le coach business peut vous orienter.`,
    };
  }

  const annualBrut = Number(profile.salary || 0) * 12;
  if (annualBrut <= 0) {
    return {
      greeting,
      cantonName,
      netMonthly: 0,
      brutMonthly: 0,
      taxAnnual: 0,
      savingsCapacityMonthly: 0,
      tip: `Vous n'avez pas encore saisi de salaire — ajoutez-le depuis le dashboard pour débloquer la décomposition brut → net, l'estimation d'impôts ${cantonName} et la stratégie 3A personnalisée.`,
    };
  }

  const age = profile.birth_year ? new Date().getFullYear() - profile.birth_year : 35;
  const breakdown = computeFullBreakdown({
    annual_brut: annualBrut,
    age,
    canton,
    civil_status: profile.civil_status || 'single',
    num_children: profile.num_children || 0,
    has_lpp: profile.has_lpp !== false,
  });

  const netMonthly = Math.round(breakdown.net_en_main / 12);
  const brutMonthly = Math.round(annualBrut / 12);
  const savings = Math.round(breakdown.net_en_main * 0.20 / 12);

  // 3A tip — compute estimated tax savings if no 3A yet
  let tip = null;
  if (profile.has_3a === false || profile.has_3a === undefined) {
    const max3A = profile.has_lpp === false ? 36288 : 7258;
    const realisticContribution = Math.min(max3A, Math.max(0, savings * 12));
    if (realisticContribution > 1000) {
      const taxWithout = breakdown.tax;
      const newImposable = (breakdown.net_imposable - realisticContribution);
      const taxWith = estimateTax({
        income: newImposable,
        civil_status: profile.civil_status || 'single',
        num_children: profile.num_children || 0,
        canton,
      }).tax;
      const taxSaving = Math.round(taxWithout - taxWith);
      if (taxSaving > 100) {
        tip = `Un 3ème pilier 3A à ${Math.round(realisticContribution).toLocaleString('fr-CH')} CHF/an vous économiserait environ ${taxSaving.toLocaleString('fr-CH')} CHF d'impôts par an en ${cantonName}. Soit un rendement fiscal immédiat de ${Math.round(taxSaving / realisticContribution * 100)}%.`;
      }
    }
  }

  if (!tip && (profile.civil_status === 'single' && profile.num_children === 0 && canton === 'GE')) {
    tip = `À Genève célibataire sans enfant, vous êtes dans la tranche la plus taxée de Suisse. Un déménagement à Vaud, Fribourg ou Zoug peut représenter 2'000 à 5'000 CHF d'économies par an — le simulateur cantonal vous donne le chiffre exact.`;
  }

  return {
    greeting,
    cantonName,
    netMonthly,
    brutMonthly,
    taxAnnual: breakdown.tax,
    savingsCapacityMonthly: savings,
    tip,
  };
}
