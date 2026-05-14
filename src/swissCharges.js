// Swiss social charges + LAMal — 2025 reference values.
// Used both by the salary-breakdown view and by the canton simulator to
// compute a *real* monthly net (tax + LAMal included).
//
// Precision: official rates for AVS/AI/APG/AC; LPP uses the legal minimum
// (caisses can be more generous); LAMal uses cantonal averages (BAG/OFSP),
// not the cheapest insurer.

import { estimateTax } from './cantonTax.js';

// ─────────────────────────────────────────────────────
// AVS / AI / APG — 2025
// 10.6% total (5.3% employee + 5.3% employer), no cap.
// Self-employed: dégressif from 5.371% to 10.0% between 9'800 and 60'000,
// 10% above. We model the linear interpolation.
// ─────────────────────────────────────────────────────

export function avsEmployeeRate() {
  return 0.053;
}

export function avsSelfEmployedRate(annualIncome) {
  if (annualIncome <= 9800) return 0.05371;
  if (annualIncome >= 60000) return 0.10;
  const t = (annualIncome - 9800) / (60000 - 9800);
  return 0.05371 + t * (0.10 - 0.05371);
}

// ─────────────────────────────────────────────────────
// AC — Assurance chômage 2025
// 1.1% on salary up to 148'200 (tranche 1), 0.5% above (tranche 2).
// ─────────────────────────────────────────────────────

const AC_TRANCHE_1 = 148200;

export function acEmployeeContribution(annualSalary) {
  const tranche1 = Math.min(annualSalary, AC_TRANCHE_1) * 0.011;
  const tranche2 = Math.max(0, annualSalary - AC_TRANCHE_1) * 0.005;
  return tranche1 + tranche2;
}

// ─────────────────────────────────────────────────────
// LPP — 2nd pilier 2025 (legal minimum)
// Salaire coordonné = salaire AVS − 26'460 (déduction de coordination)
// plafonné à 88'200 (salaire LPP max).
// Min annual salary to be insured: 22'050.
// Cotisation rates by age (employee + employer combined; at least 50% by employer):
//   25-34: 7%, 35-44: 10%, 45-54: 15%, 55-65: 18%
// We model employee share = HALF the total (most generous caisses pay more).
// ─────────────────────────────────────────────────────

const LPP_COORDINATION_DEDUCTION = 26460;
const LPP_MAX_INSURED = 88200;
const LPP_MIN_TO_INSURE = 22050;

export function lppCoordinatedSalary(annualSalary) {
  if (annualSalary < LPP_MIN_TO_INSURE) return 0;
  const coordinated = annualSalary - LPP_COORDINATION_DEDUCTION;
  if (coordinated <= 0) return 0;
  return Math.min(coordinated, LPP_MAX_INSURED);
}

export function lppTotalRate(age) {
  if (age < 25) return 0;
  if (age <= 34) return 0.07;
  if (age <= 44) return 0.10;
  if (age <= 54) return 0.15;
  if (age <= 65) return 0.18;
  return 0;
}

export function lppEmployeeContribution(annualSalary, age) {
  const coordinated = lppCoordinatedSalary(annualSalary);
  const total = coordinated * lppTotalRate(age);
  return total / 2; // employee pays half (minimum), employer the other half
}

// ─────────────────────────────────────────────────────
// LAA NP — Assurance accident non-pro
// Typical 0.6-1.4% (sector + caisse), employee-paid (deducted from salary).
// We use 1.0% as a representative national average.
// Applies up to a salary ceiling of 148'200.
// ─────────────────────────────────────────────────────

const LAA_CEILING = 148200;
const LAA_NP_RATE = 0.010;

export function laaNpContribution(annualSalary) {
  return Math.min(annualSalary, LAA_CEILING) * LAA_NP_RATE;
}

// ─────────────────────────────────────────────────────
// LAMal — average monthly premium by canton, adult, basic, franchise 300 CHF
// Source: BAG/OFSP 2025 cantonal averages.
// Premium for an adult on the basic model. Reduce/increase by ±15% for
// HMO/standard, ±30% for franchise 2500.
// ─────────────────────────────────────────────────────

export const LAMAL_ADULT_2025 = {
  AG: 365, AI: 290, AR: 320, BE: 380, BL: 410, BS: 459, FR: 350, GE: 440,
  GL: 305, GR: 330, JU: 405, LU: 340, NE: 410, NW: 295, OW: 290, SG: 320,
  SH: 360, SO: 380, SZ: 305, TG: 320, TI: 410, UR: 300, VD: 410, VS: 395,
  ZG: 295, ZH: 395,
};

export const LAMAL_CHILD_2025 = {
  AG: 100, AI: 80, AR: 90, BE: 110, BL: 115, BS: 130, FR: 95, GE: 125,
  GL: 85, GR: 92, JU: 115, LU: 95, NE: 115, NW: 82, OW: 80, SG: 90,
  SH: 100, SO: 110, SZ: 85, TG: 90, TI: 120, UR: 82, VD: 115, VS: 110,
  ZG: 82, ZH: 110,
};

export function lamalAnnualForHousehold({ canton, civil_status, num_children }) {
  const adult = LAMAL_ADULT_2025[canton] ?? 380;
  const child = LAMAL_CHILD_2025[canton] ?? 100;
  const adults = ['married', 'partnership'].includes(civil_status) ? 2 : 1;
  const kids = Math.max(0, num_children || 0);
  return (adult * adults + child * kids) * 12;
}

// ─────────────────────────────────────────────────────
// Full pipeline — brut → net en main
// Order of operations matches a Swiss payslip:
//   brut → social charges (employee) → net imposable
//   → impôts → LAMal (à payer hors fiche paie) → net en main réel
// ─────────────────────────────────────────────────────

/**
 * @param {object} params
 * @param {number} params.annual_brut — annual gross salary (already × 12 if monthly)
 * @param {number} params.age — for LPP rate selection
 * @param {string} params.canton — for tax + LAMal
 * @param {string} params.civil_status
 * @param {number} params.num_children
 * @param {boolean} [params.has_lpp=true] — cotise LPP?
 * @param {number} [params.lpp_override] — if user knows their actual rate
 * @returns {object} detailed breakdown
 */
export function computeFullBreakdown({
  annual_brut, age, canton, civil_status, num_children,
  has_lpp = true, lpp_override = null,
}) {
  const brut = Math.max(0, annual_brut || 0);

  const avs = brut * avsEmployeeRate();
  const ac = acEmployeeContribution(brut);
  const laa = laaNpContribution(brut);
  const lpp = has_lpp
    ? (lpp_override != null
        ? brut * (lpp_override / 100)
        : lppEmployeeContribution(brut, age || 35))
    : 0;

  const net_imposable = brut - avs - ac - laa - lpp;

  const taxRes = estimateTax({
    income: net_imposable,
    civil_status,
    num_children,
    canton,
  });

  const lamal = lamalAnnualForHousehold({ canton, civil_status, num_children });

  const net_en_main = net_imposable - taxRes.tax - lamal;

  return {
    brut,
    avs,
    ac,
    laa,
    lpp,
    social_total: avs + ac + laa + lpp,
    net_imposable,
    tax: taxRes.tax,
    tax_rate: taxRes.rate,
    lamal,
    net_en_main,
    net_en_main_monthly: net_en_main / 12,
    take_home_ratio: brut > 0 ? net_en_main / brut : 0,
  };
}
