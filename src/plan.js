import { TRIAL_DAYS, FREE_LIMITS, TRIAL_LIMITS, PREMIUM_LIMITS } from './data.js';

export const PLAN_FEATURES = [
  {
    section: 'Essentiels',
    rows: [
      { label: 'Suivi budget mensuel', free: true, trial: true, premium: true },
      { label: 'Calcul reste à vivre temps réel', free: true, trial: true, premium: true },
      { label: 'Dashboard personnalisé canton', free: true, trial: true, premium: true },
      { label: 'Mode sombre + thèmes', free: true, trial: true, premium: true },
    ],
  },
  {
    section: 'Budget & Objectifs',
    rows: [
      { label: 'Charges fixes suivies', free: `${FREE_LIMITS.expenses} max`, trial: 'Illimité', premium: 'Illimité' },
      { label: 'Objectifs d\'épargne', free: `${FREE_LIMITS.goals} max`, trial: 'Illimité', premium: 'Illimité' },
      { label: 'Projections intérêts composés', free: false, trial: true, premium: true },
      { label: 'Comparateur 3A (Viac, Frankly…)', free: false, trial: true, premium: true },
    ],
  },
  {
    section: 'Coach IA',
    rows: [
      { label: 'Messages coach IA / mois', free: `${FREE_LIMITS.ai}`, trial: 'Illimité', premium: 'Illimité' },
      { label: 'IA contextuelle (voit tes données)', free: false, trial: true, premium: true },
      { label: 'Conseils fiscaux personnalisés canton', free: false, trial: true, premium: true },
    ],
  },
  {
    section: 'Académie',
    rows: [
      { label: 'Leçons gratuites de base', free: true, trial: true, premium: true },
      { label: 'Leçons avancées (immobilier, fiscalité)', free: false, trial: true, premium: true },
      { label: 'XP, streaks, badges', free: true, trial: true, premium: true },
    ],
  },
  {
    section: 'Pro · Indépendants & Entreprises',
    rows: [
      { label: 'Trésorerie multi-devises', free: false, trial: true, premium: 'pro' },
      { label: 'Scanner factures (Claude Vision)', free: false, trial: true, premium: 'pro' },
      { label: 'Génération QR-factures suisses', free: false, trial: true, premium: 'pro' },
      { label: 'Rapport fiscal annuel exportable', free: false, trial: true, premium: 'pro' },
      { label: 'Calcul TVA + provisions AVS', free: false, trial: true, premium: 'pro' },
    ],
  },
];

export function effectivePlan(profile) {
  if (!profile) return 'free';
  if (profile.plan === 'premium') return 'premium';
  if (profile.plan === 'trial' && profile.trial_ends_at) {
    if (new Date(profile.trial_ends_at) > new Date()) return 'trial';
    return 'free';
  }
  return 'free';
}

export function trialDaysLeft(profile) {
  if (!profile?.trial_ends_at) return 0;
  const ms = new Date(profile.trial_ends_at) - new Date();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function hasTrialExpired(profile) {
  if (!profile?.trial_ends_at) return false;
  if (profile.plan === 'premium') return false;
  return new Date(profile.trial_ends_at) <= new Date();
}

export function newTrialDates() {
  const now = new Date();
  const end = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  return {
    trial_started_at: now.toISOString(),
    trial_ends_at: end.toISOString(),
  };
}

export function getLimit(plan, key) {
  if (plan === 'premium') return PREMIUM_LIMITS[key] ?? Infinity;
  if (plan === 'trial') return TRIAL_LIMITS[key] ?? Infinity;
  return FREE_LIMITS[key] ?? 0;
}

export function isPremiumLike(plan) {
  return plan === 'premium' || plan === 'trial';
}

export function currentPeriod() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}
