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

export const db = {
  // Profile
  getProfile: async (uid) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    return data;
  },
  updateProfile: (uid, u) => supabase.from('profiles').update({ ...u, updated_at: new Date().toISOString() }).eq('id', uid),

  // Expenses
  getExpenses: async (uid) => {
    const { data } = await supabase.from('expenses').select('*').eq('user_id', uid).order('created_at');
    return data || [];
  },
  upsertExpense: (e) => supabase.from('expenses').upsert(e),
  deleteExpense: (id) => supabase.from('expenses').delete().eq('id', id),

  // Transactions
  getTransactions: async (uid) => {
    const { data } = await supabase.from('transactions').select('*').eq('user_id', uid).order('date', { ascending: false });
    return data || [];
  },
  upsertTransaction: (t) => supabase.from('transactions').upsert(t),
  deleteTransaction: (id) => supabase.from('transactions').delete().eq('id', id),

  // Goals
  getGoals: async (uid) => {
    const { data } = await supabase.from('goals').select('*').eq('user_id', uid).order('created_at');
    return data || [];
  },
  upsertGoal: (g) => supabase.from('goals').upsert(g),
  deleteGoal: (id) => supabase.from('goals').delete().eq('id', id),

  // Documents
  getDocuments: async (uid) => {
    const { data } = await supabase.from('documents').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    return data || [];
  },
  insertDocument: (d) => supabase.from('documents').insert(d),

  // Academy
  getProgress: async (uid) => {
    const { data } = await supabase.from('academy_progress').select('*').eq('user_id', uid).single();
    return data;
  },
  upsertProgress: (p) => supabase.from('academy_progress').upsert(p),
};
