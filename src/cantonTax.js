// Swiss tax estimator — 2025 approximations.
// All rates are *effective combined* rates (IFD + cantonal + communal at the cantonal capital)
// for a single person with no children at the given income points. We interpolate linearly
// between points and apply rough adjustments for civil status + children.
//
// SOURCES: ESTV public comparator, Comparis 2024-2025 tax tables, cantonal tax offices.
// PRECISION: ±15% — adequate for ranking cantons and showing order of magnitude,
// NOT a replacement for an official calculation by your fiduciary.

// Effective combined tax rate (%) for a SINGLE person, no children,
// at the cantonal capital city, on the given gross income (CHF).
// Format: { 50000: 0.10, 100000: 0.18, 200000: 0.28, ... }
const SINGLE_RATES = {
  ZG: { 50000: 0.040, 80000: 0.073, 100000: 0.095, 150000: 0.135, 200000: 0.160, 300000: 0.185, 500000: 0.205 },
  SZ: { 50000: 0.048, 80000: 0.083, 100000: 0.108, 150000: 0.150, 200000: 0.175, 300000: 0.205, 500000: 0.225 },
  NW: { 50000: 0.052, 80000: 0.088, 100000: 0.110, 150000: 0.153, 200000: 0.178, 300000: 0.205, 500000: 0.225 },
  OW: { 50000: 0.058, 80000: 0.095, 100000: 0.118, 150000: 0.160, 200000: 0.185, 300000: 0.215, 500000: 0.238 },
  AI: { 50000: 0.060, 80000: 0.098, 100000: 0.120, 150000: 0.163, 200000: 0.188, 300000: 0.217, 500000: 0.240 },
  UR: { 50000: 0.062, 80000: 0.100, 100000: 0.122, 150000: 0.165, 200000: 0.190, 300000: 0.220, 500000: 0.245 },
  AR: { 50000: 0.063, 80000: 0.103, 100000: 0.125, 150000: 0.170, 200000: 0.195, 300000: 0.225, 500000: 0.248 },
  GR: { 50000: 0.072, 80000: 0.113, 100000: 0.140, 150000: 0.180, 200000: 0.205, 300000: 0.235, 500000: 0.258 },
  TG: { 50000: 0.073, 80000: 0.115, 100000: 0.142, 150000: 0.183, 200000: 0.208, 300000: 0.238, 500000: 0.260 },
  GL: { 50000: 0.075, 80000: 0.118, 100000: 0.145, 150000: 0.185, 200000: 0.210, 300000: 0.240, 500000: 0.262 },
  SH: { 50000: 0.078, 80000: 0.120, 100000: 0.148, 150000: 0.188, 200000: 0.213, 300000: 0.243, 500000: 0.265 },
  LU: { 50000: 0.078, 80000: 0.123, 100000: 0.150, 150000: 0.190, 200000: 0.215, 300000: 0.243, 500000: 0.265 },
  SG: { 50000: 0.082, 80000: 0.128, 100000: 0.158, 150000: 0.198, 200000: 0.223, 300000: 0.253, 500000: 0.275 },
  ZH: { 50000: 0.085, 80000: 0.130, 100000: 0.160, 150000: 0.200, 200000: 0.225, 300000: 0.255, 500000: 0.278 },
  SO: { 50000: 0.088, 80000: 0.133, 100000: 0.163, 150000: 0.203, 200000: 0.228, 300000: 0.258, 500000: 0.280 },
  BS: { 50000: 0.090, 80000: 0.138, 100000: 0.170, 150000: 0.210, 200000: 0.235, 300000: 0.265, 500000: 0.288 },
  AG: { 50000: 0.090, 80000: 0.135, 100000: 0.168, 150000: 0.208, 200000: 0.233, 300000: 0.263, 500000: 0.285 },
  TI: { 50000: 0.095, 80000: 0.140, 100000: 0.172, 150000: 0.212, 200000: 0.237, 300000: 0.267, 500000: 0.290 },
  FR: { 50000: 0.098, 80000: 0.143, 100000: 0.175, 150000: 0.215, 200000: 0.240, 300000: 0.270, 500000: 0.295 },
  VS: { 50000: 0.100, 80000: 0.148, 100000: 0.180, 150000: 0.220, 200000: 0.245, 300000: 0.275, 500000: 0.298 },
  BL: { 50000: 0.103, 80000: 0.150, 100000: 0.183, 150000: 0.223, 200000: 0.248, 300000: 0.278, 500000: 0.300 },
  BE: { 50000: 0.110, 80000: 0.158, 100000: 0.190, 150000: 0.230, 200000: 0.255, 300000: 0.285, 500000: 0.310 },
  VD: { 50000: 0.115, 80000: 0.163, 100000: 0.195, 150000: 0.235, 200000: 0.262, 300000: 0.292, 500000: 0.315 },
  JU: { 50000: 0.117, 80000: 0.165, 100000: 0.198, 150000: 0.238, 200000: 0.265, 300000: 0.295, 500000: 0.318 },
  NE: { 50000: 0.120, 80000: 0.170, 100000: 0.202, 150000: 0.242, 200000: 0.268, 300000: 0.298, 500000: 0.320 },
  GE: { 50000: 0.122, 80000: 0.172, 100000: 0.208, 150000: 0.248, 200000: 0.275, 300000: 0.305, 500000: 0.328 },
};

