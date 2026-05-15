// Politique de confidentialité · FatiaBill
// Last updated: 2026-05-15
// PROJECT TEMPLATE — to be reviewed by a Swiss lawyer before production launch.
// Conformity targets: LPD (Suisse) + RGPD (UE/EEE) pour users résidents UE.

export const PRIVACY_POLICY = {
  title: 'Politique de confidentialité',
  updated: '15 mai 2026',
  sections: [
    {
      title: '1. Préambule',
      paragraphs: [
        'Chez FatiaBill, nous prenons la protection de vos données personnelles au sérieux. Cette politique explique quelles données nous collectons, pourquoi, qui y a accès, combien de temps nous les conservons et quels sont vos droits.',
        'Nous nous conformons à la **Loi fédérale suisse sur la protection des données (LPD, révisée 2023)** et, pour les utilisateurs résidant dans l\'Union européenne, au **Règlement général sur la protection des données (RGPD)**.',
        '**Responsable du traitement** : Duares Systems, Rue du Village 18, 1123 Aclens, Suisse. Contact : hello@fatiabill.ch.',
      ],
    },
    {
      title: '2. Données que nous collectons',
      paragraphs: [
        '**Données de compte (obligatoires)** : email et mot de passe chiffré pour l\'authentification.',
        '**Données de profil (renseignées par vous lors de l\'onboarding)** : prénom, nom, année de naissance, canton, ville, statut de résidence (suisse, permis B/C/G, frontalier), situation familiale, enfants à charge, statut professionnel ou forme juridique d\'entreprise, IBAN (pour les utilisateurs Pro).',
        '**Données financières que vous saisissez** : salaire, charges fixes, transactions, objectifs d\'épargne, documents scannés (reçus, factures), questions au coach IA.',
        '**Données techniques** : adresse IP (pour la sécurité), navigateur, langue (pour l\'affichage), date et heure de connexion.',
        '**Données de facturation** (pour les abonnés Premium) : adresse de facturation, méthode de paiement. Ces informations sont gérées et stockées par **Stripe**, nous n\'avons pas accès à votre numéro de carte.',
      ],
    },
    {
      title: '3. Finalités du traitement',
      paragraphs: [
        'Nous utilisons vos données exclusivement pour :',
        '• Fournir le service FatiaBill (dashboard, calculs fiscaux personnalisés, coach IA contextuel, génération de factures QR-bill, simulateur cantonal)',
        '• Adapter les calculs et conseils à votre situation suisse réelle (canton, âge, prévoyance, situation familiale)',
        '• Gérer votre abonnement et la facturation',
        '• Répondre à vos demandes de support',
        '• Améliorer le produit (analytics agrégée et anonyme uniquement)',
        '• Respecter nos obligations légales (comptabilité suisse, lutte contre le blanchiment si applicable)',
        '**Ce que nous ne faisons JAMAIS** : vendre ou louer vos données à des tiers. Diffuser de la publicité ciblée. Partager vos données avec des courtiers de données, des assureurs, des banques, votre employeur ou les autorités fiscales (sauf obligation légale formelle).',
      ],
    },
    {
      title: '4. Sous-traitants',
      paragraphs: [
        'Pour fournir le service, nous utilisons les sous-traitants suivants, tous soumis à des engagements contractuels de confidentialité et de sécurité (DPA) :',
        '**Supabase (Singapour, instance EU Francfort)** — Hébergement de la base de données et authentification. Vos données structurées sont stockées en Allemagne.',
        '**Vercel (États-Unis, workloads EU)** — Hébergement de l\'application web et exécution des fonctions serverless. Configuration de la région EU pour les workloads par défaut.',
        '**Stripe (Irlande / États-Unis)** — Traitement des paiements. Aucune donnée bancaire n\'est stockée chez nous.',
        '**Anthropic (États-Unis)** — Modèle d\'intelligence artificielle (Claude Haiku 4.5) pour le coach IA et le scanner de factures. Les requêtes sont chiffrées en transit et ne sont **pas conservées** par Anthropic pour entraîner des modèles (Anthropic API zero retention policy).',
        '**Resend (États-Unis / Irlande)** — Envoi des emails transactionnels (bienvenue, réinitialisation de mot de passe, envoi de factures clients).',
        'Pour les transferts hors UE/CH (États-Unis), nous nous appuyons sur les Clauses Contractuelles Types (CCT) de la Commission européenne et le Data Privacy Framework (DPF) UE-US lorsque applicable.',
      ],
    },
    {
      title: '5. Durée de conservation',
      paragraphs: [
        '**Compte actif** : nous conservons vos données aussi longtemps que votre compte est actif.',
        '**Après suppression du compte** : suppression complète des données dans un délai de 30 jours, sauf obligation légale de conservation (factures émises, données comptables de FatiaBill au sens de l\'art. 958f CO — 10 ans).',
        '**Données techniques (logs)** : 30 jours maximum.',
        '**Données de facturation Stripe** : 10 ans, conformément aux obligations comptables suisses (CO art. 958f).',
      ],
    },
    {
      title: '6. Vos droits',
      paragraphs: [
        'Conformément à la LPD et au RGPD, vous disposez des droits suivants sur vos données personnelles :',
        '• **Droit d\'accès** — obtenir une copie de vos données',
        '• **Droit de rectification** — corriger toute information inexacte',
        '• **Droit à l\'effacement** ("droit à l\'oubli") — demander la suppression de vos données',
        '• **Droit à la portabilité** — recevoir vos données dans un format structuré (JSON)',
        '• **Droit d\'opposition** — vous opposer au traitement pour motif légitime',
        '• **Droit de retirer votre consentement** à tout moment',
        'Pour exercer ces droits :',
        '• **Export de vos données** (portabilité) : Réglages → "Mes données" → "Télécharger ma copie (.json)". Vous obtenez immédiatement un fichier JSON contenant tout votre profil, vos transactions, objectifs, scans et progression.',
        '• **Suppression de compte** (droit à l\'oubli) : Réglages → "Mes données" → "Supprimer définitivement mon compte". La suppression est effective immédiatement côté authentification, et les données opérationnelles sont effacées sous 30 jours.',
        '• **Autres droits** (rectification, opposition, accès aux logs) : écrivez à **hello@fatiabill.ch**. Réponse sous 30 jours.',
        'Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer plainte auprès du **Préposé fédéral à la protection des données et à la transparence (PFPDT)** à Berne : edoeb.admin.ch.',
      ],
    },
    {
      title: '7. Sécurité',
      paragraphs: [
        'Nous prenons des mesures techniques et organisationnelles pour protéger vos données :',
        '• Chiffrement TLS 1.3 en transit (HTTPS partout)',
        '• Chiffrement au repos pour la base de données (Supabase)',
        '• Authentification par mot de passe haché (bcrypt)',
        '• Politiques d\'accès Row-Level Security : chaque utilisateur ne peut accéder qu\'à ses propres données',
        '• Sauvegardes automatiques quotidiennes',
        '• Audits de sécurité périodiques',
        'Aucun système n\'est inviolable. Si vous suspectez un accès non autorisé à votre compte, changez immédiatement votre mot de passe et contactez-nous.',
      ],
    },
    {
      title: '8. Cookies',
      paragraphs: [
        'FatiaBill utilise uniquement des cookies **strictement nécessaires** au fonctionnement du service :',
        '• **Cookie de session** (Supabase) — pour vous garder connecté',
        '• **Cookie de paiement** (Stripe) — pour traiter votre abonnement',
        '• **Préférence d\'interface** (localStorage) — pour mémoriser le mode sombre et la bannière d\'information',
        'Nous **n\'utilisons pas** de cookies de tracking, de publicité, ni de réseaux sociaux. Aucun pixel Meta/Google/TikTok n\'est installé.',
      ],
    },
    {
      title: '9. Données des mineurs',
      paragraphs: [
        'FatiaBill n\'est pas destiné aux personnes de moins de 16 ans. Nous ne collectons pas sciemment de données de mineurs. Si vous êtes parent ou tuteur et constatez qu\'un mineur de moins de 16 ans nous a transmis ses données, contactez-nous pour suppression immédiate.',
      ],
    },
    {
      title: '10. Modifications de cette politique',
      paragraphs: [
        'Nous pouvons mettre à jour cette politique pour refléter des évolutions du service ou des obligations légales. Toute modification substantielle sera notifiée par email aux utilisateurs actifs au moins 30 jours avant son entrée en vigueur. La date de dernière mise à jour est indiquée en haut de cette page.',
      ],
    },
    {
      title: '11. Contact',
      paragraphs: [
        'Pour toute question relative à la confidentialité de vos données :\n**hello@fatiabill.ch**',
        'Adresse postale :\nDuares Systems — Délégué à la protection des données\nRue du Village 18\n1123 Aclens, Suisse',
      ],
    },
  ],
};
