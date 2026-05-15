import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(url, key);

export const auth = {
  signUp: (email, pw) => supabase.auth.signUp({ email, password: pw }),
  signIn: (email, pw) => supabase.auth.signInWithPassword({ email, password: pw }),
  signOut: () => supabase.auth.signOut(),
  getUser: async () => (await supabase.auth.getUser()).data.user,
  onAuthChange: (cb) => supabase.auth.onAuthStateChange(cb),
};

const newId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ─────────────────────────────────────────────────────
// Transformers — local shape ↔ DB shape
// We keep the legacy short keys (l, t, s, m, i, cat) in the React state
// so existing views don't have to change, but the DB uses fully named
// columns. Conversion happens at the boundary.
// ─────────────────────────────────────────────────────

const goalToDb = (g, userId) => ({
  id: g.id,
  user_id: userId,
  label: g.l,
  target_amount: g.t,
  saved_amount: g.s ?? 0,
  monthly_amount: g.m === '' || g.m == null ? null : g.m,
  icon: g.i || 'Target',
});

const goalFromDb = (row) => ({
  id: row.id,
  l: row.label,
  t: row.target_amount,
  s: row.saved_amount ?? 0,
  m: row.monthly_amount ?? '',
  i: row.icon || 'Target',
});

const txToDb = (t, userId) => ({
  id: t.id,
  user_id: userId,
  type: t.type,
  amount: t.amount,
  label: t.label,
  category: t.cat || null,
  status: t.status || 'PENDING',
  date: t.date,
});

const txFromDb = (row) => ({
  id: row.id,
  type: row.type,
  amount: Number(row.amount),
  label: row.label,
  date: row.date,
  status: row.status || 'PENDING',
  cat: row.category || null,
});

const expenseToDb = (e, userId, mode) => ({
  id: e.id,
  user_id: userId,
  mode,
  label: e.label,
  category: e.category || null,
  amount: e.amount || 0,
  icon: e.icon || 'Receipt',
});

const expenseFromDb = (row) => ({
  id: row.id,
  label: row.label,
  category: row.category,
  amount: Number(row.amount) || 0,
  icon: row.icon || 'Receipt',
});

const docToDb = (d, userId) => ({
  id: d.id,
  user_id: userId,
  label: d.label,
  amount: d.amount || 0,
  type: d.type,
  category: d.category || null,
  date: d.date,
  vendor: d.vendor || null,
  tva_amount: d.tva_amount ?? null,
});

const docFromDb = (row) => ({
  id: row.id,
  label: row.label,
  amount: Number(row.amount) || 0,
  type: row.type,
  category: row.category,
  date: row.date,
  vendor: row.vendor,
  tva_amount: row.tva_amount != null ? Number(row.tva_amount) : null,
});

export const db = {
  newId,

  // ─── Profile ───
  getProfile: async (uid) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    return data;
  },
  updateProfile: (uid, u) =>
    supabase.from('profiles')
      .update({ ...u, updated_at: new Date().toISOString() })
      .eq('id', uid),

  // ─── Expenses (per-mode) ───
  getExpenses: async (uid, mode) => {
    const { data } = await supabase.from('expenses')
      .select('*')
      .eq('user_id', uid)
      .eq('mode', mode)
      .order('created_at');
    return (data || []).map(expenseFromDb);
  },
  upsertExpense: (e, uid, mode) =>
    supabase.from('expenses').upsert(expenseToDb(e, uid, mode)),
  deleteExpense: (id) => supabase.from('expenses').delete().eq('id', id),

  // ─── Transactions (Pro) ───
  getTransactions: async (uid) => {
    const { data } = await supabase.from('transactions')
      .select('*')
      .eq('user_id', uid)
      .order('date', { ascending: false });
    return (data || []).map(txFromDb);
  },
  upsertTransaction: (t, uid) => supabase.from('transactions').upsert(txToDb(t, uid)),
  deleteTransaction: (id) => supabase.from('transactions').delete().eq('id', id),

  // ─── Goals (Privé) ───
  getGoals: async (uid) => {
    const { data } = await supabase.from('goals')
      .select('*')
      .eq('user_id', uid)
      .order('created_at');
    return (data || []).map(goalFromDb);
  },
  upsertGoal: (g, uid) => supabase.from('goals').upsert(goalToDb(g, uid)),
  deleteGoal: (id) => supabase.from('goals').delete().eq('id', id),

  // ─── Documents (Pro scanner archive) ───
  getDocuments: async (uid) => {
    const { data } = await supabase.from('documents')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    return (data || []).map(docFromDb);
  },
  insertDocument: (d, uid) => supabase.from('documents').insert(docToDb(d, uid)),

  // ─── Academy progress ───
  getProgress: async (uid) => {
    const { data } = await supabase.from('academy_progress').select('*').eq('user_id', uid).single();
    return data;
  },
  upsertProgress: (p) => supabase.from('academy_progress').upsert(p),
};
