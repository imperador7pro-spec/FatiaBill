import {
  Home, Car, Zap, ShieldCheck, Landmark, Receipt, Shield, Building2, Coffee,
  Target, Wallet, TrendingUp, Briefcase, Heart, Star, Trophy, GraduationCap,
  Crown, Lightbulb, BookOpen, Camera, FileText,
} from 'lucide-react';

export const ICON_MAP = {
  Home, Car, Zap, ShieldCheck, Landmark, Receipt, Shield, Building2, Coffee,
  Target, Wallet, TrendingUp, Briefcase, Heart, Star, Trophy, GraduationCap,
  Crown, Lightbulb, BookOpen, Camera, FileText,
};

export const getIcon = (name) => ICON_MAP[name] || Receipt;

export const DEFAULT_EXPENSES_PRIVATE = [
  { label: 'Loyer / Hypothèque', amount: 1500, category: 'Habitation', icon: 'Home' },
  { label: 'Assurance LAMal', amount: 350, category: 'Santé', icon: 'ShieldCheck' },
  { label: 'Leasing / Auto', amount: 330, category: 'Transport', icon: 'Car' },
];

export const DEFAULT_EXPENSES_PRO = [
  { label: 'Loyer Bureau', amount: 800, category: 'Loyer', icon: 'Building2' },
  { label: 'Assurances RC Pro', amount: 150, category: 'Assurance', icon: 'Shield' },
  { label: 'Abonnements', amount: 120, category: 'Admin', icon: 'Zap' },
];

export const EXPENSE_CATEGORIES = [
  'Marchandises', 'Déplacement', 'Repas & Représentation', 'Publicité', 'Sous-traitants', 'Admin & Divers',
];

export const GOAL_PRESETS = [
  { l: 'Achat immobilier', i: 'Home', a: 100000 },
  { l: "Fonds d'urgence", i: 'Shield', a: 15000 },
  { l: 'Véhicule', i: 'Car', a: 25000 },
  { l: 'Voyage / Projet', i: 'Target', a: 5000 },
  { l: 'Objectif libre', i: 'Star', a: 10000 },
];

export const INVESTMENT_PRODUCTS = [
  {
    n: '3A Titres', r: 0.05, ri: 'Modéré', rc: 'text-amber-600 bg-amber-100', mx: 7056,
    d: 'Enveloppe fiscale + fonds.',
    p: ['Avantage fiscal', '4-7%/an', 'Composés'],
    c: ['Risque perte', 'Bloqué', 'Frais'],
    lv: 'Double levier: fiscal + composés. 20 ans → ~245k.',
  },
  {
    n: 'ETF Indiciels', r: 0.07, ri: 'Modéré-élevé', rc: 'text-orange-600 bg-orange-100', mx: null,
    d: 'MSCI World. Aucun plafond.',
    p: ['Illimité', 'Liquide', 'Diversifié', '0.1%'],
    c: ['Pas fiscal', 'Volatilité', 'Imposable'],
    lv: '500/mois à 7% = ~121k en 10 ans.',
  },
  {
    n: '3A Compte', r: 0.015, ri: 'Très faible', rc: 'text-emerald-600 bg-emerald-100', mx: 7056,
    d: 'Déductible. Garanti mais bloqué.',
    p: ['Impôts réduits', 'Garanti', 'Discipline'],
    c: ['Bloqué', 'Faible', 'Plafonné'],
    lv: 'Taux 30% → 7056 = ~2100 économisés.',
  },
  {
    n: 'Compte Épargne', r: 0.0075, ri: 'Aucun', rc: 'text-emerald-600 bg-emerald-100', mx: null,
    d: 'Sûr mais < inflation.',
    p: ['Garanti', 'Liquide', 'Simple'],
    c: ['Nul', 'Perd valeur', 'Aucun avantage'],
    lv: 'Aucun levier.',
  },
];

