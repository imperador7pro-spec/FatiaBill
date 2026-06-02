import { createClient } from '@supabase/supabase-js';

let cachedAdmin = null;
function admin() {
  if (cachedAdmin) return cachedAdmin;
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  cachedAdmin = createClient(url, key, { auth: { persistSession: false } });
  return cachedAdmin;
}

export async function requireUser(req, res) {
  const a = admin();
  if (!a) {
    res.status(500).json({ error: 'Service Supabase non configuré' });
    return null;
  }
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Authentification requise' });
    return null;
  }
  try {
    const { data, error } = await a.auth.getUser(token);
    if (error || !data?.user) {
      res.status(401).json({ error: 'Session invalide' });
      return null;
    }
    return { user: data.user, admin: a };
  } catch (e) {
    res.status(401).json({ error: 'Impossible de vérifier la session' });
    return null;
  }
}

export function getAdmin() {
  return admin();
}
