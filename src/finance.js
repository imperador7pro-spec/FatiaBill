import { INVESTMENT_PRODUCTS } from './data.js';

export function computeFinance({ mode, salary, expenses, transactions }) {
  const empty = {
    remaining: 0, savings: 0, freeMoney: 0, monthlyCapacity: 0,
    paidRevenue: 0, expectedRevenue: 0, fixedExpenses: 0,
    paidSuppliers: 0, expectedSuppliers: 0,
    vat: 0, avs: 0, tax: 0,
    profitAndLoss: { revenue: 0, expenseByCategory: {}, fixed: 0, ebit: 0 },
  };

  if (mode === 'private') {
    const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const remaining = Math.max(0, salary - totalExpenses);
    const savings = remaining * 0.2;
    const freeMoney = Math.max(0, remaining - savings);
    return { ...empty, remaining, savings, freeMoney, monthlyCapacity: savings };
  }

  if (mode === 'pro') {
    let paidRevenue = 0, expectedRevenue = 0, paidSuppliers = 0, expectedSuppliers = 0;
    const expenseByCategory = {};
    for (const t of transactions) {
      const amount = parseFloat(t.amount || 0);
      if (t.type === 'IN') {
        if (t.status === 'PAID') paidRevenue += amount; else expectedRevenue += amount;
      } else {
        if (t.status === 'PAID') paidSuppliers += amount; else expectedSuppliers += amount;
        const cat = t.cat || 'Divers';
        expenseByCategory[cat] = (expenseByCategory[cat] || 0) + amount;
      }
    }
    const fixedExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const vat = paidRevenue * 0.081;
    const netProfit = Math.max(0, (paidRevenue - vat) - fixedExpenses - paidSuppliers);
    const avs = netProfit * 0.1;
    const tax = netProfit * 0.15;
    const remaining = Math.max(0, paidRevenue - (vat + avs + tax) - fixedExpenses - paidSuppliers);
    const savings = remaining * 0.3;
    const profitAndLoss = {
      revenue: paidRevenue + expectedRevenue,
      expenseByCategory,
      fixed: fixedExpenses,
      ebit: (paidRevenue + expectedRevenue) - (fixedExpenses + paidSuppliers + expectedSuppliers),
    };
    return {
      ...empty, remaining, savings, monthlyCapacity: savings,
      paidRevenue, expectedRevenue, fixedExpenses, paidSuppliers, expectedSuppliers,
      vat, avs, tax, profitAndLoss,
    };
  }

  return empty;
}

export function computeGoalProjection(goal, defaultMonthly) {
  const target = parseFloat(goal.t) || 0;
  const saved = parseFloat(goal.s) || 0;
  const remainder = Math.max(0, target - saved);
  const monthly = parseFloat(goal.m) || defaultMonthly;

  if (monthly <= 0 || remainder <= 0) return { ms: 0, ps: [] };

  const monthsLinear = Math.ceil(remainder / monthly);
  const products = INVESTMENT_PRODUCTS.map((p) => {
    const rateMonthly = p.r / 12;
    let months;
    if (rateMonthly === 0) {
      months = monthsLinear;
    } else {
      const v = (remainder * rateMonthly) / monthly + 1;
      months = v <= 0 ? monthsLinear : Math.ceil(Math.log(v) / Math.log(1 + rateMonthly));
    }
    months = Math.max(1, months);
    const invested = monthly * months;
    const total = rateMonthly > 0
      ? monthly * ((Math.pow(1 + rateMonthly, months) - 1) / rateMonthly)
      : invested;
    return {
      ...p,
      ms: months,
      yrs: (months / 12).toFixed(1),
      inv: invested,
      tot: total,
      gains: total - invested,
      saved: Math.max(0, monthsLinear - months),
    };
  });

  return { ms: monthsLinear, ps: products, mo: monthly, r: remainder };
}