export const ACADEMY_MODULES = [
  {
    id: 'money', title: "Comprendre l'argent", icon: 'Lightbulb', color: 'amber',
    lessons: [
      { id: 'l1', title: "Qu'est-ce que l'argent?", free: true, dur: '4 min',
        content: "L'argent n'est pas une fin — c'est un outil de mesure.\n\nL'inflation: 100 CHF → ~85 CHF dans 10 ans (1.5%/an). Ne rien faire = perdre.",
        quiz: { q: "Inflation 2%/an, 1000 dans 10 ans ≈?", o: ['~820', '~980', '~1000', '~900'], c: 0 } },
      { id: 'l2', title: "Pièges psychologiques", free: true, dur: '5 min',
        content: "Dopamine = ANTICIPATION, pas possession.\n\n3 biais: 1. Ancrage (299→149) 2. Troupeau (iPhone Pro) 3. Gratification immédiate\n\nSolution: Règle 48h. 70% d'envies disparaissent.",
        quiz: { q: "Biais d'achat 'soldé' inutile?", o: ['Ancrage', 'Aversion risque', 'Survie', 'Dunning-Kruger'], c: 0 } },
      { id: 'l3', title: 'Actif vs Passif', free: false, dur: '5 min',
        content: "ACTIF = revenus (loyer, dividendes). PASSIF = coûts (leasing, crédit).\n\nVoiture: -15-20%/an. Règle: >500 CHF → valeur dans 5 ans?",
        quiz: { q: 'Lequel est un actif?', o: ['Voiture', 'ETF dividendes', 'TV 4K', 'Baskets'], c: 1 } },
      { id: 'l4', title: 'Illusion du brut', free: false, dur: '4 min',
        content: '6k brut → AVS -318, LPP -420, Chômage -66 → 5196\n→ Impôts -624 → LAMal -350 → RÉEL: ~4222 CHF (30% de moins)',
        quiz: { q: '% du brut en charges?', o: ['~10%', '~20%', '~30%', '~50%'], c: 2 } },
    ],
  },
  {
    id: 'fortress', title: 'Forteresse financière', icon: 'Shield', color: 'emerald',
    lessons: [
      { id: 'l5', title: "Fonds d'urgence", free: true, dur: '4 min',
        content: "AVANT d'investir: fonds d'urgence. 3-6 mois charges (~8-15k). Compte SÉPARÉ. UNIQUEMENT urgences.",
        quiz: { q: 'Mois de charges pour urgence?', o: ['1', '3 à 6', '12', '24'], c: 1 } },
      { id: 'l6', title: 'Règle 50/30/20', free: true, dur: '4 min',
        content: '50% BESOINS (loyer, LAMal)\n30% ENVIES (restos, shopping)\n20% AVENIR (épargne, 3A)\n\nSi loyer = 30% → adaptez: 60/20/20.',
        quiz: { q: 'Part épargne?', o: ['5%', '10%', '20%', '50%'], c: 2 } },
      { id: 'l7', title: 'Charges invisibles', free: false, dur: '5 min',
        content: '1. Abos oubliés: 150/mois = 1800/an\n2. Frais bancaires: 5-15/mois\n3. Assurances en double\n4. Franchise LAMal: 300→2500 = ~200/mois\n5. Leasing: 400×48 = 19200 pour rien',
        quiz: { q: 'Franchise 300→2500 économise ~?', o: ['20/mois', '50/mois', '200/mois', '500/mois'], c: 2 } },
    ],
  },
  {
    id: 'invest', title: "Faire travailler l'argent", icon: 'TrendingUp', color: 'indigo',
    lessons: [
      { id: 'l8', title: 'Intérêts composés', free: false, dur: '5 min',
        content: 'Sans: 500/mois × 30 ans = 180k\nAvec 5%: → ~416k\nDifférence: 236k. Le secret: le TEMPS.',
        quiz: { q: '500/mois à 5% × 30 ans ≈?', o: ['180k', '250k', '416k', '1M'], c: 2 } },
      { id: 'l9', title: '3ème Pilier A', free: false, dur: '6 min',
        content: "1. Taux 30% → 7056 = ~2100 d'impôts en moins\n2. Compte (~1.5%) ou Titres (~5%)\n3. Retrait: résidence, départ CH, indépendance\n4. Astuce: 5 comptes 3A → étaler retraits\n\nPlafond: 7056/an (salariés).",
        quiz: { q: 'Plafond 3A salarié:', o: ['5000', '7056', '10000', '35280'], c: 1 } },
      { id: 'l10', title: 'ETF simplement', free: false, dur: '5 min',
        content: 'ETF = 1500+ entreprises en 1 achat.\n• Frais 0.1-0.3%/an\n• ~7%/an sur 30+ ans\n• Dès 1 CHF\n\nOù: VIAC, Finpension (3A), IBKR (libre).\nRègle: RÉGULIÈREMENT, jamais chronométrer.',
        quiz: { q: "ETF MSCI World ≈ combien d'entreprises?", o: ['50', '500', '1500+', '10k'], c: 2 } },
    ],
  },
  {
    id: 'rescue', title: 'Anti-Noyade', icon: 'Heart', color: 'rose',
    lessons: [
      { id: 'l14', title: 'Mois Rouge', free: true, dur: '5 min',
        content: '1. STOP dépenses non-essentielles\n2. INVENTAIRE rentrées\n3. PRIORITÉ: Loyer → LAMal → Alimentation\n4. NÉGOCIEZ avant échéance (90% acceptent)\n5. PLAN: 3 dépenses à supprimer',
        quiz: { q: '1ère chose mois rouge?', o: ['Crédit', 'Geler dépenses', 'Ignorer', 'Vendre'], c: 1 } },
      { id: 'l15', title: '7 pièges suisses', free: false, dur: '6 min',
        content: '1. LEASING 19k pour rien\n2. ABOS 1800/an\n3. FRANCHISE trop basse\n4. CRÉDIT CONSO: JAMAIS (10-15%)\n5. COMPARAISON SOCIALE\n6. LIFESTYLE INFLATION\n7. PAS DE 3A = 2100/an perdus',
        quiz: { q: 'Produit à JAMAIS utiliser?', o: ['ETF', 'Crédit conso', '3A', 'Épargne'], c: 1 } },
      { id: 'l16', title: 'Reset 90 jours', free: false, dur: '5 min',
        content: 'M1 AUDIT: Listez tout, supprimez 3, compte séparé.\nM2 DISCIPLINE: 20% le jour du salaire, cash variable, négociez.\nM3 ACCÉLÉRATION: Vendez (2-5k), side-income, 1er ETF.',
        quiz: { q: '1er geste Reset?', o: ['Investir', 'Audit', 'Prêt', 'Déménager'], c: 1 } },
    ],
  },
  {
    id: 'advanced', title: 'Stratégies avancées', icon: 'Crown', color: 'amber',
    lessons: [
      { id: 'l12', title: 'Optimisation fiscale', free: false, dur: '6 min',
        content: 'Déductions: 1. 3A 7056 2. Rachats LPP 3. Formation 4. Transport 5. Repas pro 6. Dons (20%) 7. Maladie >5% 8. Hypothèque\n\nAstuce: proche d\'un seuil → rachat LPP.',
        quiz: { q: 'Rachats LPP sont...', o: ['Impossibles', 'Déductibles', 'Réservés riches', 'Max 1k'], c: 1 } },
    ],
  },
];

