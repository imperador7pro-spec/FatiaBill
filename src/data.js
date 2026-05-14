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
