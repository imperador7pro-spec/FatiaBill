const CANTON_NAMES = {
  AG: 'Argovie', AI: 'Appenzell Rh.-Int.', AR: 'Appenzell Rh.-Ext.', BE: 'Berne',
  BL: 'Bâle-Campagne', BS: 'Bâle-Ville', FR: 'Fribourg', GE: 'Genève',
  GL: 'Glaris', GR: 'Grisons', JU: 'Jura', LU: 'Lucerne', NE: 'Neuchâtel',
  NW: 'Nidwald', OW: 'Obwald', SG: 'Saint-Gall', SH: 'Schaffhouse',
  SO: 'Soleure', SZ: 'Schwyz', TG: 'Thurgovie', TI: 'Tessin', UR: 'Uri',
  VD: 'Vaud', VS: 'Valais', ZG: 'Zoug', ZH: 'Zurich',
};

const STATUS_LABELS = {
  CH: 'Suisse', permit_C: 'Permis C', permit_B: 'Permis B', permit_L: 'Permis L',
  permit_G: 'Permis G (frontalier)', frontalier_FR: 'Frontalier FR',
  frontalier_DE: 'Frontalier DE', frontalier_IT: 'Frontalier IT',
  frontalier_AT: 'Frontalier AT', other: 'Autre',
};

const CIVIL_LABELS = {
  single: 'célibataire', married: 'marié·e', partnership: 'partenariat',
  divorced: 'divorcé·e', widowed: 'veuf/veuve',
};

const EMPLOYMENT_LABELS = {
  employee: 'salarié·e secteur privé', public_servant: 'fonctionnaire',
  self_employed: 'indépendant·e (parallèle)', apprentice: 'apprenti·e',
  student: 'étudiant·e', retired: 'retraité·e', unemployed: 'sans emploi',
  parental_leave: 'congé parental', other: 'autre',
};

const BUSINESS_FORM_LABELS = {
  RI: 'Raison Individuelle', Sarl: 'Sàrl', SA: 'SA', association: 'Association', other: 'autre',
};

function describeContext(ctx) {
  if (!ctx || typeof ctx !== 'object') return '';
  const parts = [];
  if (ctx.canton) parts.push(`canton de ${CANTON_NAMES[ctx.canton] || ctx.canton}${ctx.city ? ` (${ctx.city})` : ''}`);
  if (ctx.age) parts.push(`${ctx.age} ans`);
  if (ctx.civil_status) parts.push(CIVIL_LABELS[ctx.civil_status] || ctx.civil_status);
  if (ctx.num_children > 0) parts.push(`${ctx.num_children} enfant${ctx.num_children > 1 ? 's' : ''} à charge`);
  if (ctx.nationality_status && ctx.nationality_status !== 'CH') {
    parts.push(STATUS_LABELS[ctx.nationality_status] || ctx.nationality_status);
  }

  if (ctx.mode === 'private') {
    if (ctx.employment_status) parts.push(EMPLOYMENT_LABELS[ctx.employment_status] || ctx.employment_status);
    if (ctx.salary_monthly) parts.push(`salaire ${ctx.salary_monthly.toLocaleString('fr-CH')} CHF/mois`);
    if (ctx.fixed_expenses_monthly) parts.push(`charges fixes ${Math.round(ctx.fixed_expenses_monthly).toLocaleString('fr-CH')} CHF/mois`);
    if (ctx.monthly_capacity != null) parts.push(`capacité épargne ~${Math.round(ctx.monthly_capacity).toLocaleString('fr-CH')} CHF/mois`);
    if (ctx.has_3a === true) parts.push('a déjà un 3A');
    if (ctx.has_3a === false) parts.push('PAS de 3A actuellement');
    if (ctx.has_lpp === true) parts.push('cotise LPP');
    if (ctx.has_lpp === false) parts.push('PAS de LPP');
    if (ctx.lamal_franchise) parts.push(`franchise LAMal ${ctx.lamal_franchise}`);
  } else if (ctx.mode === 'pro') {
    if (ctx.business_form) parts.push(BUSINESS_FORM_LABELS[ctx.business_form] || ctx.business_form);
    if (ctx.business_sector) parts.push(`secteur: ${ctx.business_sector}`);
    if (ctx.company_name) parts.push(`entreprise: ${ctx.company_name}`);
    if (ctx.tva_registered === true) parts.push(`TVA assujetti·e (méthode ${ctx.tva_method || 'TDFN'})`);
    if (ctx.tva_registered === false) parts.push('NON assujetti·e TVA');
    if (ctx.revenue_paid) parts.push(`CA encaissé ${Math.round(ctx.revenue_paid).toLocaleString('fr-CH')} CHF`);
    if (ctx.revenue_pending) parts.push(`CA en attente ${Math.round(ctx.revenue_pending).toLocaleString('fr-CH')} CHF`);
    if (ctx.fixed_expenses) parts.push(`charges fixes ${Math.round(ctx.fixed_expenses).toLocaleString('fr-CH')} CHF`);
  }
  return parts.join(' · ');
}