export const ACADEMY_PRO_CARDS = [
  { title: 'TVA 8.1%', icon: 'Landmark', color: 'rose',
    content: 'Dès 100k CA. TVA encaissée = argent Confédération.\nMéthode TDFN si CA < 5M.' },
  { title: 'Piège AVS', icon: 'Shield', color: 'indigo',
    content: 'RI: ~10% sur bénéfice. Régularisation 2 ans tard.\nProvisionner 10% en temps réel.' },
  { title: 'Frais Représentation', icon: 'Coffee', color: 'amber',
    content: 'Repas: NOM + MOTIF au dos.\nVéhicule privé: 0.70 CHF/km.' },
  { title: 'Amortissements', icon: 'TrendingUp', color: 'emerald',
    content: 'Achat >1k → amortissement 20-40%/an.\nFin d\'année: provisions ou achats anticipés.' },
];

export const TRIAL_DAYS = 14;

export const FREE_LIMITS = {
  expenses: 5,
  goals: 2,
  ai: 3,
};

export const TRIAL_LIMITS = {
  expenses: Infinity,
  goals: Infinity,
  ai: Infinity,
};

export const PREMIUM_LIMITS = {
  expenses: Infinity,
  goals: Infinity,
  ai: Infinity,
};

export const CANTONS = [
  { code: 'AG', name: 'Argovie' },
  { code: 'AI', name: 'Appenzell Rh.-Int.' },
  { code: 'AR', name: 'Appenzell Rh.-Ext.' },
  { code: 'BE', name: 'Berne' },
  { code: 'BL', name: 'Bâle-Campagne' },
  { code: 'BS', name: 'Bâle-Ville' },
  { code: 'FR', name: 'Fribourg' },
  { code: 'GE', name: 'Genève' },
  { code: 'GL', name: 'Glaris' },
  { code: 'GR', name: 'Grisons' },
  { code: 'JU', name: 'Jura' },
  { code: 'LU', name: 'Lucerne' },
  { code: 'NE', name: 'Neuchâtel' },
  { code: 'NW', name: 'Nidwald' },
  { code: 'OW', name: 'Obwald' },
  { code: 'SG', name: 'Saint-Gall' },
  { code: 'SH', name: 'Schaffhouse' },
  { code: 'SO', name: 'Soleure' },
  { code: 'SZ', name: 'Schwyz' },
  { code: 'TG', name: 'Thurgovie' },
  { code: 'TI', name: 'Tessin' },
  { code: 'UR', name: 'Uri' },
  { code: 'VD', name: 'Vaud' },
  { code: 'VS', name: 'Valais' },
  { code: 'ZG', name: 'Zoug' },
  { code: 'ZH', name: 'Zurich' },
];