// Marriage typically reduces effective rate by 10-25% depending on canton (splitting / quotient).
// We model as a multiplicative discount applied to the SINGLE_RATES rate.
const MARRIED_DISCOUNT = {
  default: 0.85, // generic ~15% discount
  ZG: 0.83, SZ: 0.84, NW: 0.84, OW: 0.85, AI: 0.85, UR: 0.85, AR: 0.85, GR: 0.86,
  TG: 0.86, GL: 0.86, SH: 0.87, LU: 0.86, SG: 0.87, ZH: 0.86, SO: 0.87, BS: 0.87,
  AG: 0.86, TI: 0.85, FR: 0.85, VS: 0.84, BL: 0.86, BE: 0.86, VD: 0.83, JU: 0.85,
  NE: 0.84, GE: 0.78, // GE uses splitting integral, big discount
};

// Child deduction (per child, applied to taxable income at the cantonal capital).
const CHILD_DEDUCTION = {
  default: 9000,
  ZG: 12000, SZ: 9000, NW: 8000, OW: 9000, AI: 8000, UR: 8000, AR: 8000, GR: 8500,
  TG: 8000, GL: 7000, SH: 8400, LU: 8000, SG: 11500, ZH: 9000, SO: 11000, BS: 7800,
  AG: 7500, TI: 11000, FR: 9700, VS: 9500, BL: 7500, BE: 8000, VD: 10500, JU: 8500,
  NE: 6500, GE: 13000,
};

// Linear interpolation between known income points.
function interpolateRate(rates, income) {
  const points = Object.keys(rates).map(Number).sort((a, b) => a - b);
  if (income <= points[0]) return rates[points[0]];
  if (income >= points[points.length - 1]) return rates[points[points.length - 1]];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (income >= a && income <= b) {
      const t = (income - a) / (b - a);
      return rates[a] + t * (rates[b] - rates[a]);
    }
  }
  return rates[points[points.length - 1]];
}

/**
 * Estimate annual taxes for a person in a given canton.
 * @param {object} params
 * @param {number} params.income — Annual gross income CHF (after AVS, before tax)
 * @param {'single' | 'married' | 'partnership' | 'divorced' | 'widowed'} params.civil_status
 * @param {number} params.num_children — 0+
 * @param {string} params.canton — 2-letter code (e.g. 'VD')
 * @returns {{ rate: number, tax: number, net: number }}
 */
export function estimateTax({ income, civil_status, num_children, canton }) {
  if (!income || !canton || !SINGLE_RATES[canton]) {
    return { rate: 0, tax: 0, net: income || 0 };
  }
  const children = Math.max(0, num_children || 0);
  const childDed = (CHILD_DEDUCTION[canton] ?? CHILD_DEDUCTION.default) * children;
  const taxableIncome = Math.max(0, income - childDed);
  const baseRate = interpolateRate(SINGLE_RATES[canton], taxableIncome);
  const isCoupled = ['married', 'partnership'].includes(civil_status);
  const discount = isCoupled ? (MARRIED_DISCOUNT[canton] ?? MARRIED_DISCOUNT.default) : 1;
  const effectiveRate = baseRate * discount;
  const tax = Math.round(taxableIncome * effectiveRate);
  return {
    rate: effectiveRate,
    tax,
    net: income - tax,
    taxable_income: taxableIncome,
  };
}

/**
 * Rank all 26 cantons by estimated tax for the given profile.
 * @returns {Array<{canton, rate, tax, net, gap_vs_current, rank}>}
 */
export function rankCantons({ income, civil_status, num_children, currentCanton }) {
  const results = Object.keys(SINGLE_RATES).map((c) => ({
    canton: c,
    ...estimateTax({ income, civil_status, num_children, canton: c }),
  }));
  results.sort((a, b) => a.tax - b.tax);
  const current = results.find((r) => r.canton === currentCanton);
  return results.map((r, i) => ({
    ...r,
    rank: i + 1,
    gap_vs_current: current ? current.tax - r.tax : 0,
  }));
}

export const CANTON_INCOME_POINTS = [50000, 80000, 100000, 150000, 200000, 300000, 500000];