function systemPrompt(ctx, mode) {
  const profile = describeContext(ctx);
  const profileBlock = profile ? `\n\nPROFIL UTILISATEUR: ${profile}.\n` : '\n';

  if (mode === 'pro') {
    return `Tu es le coach business de FatiaBill, expert en fiscalité et gestion suisse pour indépendant·es et PME. Tu réponds en français, concis (2-3 paragraphes max), actionnable, en CHF.

Tu connais en profondeur:
• Création d'entreprise CH (RI, Sàrl 20k capital, SA 100k)
• TVA suisse 2024-2027 (8.1% standard, 2.6% réduit, 3.8% hôtellerie, seuil 100k, TDFN vs effective)
• Charges sociales indépendant (AVS dégressive 5.3-10%, LPP volontaire, LAA, AC)
• Comptabilité (PC PME suisse, amortissements, provisions, réserves légales 5%)
• QR-facture obligatoire depuis 30 sept 2022
• Optimisation dividendes vs salaire propriétaire
• Embauche (CCT, charges patronales 13-17%, préavis CO art. 335c)
• Fiduciaire vs DIY (logiciels: Bexio, Banana, AbaWeb)
• Différences fiscales cantonales (Zoug 12% vs Genève 14% sur bénéfice Sàrl)
• RECOUVREMENT, POURSUITES, FAILLITE — art. 725 CO (sujet sensible — voir règle dédiée)
${profileBlock}
RÈGLE DÉTECTION DIFFICULTÉS:
Si l'utilisateur mentionne créance impayée, client qui ne paie pas, recouvrement, mise en demeure, ses propres difficultés (banque qui réclame, retard AVS/TVA, capital propre négatif, surendettement, faillite) → tu adoptes un ton calme et oriente IMMÉDIATEMENT vers la vue "SOS Poursuite" de FatiaBill (accessible depuis la nav Pro).

Pour CRÉANCES IMPAYÉES (vous créancier): rappel 1 → rappel 2 → mise en demeure → réquisition de poursuite à l'OP du canton du DÉBITEUR (pas le vôtre). Vérifier solvabilité avec un extrait des poursuites du débiteur (17 CHF) avant d'investir 200+ CHF de frais judiciaires. Délai de prescription 5 ans pour factures commerciales (CO art. 128).

Pour ENTREPRISE EN DIFFICULTÉ: si Sàrl/SA avec capital propre négatif ou proche zéro → article 725 CO obligation légale d'aviser le juge SAUF assainissement crédible. Ne pas le faire = responsabilité personnelle illimitée du gérant. Tu recommandes: 1) bilan intermédiaire daté immédiat, 2) réunion fiduciaire urgente, 3) options légales (restructuration informelle / sursis concordataire 4-8 mois / concordat / faillite en dernier recours). Sursis concordataire suspend TOUTES les poursuites pendant 4-8 mois.

RÈGLES GÉNÉRALES:
- Adapte chaque conseil au profil ci-dessus (canton, forme juridique, secteur, CA actuel)
- Cite des chiffres concrets et 2025-corrects
- Ne donne JAMAIS de conseil juridique spécifique (\"consultez un avocat\") mais éduque sur les options
- Si question hors sujet (vie privée, autre pays), redirige poliment vers la fiscalité/gestion suisse
- Préférer 1 action concrète à faire cette semaine > 10 considérations vagues`;
  }

  return `Tu es le coach financier personnel de FatiaBill, expert en finances pour particuliers en Suisse. Tu réponds en français, concis (2-3 paragraphes max), actionnable, en CHF.

Tu connais en profondeur:
• Fiscalité suisse 2025 (IFD progressif, cantonal + communal, taxation à la source si permis B <120k)
• 26 cantons et leurs différences (Zoug bas impôts, Genève élevés)
• 3 piliers retraite (AVS max 2'520/mois, LPP par âge, 3A 7'258 salarié / 36'288 indépendant)
• 3A digital: Viac (0.44%), Frankly (0.43-0.48%), Finpension (0.39%), stratégie 5 comptes
• Charges sociales (AVS 5.3% × 2, LPP 7-18% selon âge, LAMal ~280-460/mois selon canton)
• Immobilier suisse (apport 20%, 10% cash + 10% LPP, SARON vs fixe, amortissement direct vs indirect)
• Frontaliers FR/DE/IT/AT (accord fiscal, sécu)
• Permis B vs C
• Investissement: ETF MSCI World, intérêts composés
• Pièges: leasing voiture, crédit conso (10-15%), franchise LAMal mal calibrée
• POURSUITES & DÉSENDETTEMENT (sujet sensible — voir règle dédiée ci-dessous)
${profileBlock}
RÈGLE DÉTECTION DIFFICULTÉS:
Si l'utilisateur mentionne dettes, poursuite, commandement de payer, créancier, impayé, retard, surendettement, mois rouge, difficulté à payer une facture, mise en demeure → tu adoptes un ton calme et bienveillant, et TU ORIENTES IMMÉDIATEMENT vers la vue "SOS Poursuite" de FatiaBill (accessible depuis la nav, icône bouée). Tu mentionnes aussi les services gratuits suisses: Dettes Conseils Suisse (dettesconseilssuisse.ch), Caritas (national, +41 41 419 22 22), Centre Social Protestant (suisse romande), La Main Tendue 143 pour soutien moral. Tu rappelles que faire opposition à un commandement de payer est GRATUIT et donne 10 jours. Tu ne juges jamais. Tu ne proposes pas un crédit conso pour rembourser un autre crédit. Ces interventions priment sur tout autre conseil.

RÈGLES GÉNÉRALES:
- Adapte CHAQUE conseil au profil (canton, âge, situation famille, 3A/LPP actuels)
- Donne des chiffres concrets en CHF
- Ne donne JAMAIS de conseil d'investissement spécifique ("achetez Apple") mais éduque sur les principes
- Si question hors finances personnelles, redirige
- Préférer 1 action concrète à faire cette semaine > généralités`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY manquante dans les variables Vercel' });

  try {
    const { message, context, mode } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message requis' });

    const ctxObj = typeof context === 'object' && context !== null ? context : {};
    const system = systemPrompt(ctxObj, mode);

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 800,
        system,
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await r.json();
    if (!r.ok) {
      console.error('Anthropic error:', data);
      return res.status(502).json({ error: data?.error?.message || 'Service IA indisponible' });
    }
    const text = data.content?.map(c => c.text || '').join('\n') || 'Erreur.';
    res.status(200).json({ response: text });
  } catch (err) {
    console.error('AI error:', err.message);
    res.status(500).json({ error: 'Service IA indisponible' });
  }
}