export const NATIONALITY_OPTIONS = [
  { value: 'CH', label: 'Citoyen·ne suisse' },
  { value: 'permit_C', label: 'Permis C (établissement)' },
  { value: 'permit_B', label: 'Permis B (séjour)' },
  { value: 'permit_L', label: 'Permis L (courte durée)' },
  { value: 'permit_G', label: 'Permis G (frontalier suisse)' },
  { value: 'frontalier_FR', label: 'Frontalier·e France' },
  { value: 'frontalier_DE', label: 'Frontalier·e Allemagne' },
  { value: 'frontalier_IT', label: 'Frontalier·e Italie' },
  { value: 'frontalier_AT', label: 'Frontalier·e Autriche' },
  { value: 'other', label: 'Autre' },
];

export const CIVIL_STATUS_OPTIONS = [
  { value: 'single', label: 'Célibataire' },
  { value: 'married', label: 'Marié·e' },
  { value: 'partnership', label: 'Partenariat enregistré' },
  { value: 'divorced', label: 'Divorcé·e' },
  { value: 'widowed', label: 'Veuf / Veuve' },
];

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'employee', label: 'Salarié·e (secteur privé)' },
  { value: 'public_servant', label: 'Fonctionnaire' },
  { value: 'self_employed', label: 'Indépendant·e (en parallèle)' },
  { value: 'apprentice', label: 'Apprenti·e' },
  { value: 'student', label: 'Étudiant·e' },
  { value: 'retired', label: 'Retraité·e' },
  { value: 'unemployed', label: 'Sans emploi' },
  { value: 'parental_leave', label: 'Congé parental' },
  { value: 'other', label: 'Autre' },
];

export const BUSINESS_FORM_OPTIONS = [
  { value: 'RI', label: 'Raison Individuelle', hint: 'Solo, aucun capital min. Responsabilité illimitée sur biens perso.' },
  { value: 'Sarl', label: 'Sàrl', hint: 'Capital min. CHF 20\'000. Responsabilité limitée au capital.' },
  { value: 'SA', label: 'SA', hint: 'Capital min. CHF 100\'000. Idéal pour lever des fonds.' },
  { value: 'association', label: 'Association', hint: 'But non lucratif.' },
  { value: 'other', label: 'Autre forme juridique' },
];

export const BUSINESS_SECTORS = [
  'Conseil & Services aux entreprises',
  'IT / Tech / Digital',
  'Restauration & Hôtellerie',
  'Commerce & Retail',
  'Construction & Artisanat',
  'Santé & Médical',
  'Beauté & Bien-être',
  'Arts & Création',
  'Éducation & Formation',
  'Transport & Logistique',
  'Immobilier',
  'Finance & Assurance',
  'Marketing & Communication',
  'Sport & Loisirs',
  'Agriculture & Vigne',
  'Autre',
];

export const LAMAL_FRANCHISES = [300, 500, 1000, 1500, 2000, 2500];
