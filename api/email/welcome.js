import { requireUser } from '../_lib/auth.js';
import { sendWelcomeEmail } from '../_lib/email.js';
import { withSentry, captureException } from '../_lib/sentry.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireUser(req, res);
  if (!auth) return;

  const uid = auth.user.id;
  const email = auth.user.email;
  if (!email) return res.status(400).json({ error: 'Email manquant sur le compte' });

  try {
    // Idempotency: only send once. Profile column welcome_email_sent_at.
    const { data: profile } = await auth.admin
      .from('profiles')
      .select('first_name, welcome_email_sent_at')
      .eq('id', uid)
      .maybeSingle();

    if (profile?.welcome_email_sent_at) {
      return res.status(200).json({ ok: true, already_sent: true });
    }

    const result = await sendWelcomeEmail({
      to: email,
      firstName: profile?.first_name || '',
    });

    if (result?.error) {
      // Email failure shouldn't block the user — log and return 200.
      await captureException(result.error, { route: 'email/welcome', userId: uid });
      return res.status(200).json({ ok: true, email_skipped: true });
    }

    if (!result?.skipped) {
      await auth.admin
        .from('profiles')
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq('id', uid);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    await captureException(err, { route: 'email/welcome', userId: uid });
    res.status(500).json({ error: 'Erreur envoi email de bienvenue' });
  }
}

export default withSentry(handler, 'email/welcome');
