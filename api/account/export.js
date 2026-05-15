import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return res.status(500).json({ error: 'Service Supabase non configuré côté serveur' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentification requise' });

  const admin = createClient(url, serviceKey);

  let user;
  try {
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Session invalide' });
    user = data.user;
  } catch (e) {
    return res.status(401).json({ error: 'Impossible de vérifier la session' });
  }

  const uid = user.id;

  try {
    const [profile, expenses, transactions, goals, documents, progress] = await Promise.all([
      admin.from('profiles').select('*').eq('id', uid).maybeSingle(),
      admin.from('expenses').select('*').eq('user_id', uid),
      admin.from('transactions').select('*').eq('user_id', uid),
      admin.from('goals').select('*').eq('user_id', uid),
      admin.from('documents').select('*').eq('user_id', uid),
      admin.from('academy_progress').select('*').eq('user_id', uid).maybeSingle(),
    ]);

    const exportData = {
      meta: {
        service: 'FatiaBill',
        editor: 'Duares Systems',
        exported_at: new Date().toISOString(),
        format_version: '1.0',
        note: 'Export complet de toutes les données associées à votre compte FatiaBill. Conforme RGPD art. 20 (droit à la portabilité) et LPD suisse.',
      },
      account: {
        id: uid,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      },
      profile: profile.data || null,
      expenses: expenses.data || [],
      transactions: transactions.data || [],
      goals: goals.data || [],
      documents: documents.data || [],
      academy_progress: progress.data || null,
    };

    const filename = `fatiabill-export-${uid.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(JSON.stringify(exportData, null, 2));
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: err?.message || 'Erreur lors de l\'export' });
  }
}
