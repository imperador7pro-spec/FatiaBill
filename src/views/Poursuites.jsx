import React from 'react';
import {
  LifeBuoy, AlertTriangle, Phone, Globe, ArrowRight, CheckCircle2, XCircle,
  Clock, FileText, Scale, Heart, Building2, Briefcase, Snowflake, Shield, AlertCircle,
} from 'lucide-react';

const ROSE_GRADIENT_LIGHT = 'from-rose-50 via-stone-50 to-amber-50/30';
const ROSE_GRADIENT_DARK = 'from-rose-950/40 via-zinc-950 to-amber-950/20';

export function Poursuites({ theme, mode }) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-4">
      <Hero theme={theme} />
      <Reassurance theme={theme} />
      {mode === 'pro' ? (
        <ProSections theme={theme} />
      ) : (
        <PrivateSections theme={theme} />
      )}
      <CommonSection theme={theme} mode={mode} />
      <DisclaimerFooter theme={theme} />
    </div>
  );
}

function Hero({ theme }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border-2 border-rose-500/30 p-6 ${theme.dk ? `bg-gradient-to-br ${ROSE_GRADIENT_DARK}` : `bg-gradient-to-br ${ROSE_GRADIENT_LIGHT}`}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0">
          <LifeBuoy size={26} />
        </div>
        <div className="flex-1">
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme.dk ? 'text-rose-300' : 'text-rose-700'}`}>
            SOS Poursuite
          </p>
          <h2 className={`text-xl md:text-2xl font-black tracking-tight ${theme.tx}`}>
            En difficulté financière ? Vous n'êtes pas seul·e.
          </h2>
          <p className={`text-sm mt-2 ${theme.mt}`}>
            <strong className={theme.tx}>1 personne sur 7 en Suisse</strong> a des dettes. Voici comment agir maintenant, étape par étape, sans paniquer — et trouver de l'aide gratuite près de chez vous.
          </p>
        </div>
      </div>
    </div>
  );
}

function Reassurance({ theme }) {
  return (
    <div className={`p-4 rounded-2xl border ${theme.dk ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
      <div className="flex items-start gap-3">
        <Heart size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className={`font-black ${theme.tx}`}>Tous les services listés ici sont gratuits et confidentiels.</p>
          <p className={`mt-1 ${theme.mt}`}>
            En Suisse, demander conseil à un service de désendettement <strong>n'apparaît nulle part</strong> — ni au casier, ni à votre employeur, ni à votre banque. Vous pouvez consulter sans risque.
          </p>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────
// PRIVÉ — particulier
// ───────────────────────────────────────────────────

function PrivateSections({ theme }) {
  return (
    <>
      <AlertsSection theme={theme} />
      <ActionsSection theme={theme} mode="private" />
      <ResourcesPrivate theme={theme} />
      <CommandementSection theme={theme} />
      <SnowballSection theme={theme} />
      <RegistreSection theme={theme} />
    </>
  );
}

function AlertsSection({ theme }) {
  const signals = [
    'Plus de 30 jours de retard sur une facture importante',
    'Vous n\'avez pas pu payer le loyer ce mois',
    'Votre caisse maladie a envoyé une mise en demeure',
    'Un ou plusieurs crédits à la consommation sont ouverts',
    'Vous évitez d\'ouvrir votre courrier',
    'Votre compte est à zéro avant la fin du mois',
    'Vous empruntez à des proches pour boucler',
    'Vous ne savez pas exactement combien vous devez',
  ];
  return (
    <Card theme={theme} icon={AlertTriangle} iconColor="amber" title="1. Évaluez votre situation">
      <p className={`text-xs mb-3 ${theme.mt}`}>
        Cochez mentalement les signaux qui vous concernent :
      </p>
      <ul className="space-y-1.5">
        {signals.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-xs">
            <span className={`w-4 h-4 rounded border-2 ${theme.bd} mt-0.5 flex-shrink-0`} />
            <span className={theme.tx}>{s}</span>
          </li>
        ))}
      </ul>
      <div className={`mt-4 p-3 rounded-xl text-[11px] ${theme.dk ? 'bg-amber-950/30 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'}`}>
        <p className={`font-black ${theme.tx}`}>Comptez vos cases cochées :</p>
        <p className={`mt-1 ${theme.mt}`}>
          <strong className="text-amber-600">2 à 3 :</strong> zone de vigilance. Agissez cette semaine.<br />
          <strong className="text-rose-600">4 ou plus :</strong> urgence. Contactez un service d'aide aujourd'hui.
        </p>
      </div>
    </Card>
  );
}

function ActionsSection({ theme, mode }) {
  const actions = mode === 'private' ? [
    { title: 'Listez TOUTES vos dettes en une page', body: 'Créancier · montant · date d\'échéance · statut (rappel, mise en demeure, poursuite). Sans ce panorama clair, impossible de prioriser.' },
    { title: 'Calculez votre capacité résiduelle', body: 'Revenus mensuels nets − loyer − LAMal − alimentation − transport = ce qu\'il reste réellement pour rembourser. Souvent moins qu\'on pense.' },
    { title: 'Contactez chaque créancier AVANT la mise en demeure', body: 'Demandez un échelonnement ou un délai. 90% des créanciers acceptent, par écrit ou téléphone. Une fois en poursuite, ils sont moins flexibles.' },
    { title: 'NE prenez JAMAIS un crédit pour rembourser un crédit', body: 'Les crédits conso à 9-12% empirent toujours la situation. C\'est le piège n°1 du surendettement. Si on vous propose ça, c\'est un signal que vous devez voir un service de désendettement.' },
    { title: 'Demandez aide à un service de désendettement', body: 'Gratuit, anonyme, sans jugement. Liste ci-dessous. Ces conseillers négocient avec les créanciers à votre place et établissent un plan réaliste.' },
  ] : [
    { title: 'Faites un état des lieux complet', body: 'Encaissements à 30/60/90 jours. Engagements fournisseurs. AVS/TVA/impôts dus. Banque. Une feuille A4 suffit pour clarifier.' },
    { title: 'Réunion fiduciaire URGENTE', body: 'Si capital propre proche zéro ou négatif (Sàrl/SA), c\'est obligatoire — art. 725 CO. Le gérant qui n\'agit pas engage sa responsabilité personnelle.' },
    { title: 'Communiquez avec vos créanciers', body: 'Fournisseurs principaux, banque, AVS, TVA. Demandez un échelonnement avec calendrier réaliste. Mieux qu\'une poursuite — ils préfèrent récupérer 80% sur 12 mois que 0% en faillite.' },
    { title: 'Identifiez les fuites', body: 'Stocks dormants, abonnements inutiles, sous-traitants en double, frais représentation excessifs. Coupez maintenant, pas l\'année prochaine.' },
    { title: 'Évaluez sursis concordataire vs faillite', body: 'Avec votre fiduciaire/avocat. Le sursis (4-6 mois) protège de toutes poursuites pendant que vous restructurez. La faillite n\'est PAS le seul chemin.' },
  ];

  return (
    <Card theme={theme} icon={Clock} iconColor="rose" title={`2. Actions immédiates ${mode === 'private' ? 'à faire cette semaine' : '— ne pas attendre'}`}>
      <div className="space-y-3">
        {actions.map((a, i) => (
          <div key={i} className={`flex gap-3 p-3 rounded-xl ${theme.dk ? 'bg-zinc-900' : 'bg-stone-50'}`}>
            <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-black text-xs ${theme.tx}`}>{a.title}</p>
              <p className={`text-[11px] mt-1 leading-relaxed ${theme.mt}`}>{a.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ResourcesPrivate({ theme }) {
  const resources = [
    {
      name: 'Dettes Conseils Suisse',
      tagline: 'Fédération nationale des services de désendettement',
      desc: 'Annuaire de tous les services de désendettement par canton. Conseil gratuit, premier RDV souvent dans la semaine.',
      web: 'dettesconseilssuisse.ch',
      tel: null,
      coverage: 'Toute la Suisse',
    },
    {
      name: 'Caritas',
      tagline: 'Services désendettement cantonaux',
      desc: 'Antennes dans 15+ cantons. Bilan budget gratuit, négociation avec créanciers, gestion de votre courrier juridique si besoin.',
      web: 'caritas.ch',
      tel: '+41 41 419 22 22',
      coverage: 'Toute la Suisse',
    },
    {
      name: 'Centre Social Protestant (CSP)',
      tagline: 'Service Dettes — sans confession requise',
      desc: 'Consultations gratuites en Suisse romande. Spécialisé désendettement, accompagnement long terme possible.',
      web: 'csp.ch',
      tel: null,
      coverage: 'GE · VD · NE · BE · JU',
    },
    {
      name: 'Pro Senectute',
      tagline: 'Pour personnes de 60 ans et plus',
      desc: 'Conseil budget et désendettement adapté aux retraités. Aide pour comprendre les courriers de l\'office des poursuites.',
      web: 'prosenectute.ch',
      tel: '+41 44 283 89 89',
      coverage: 'Toute la Suisse',
    },
    {
      name: 'Service social de votre commune',
      tagline: 'Premier guichet local',
      desc: 'Toutes les communes ont un service social. Aide d\'urgence (alimentation, loyer), orientation vers les bons services. Anonyme.',
      web: null,
      tel: 'Mairie / administration communale',
      coverage: 'Toutes communes CH',
    },
  ];

  return (
    <Card theme={theme} icon={LifeBuoy} iconColor="emerald" title="3. À qui s'adresser — services GRATUITS">
      <p className={`text-xs mb-3 ${theme.mt}`}>
        Ces organisations existent pour aider. Elles voient des dossiers bien plus complexes que le vôtre tous les jours. Aucun jugement, aucune trace publique de votre démarche.
      </p>
      <div className="space-y-3">
        {resources.map((r) => (
          <ResourceCard key={r.name} theme={theme} resource={r} />
        ))}
      </div>
    </Card>
  );
}

function ResourceCard({ theme, resource }) {
  return (
    <div className={`p-4 rounded-2xl border ${theme.bd} ${theme.cd}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className={`font-black text-sm ${theme.tx}`}>{resource.name}</p>
          <p className={`text-[10px] font-bold ${theme.dk ? 'text-emerald-400' : 'text-emerald-600'} mt-0.5`}>
            {resource.tagline}
          </p>
        </div>
        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${theme.dk ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-600'} whitespace-nowrap flex-shrink-0`}>
          {resource.coverage}
        </span>
      </div>
      <p className={`text-[11px] leading-relaxed mb-3 ${theme.mt}`}>{resource.desc}</p>
      <div className="flex flex-wrap gap-2 text-[11px]">
        {resource.web && (
          <a
            href={`https://${resource.web}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold ${theme.dk ? 'bg-zinc-800 text-emerald-400 hover:bg-zinc-700' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'} transition-colors`}
          >
            <Globe size={11} /> {resource.web}
          </a>
        )}
        {resource.tel && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold ${theme.dk ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-700'}`}>
            <Phone size={11} /> {resource.tel}
          </span>
        )}
      </div>
    </div>
  );
}

function CommandementSection({ theme }) {
  return (
    <Card theme={theme} icon={FileText} iconColor="indigo" title="4. Vous avez reçu un commandement de payer ?">
      <div className={`p-3 rounded-xl mb-3 ${theme.dk ? 'bg-rose-950/30 border border-rose-500/30' : 'bg-rose-50 border border-rose-200'}`}>
        <p className={`font-black text-xs ${theme.tx}`}>NE PANIQUEZ PAS.</p>
        <p className={`text-[11px] mt-1 ${theme.mt}`}>
          Un commandement de payer n'est pas une condamnation. C'est un acte officiel qui vous donne <strong>10 jours pour réagir</strong>. Pendant ces 10 jours, rien ne se passe.
        </p>
      </div>

      <p className={`text-xs font-bold ${theme.tx} mb-2`}>Vos 3 options dans les 10 jours :</p>
      <div className="space-y-2.5">
        <Option
          theme={theme}
          icon={CheckCircle2}
          color="emerald"
          title="A. Payer la totalité"
          body="Si vous le pouvez. La poursuite s'éteint, plus rien à faire. Demandez au créancier un quittancier."
        />
        <Option
          theme={theme}
          icon={Scale}
          color="amber"
          title="B. Faire opposition (GRATUITE)"
          body="Si vous contestez la dette (montant inexact, prescription, double facturation, etc.). Cochez la case OPPOSITION sur le commandement, signez et renvoyez. La procédure se gèle — le créancier devra prouver sa créance au tribunal."
        />
        <Option
          theme={theme}
          icon={ArrowRight}
          color="indigo"
          title="C. Négocier avec le créancier"
          body="Vous reconnaissez la dette mais ne pouvez pas tout payer maintenant. Proposez un échelonnement (ex: 200 CHF/mois sur 12 mois). Le créancier peut retirer la poursuite si l'accord tient. Mettez tout par écrit."
        />
      </div>

      <div className={`mt-4 p-3 rounded-xl text-[11px] ${theme.dk ? 'bg-zinc-900' : 'bg-stone-50'}`}>
        <p className={`font-black ${theme.tx}`}>Astuce critique</p>
        <p className={`mt-1 ${theme.mt}`}>
          Si vous laissez passer les 10 jours sans rien faire, le créancier peut demander la <strong>mainlevée</strong> au tribunal et passer à la saisie. <strong>L'opposition est gratuite</strong> — utilisez-la même par précaution si vous ne savez pas.
        </p>
      </div>
    </Card>
  );
}

function Option({ theme, icon: Ic, color, title, body }) {
  return (
    <div className={`p-3 rounded-xl border-l-4 border-${color}-500 ${theme.dk ? 'bg-zinc-900' : 'bg-stone-50'}`}>
      <div className="flex items-start gap-2.5">
        <Ic size={16} className={`text-${color}-500 flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className={`font-black text-xs ${theme.tx}`}>{title}</p>
          <p className={`text-[11px] mt-1 leading-relaxed ${theme.mt}`}>{body}</p>
        </div>
      </div>
    </div>
  );
}

function SnowballSection({ theme }) {
  return (
    <Card theme={theme} icon={Snowflake} iconColor="rose" title="5. L'effet boule de neige — comment freiner">
      <p className={`text-xs ${theme.mt} mb-3`}>
        Une dette qui traîne ne stagne pas — elle GROSSIT. Concrètement :
      </p>
      <div className="space-y-2 text-[11px]">
        <SnowballLine theme={theme} cause="Intérêts moratoires" detail="5%/an dès le premier jour de retard" />
        <SnowballLine theme={theme} cause="Frais de rappel" detail="25-50 CHF par rappel envoyé" />
        <SnowballLine theme={theme} cause="Frais office des poursuites" detail="75-200 CHF par procédure ouverte" />
        <SnowballLine theme={theme} cause="Frais de mainlevée" detail="200-500 CHF si le créancier va au tribunal" />
      </div>

      <div className={`mt-4 p-4 rounded-xl ${theme.dk ? 'bg-rose-950/30 border border-rose-500/30' : 'bg-rose-50 border border-rose-200'}`}>
        <p className={`font-black text-xs ${theme.tx}`}>Exemple concret</p>
        <p className={`text-[11px] mt-1 ${theme.mt}`}>
          Une facture de <strong>500 CHF</strong> non payée :
        </p>
        <ul className={`text-[11px] mt-2 space-y-0.5 ${theme.mt}`}>
          <li>+ 30 CHF rappel 1 → 530 CHF</li>
          <li>+ 50 CHF rappel 2 → 580 CHF</li>
          <li>+ 5% intérêts moratoires (6 mois) → 595 CHF</li>
          <li>+ 100 CHF frais poursuite → <strong className="text-rose-500">695 CHF</strong></li>
        </ul>
        <p className={`text-[11px] mt-2 font-bold ${theme.tx}`}>+39% en 6 mois. C'est pour ça qu'agir TÔT change tout.</p>
      </div>

      <p className={`text-xs font-bold ${theme.tx} mt-4 mb-2`}>Comment freiner :</p>
      <ul className={`text-[11px] space-y-1 ${theme.mt}`}>
        <li>• Agir AVANT le commandement de payer (chaque jour compte)</li>
        <li>• Prioriser ses dettes : <strong>loyer &gt; LAMal &gt; alimentation &gt; transport &gt; le reste</strong></li>
        <li>• Identifier UNE dette à régler en priorité (effet psychologique de progression)</li>
        <li>• Ne pas combler un trou en en creusant un autre — voir un conseiller gratuit AVANT de signer un crédit</li>
      </ul>
    </Card>
  );
}

function SnowballLine({ theme, cause, detail }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
      <p className={theme.tx}>
        <strong>{cause}</strong> <span className={theme.mt}>· {detail}</span>
      </p>
    </div>
  );
}

function RegistreSection({ theme }) {
  return (
    <Card theme={theme} icon={Shield} iconColor="indigo" title="6. Le casier des poursuites — bien comprendre">
      <p className={`text-xs ${theme.mt} mb-3`}>
        L'<strong>extrait du registre des poursuites</strong> est un document délivré par l'Office des poursuites de votre canton. Il liste toutes les poursuites engagées contre vous.
      </p>

      <p className={`text-xs font-bold ${theme.tx} mb-2`}>Conséquences d'avoir des poursuites actives :</p>
      <ul className={`text-[11px] space-y-1 mb-3 ${theme.mt}`}>
        <li>• <strong>Refus de location</strong> — la majorité des régies exigent un extrait propre pour louer</li>
        <li>• <strong>Emplois fermés</strong> — fonctionnaire, sécurité, finance, certains postes à responsabilité</li>
        <li>• <strong>Crédits refusés</strong> — banques, leasing, abonnements téléphoniques avec engagement</li>
        <li>• <strong>Caution exigée</strong> — pour certains contrats (énergie, télécoms)</li>
      </ul>

      <div className={`p-3 rounded-xl text-[11px] mb-3 ${theme.dk ? 'bg-zinc-900' : 'bg-stone-50'}`}>
        <p className={`font-black ${theme.tx}`}>Durée :</p>
        <p className={`mt-1 ${theme.mt}`}>
          Une poursuite reste visible <strong>5 ans après extinction</strong> de la dette. Cinq ans, c'est long. D'où l'importance de NÉGOCIER pour faire RETIRER la poursuite, pas juste payer.
        </p>
      </div>

      <p className={`text-xs font-bold ${theme.tx} mb-2`}>Comment obtenir VOTRE extrait (utile pour postuler à un appart) :</p>
      <ul className={`text-[11px] space-y-1 ${theme.mt}`}>
        <li>• Au guichet de l'Office des poursuites de votre canton — environ <strong>17 CHF</strong>, immédiat</li>
        <li>• Par poste (lettre signée) — 17 CHF + frais d'envoi, sous 2-5 jours</li>
        <li>• En ligne dans certains cantons (GE, ZH, VD, BS) avec votre identité SuisseID/eID</li>
      </ul>
    </Card>
  );
}

// ───────────────────────────────────────────────────
// PRO — indépendant·e / Sàrl / SA
// ───────────────────────────────────────────────────

function ProSections({ theme }) {
  return (
    <>
      <ProCreditorSection theme={theme} />
      <ProDebtorSection theme={theme} />
      <ProLegalOptionsSection theme={theme} />
      <ActionsSection theme={theme} mode="pro" />
      <ProResourcesSection theme={theme} />
    </>
  );
}

function ProCreditorSection({ theme }) {
  return (
    <Card theme={theme} icon={FileText} iconColor="emerald" title="1. Quand un client ne vous paie pas">
      <p className={`text-xs mb-3 ${theme.mt}`}>
        Process suisse de recouvrement, du plus doux au plus formel :
      </p>
      <div className="space-y-2 text-[11px]">
        <Step theme={theme} n={1} title="Rappel amiable (gratuit ou 25-30 CHF)" body="14 jours après échéance. Email ou courrier simple." />
        <Step theme={theme} n={2} title="Rappel 2 — sommation (50 CHF)" body="14 jours plus tard. Mention 'dernier rappel avant procédure'." />
        <Step theme={theme} n={3} title="Mise en demeure formelle (recommandé)" body="Lettre recommandée avec délai final (7-15 jours). Documente votre bonne foi." />
        <Step theme={theme} n={4} title="Réquisition de poursuite (75-150 CHF, récupérables)" body="Office des poursuites du canton du DÉBITEUR. Notification du commandement de payer sous 1-3 semaines." />
        <Step theme={theme} n={5} title="Mainlevée au tribunal" body="Si le débiteur fait opposition. Frais 200-500 CHF, récupérables si vous gagnez." />
        <Step theme={theme} n={6} title="Saisie / faillite" body="Office des poursuites procède. Vous récupérez selon ce qui peut être saisi (salaire au-dessus du minimum vital, biens)." />
      </div>
      <div className={`mt-4 p-3 rounded-xl text-[11px] ${theme.dk ? 'bg-zinc-900' : 'bg-stone-50'}`}>
        <p className={`font-black ${theme.tx}`}>Quand abandonner :</p>
        <p className={`mt-1 ${theme.mt}`}>
          Si le débiteur a déjà un <strong>Acte de défaut de biens (ADB)</strong>, vous ne récupérerez probablement rien. Inutile d'investir dans une nouvelle procédure. Comptabilisez la perte.
        </p>
      </div>
    </Card>
  );
}

function Step({ theme, n, title, body }) {
  return (
    <div className="flex gap-3">
      <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] flex-shrink-0 ${theme.dk ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-black text-xs ${theme.tx}`}>{title}</p>
        <p className={`text-[11px] mt-0.5 ${theme.mt}`}>{body}</p>
      </div>
    </div>
  );
}

function ProDebtorSection({ theme }) {
  return (
    <Card theme={theme} icon={AlertTriangle} iconColor="rose" title="2. Quand VOTRE entreprise est en difficulté">
      <div className={`p-3 rounded-xl mb-4 ${theme.dk ? 'bg-rose-950/30 border border-rose-500/30' : 'bg-rose-50 border border-rose-200'}`}>
        <p className={`font-black text-xs ${theme.tx}`}>Différence cruciale selon forme juridique</p>
        <div className={`mt-2 space-y-1.5 text-[11px] ${theme.mt}`}>
          <p>
            <strong className={theme.tx}>Raison Individuelle</strong> : responsabilité <strong className="text-rose-500">ILLIMITÉE</strong>. Vos biens personnels (compte épargne, voiture, immobilier) peuvent être saisis. Action urgente requise.
          </p>
          <p>
            <strong className={theme.tx}>Sàrl / SA</strong> : responsabilité limitée au capital social. <strong>MAIS</strong> un gérant qui ne déclare pas le surendettement (art. 725 CO) engage sa <strong className="text-rose-500">responsabilité personnelle</strong>. La protection n'est pas automatique.
          </p>
        </div>
      </div>

      <p className={`text-xs font-bold ${theme.tx} mb-2`}>Signaux d'alerte (Sàrl/SA) :</p>
      <ul className={`text-[11px] space-y-1 mb-3 ${theme.mt}`}>
        <li>• Capitaux propres proches de zéro ou négatifs (bilan)</li>
        <li>• Retards fournisseurs &gt; 60 jours sur plusieurs lignes</li>
        <li>• AVS, TVA ou impôt sur le bénéfice en retard</li>
        <li>• Banque qui réclame ou bloque la ligne de crédit</li>
        <li>• Liquidités insuffisantes pour les salaires du mois suivant</li>
        <li>• Vous n'osez plus regarder votre comptabilité</li>
      </ul>

      <div className={`p-3 rounded-xl text-[11px] ${theme.dk ? 'bg-amber-950/30 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'}`}>
        <p className={`font-black ${theme.tx}`}>Article 725 du Code des Obligations</p>
        <p className={`mt-1 ${theme.mt}`}>
          Si la moitié du capital social + réserves légales n'est plus couverte (surendettement) : le gérant <strong>DOIT</strong> en aviser le juge. Ne pas le faire = responsabilité personnelle illimitée du gérant pour les dettes ultérieures. Ce n'est pas une option, c'est une obligation légale.
        </p>
      </div>
    </Card>
  );
}

function ProLegalOptionsSection({ theme }) {
  const options = [
    {
      title: 'Restructuration informelle',
      timing: 'Tôt — avant blocage banque',
      body: 'Vous négociez directement avec créanciers : étalement, remise partielle, conversion dette en capital. Pas de procédure juridique. Faisable si encore en bonne foi avec les principaux créanciers.',
      pros: 'Discret, rapide, pas de casier',
      cons: 'Dépend de l\'accord unanime des créanciers',
    },
    {
      title: 'Sursis concordataire provisoire',
      timing: 'Quand restructuration informelle bloque',
      body: 'Demande au tribunal qui ACCORDE une protection de 4 à 6 mois pendant laquelle toutes poursuites sont suspendues. Un commissaire est désigné pour aider à élaborer un concordat.',
      pros: 'Protection légale pendant restructuration, professionnel désigné',
      cons: 'Public (figure au registre du commerce), perte d\'autonomie partielle',
    },
    {
      title: 'Concordat ordinaire',
      timing: 'Issue du sursis si accord créanciers',
      body: 'Accord avec ≥ 2/3 des créanciers (en montant). Paiement partiel (souvent 30-50% des dettes) sur calendrier négocié. Le tribunal homologue. Vos créanciers acceptent moins en échange d\'éviter la faillite (où ils auraient encore moins).',
      pros: 'Vous gardez l\'entreprise, dettes réduites légalement',
      cons: 'Très visible, 5 ans au casier RC après dissolution éventuelle',
    },
    {
      title: 'Faillite',
      timing: 'Dernier recours',
      body: 'Volontaire (vous demandez) ou forcée (créancier l\'obtient via une poursuite). L\'entreprise est liquidée, les actifs vendus, distribués au prorata. La société cesse d\'exister. Vous (le gérant) repartez à zéro mais avec une trace publique 10 ans.',
      pros: 'Met fin à la spirale, vous libère',
      cons: 'Casier 10 ans, perte de l\'entreprise, impact image, gérant peut être interdit de gestion 3-5 ans',
    },
  ];
  return (
    <Card theme={theme} icon={Scale} iconColor="indigo" title="3. Options légales en cas de surendettement">
      <p className={`text-xs mb-3 ${theme.mt}`}>
        Du moins au plus formel. La faillite n'est <strong>jamais</strong> la seule option — agir tôt ouvre les autres.
      </p>
      <div className="space-y-3">
        {options.map((o) => (
          <div key={o.title} className={`p-3 rounded-xl border ${theme.bd} ${theme.cd}`}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className={`font-black text-xs ${theme.tx}`}>{o.title}</p>
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${theme.dk ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-600'} whitespace-nowrap`}>
                {o.timing}
              </span>
            </div>
            <p className={`text-[11px] mb-2 ${theme.mt}`}>{o.body}</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className={`p-2 rounded-lg ${theme.dk ? 'bg-emerald-950/30' : 'bg-emerald-50'}`}>
                <p className={`font-black ${theme.dk ? 'text-emerald-300' : 'text-emerald-700'}`}>+ Pour</p>
                <p className={theme.tx}>{o.pros}</p>
              </div>
              <div className={`p-2 rounded-lg ${theme.dk ? 'bg-rose-950/30' : 'bg-rose-50'}`}>
                <p className={`font-black ${theme.dk ? 'text-rose-300' : 'text-rose-700'}`}>− Contre</p>
                <p className={theme.tx}>{o.cons}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProResourcesSection({ theme }) {
  const resources = [
    {
      name: 'Fiduciaire spécialisé restructuration',
      tagline: 'Premier interlocuteur',
      desc: 'Pour analyser votre situation, faire un cash-flow réaliste, prioriser les paiements et préparer la négociation créanciers. 2-5\'000 CHF mais souvent sauveur d\'entreprise.',
      web: null,
      tel: 'Recherche locale par canton',
      coverage: 'Indispensable',
    },
    {
      name: 'Avocat spécialisé poursuites/faillite',
      tagline: 'Pour les procédures formelles',
      desc: 'Sursis concordataire, concordat, faillite volontaire. Nécessaire dès la procédure légale. Tarif 200-400 CHF/heure mais évite des erreurs coûteuses (responsabilité gérant).',
      web: null,
      tel: 'Annuaire de l\'Ordre des avocats cantonal',
      coverage: 'Procédures juridiques',
    },
    {
      name: 'Chambres cantonales du commerce',
      tagline: 'Conseils PME en difficulté',
      desc: 'Premier conseil gratuit pour PME membres. Orientation vers les bonnes ressources. Médiation parfois possible avec créanciers.',
      web: 'cci.ch',
      tel: null,
      coverage: 'Toute la Suisse',
    },
    {
      name: 'KMU-/PME-Beratung / Coaching PME',
      tagline: 'Coaching subventionné',
      desc: 'Programmes cantonaux (varient selon canton) offrant des heures de coaching subventionnées pour PME en difficulté. Renseignez-vous auprès de votre canton.',
      web: null,
      tel: 'Service économique du canton',
      coverage: 'Variable canton',
    },
  ];
  return (
    <Card theme={theme} icon={Briefcase} iconColor="emerald" title="4. À qui s'adresser (Pro)">
      <div className="space-y-3">
        {resources.map((r) => (
          <ResourceCard key={r.name} theme={theme} resource={r} />
        ))}
      </div>
    </Card>
  );
}

// ───────────────────────────────────────────────────
// Common bottom section
// ───────────────────────────────────────────────────

function CommonSection({ theme, mode }) {
  return (
    <Card theme={theme} icon={Heart} iconColor="emerald" title={`${mode === 'pro' ? '5' : '7'}. Prendre soin de soi pendant la tempête`}>
      <p className={`text-xs mb-3 ${theme.mt}`}>
        Les difficultés financières affectent le sommeil, la santé, les relations. Vous n'êtes pas seul·e à vivre ça — et demander de l'aide n'est pas un échec.
      </p>
      <ul className={`text-[11px] space-y-2 ${theme.mt}`}>
        <li className="flex items-start gap-2">
          <Heart size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
          <span><strong className={theme.tx}>Parlez-en</strong> à une personne de confiance. Garder ça en secret aggrave le stress.</span>
        </li>
        <li className="flex items-start gap-2">
          <Phone size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
          <span><strong className={theme.tx}>La Main Tendue (143)</strong> — écoute anonyme 24h/24, gratuit. Pour les jours noirs.</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
          <span><strong className={theme.tx}>Un pas à la fois.</strong> Aujourd'hui : un coup de fil à un service de désendettement. Demain : la liste de vos dettes. Vous n'avez pas à tout faire en une journée.</span>
        </li>
      </ul>
    </Card>
  );
}

function DisclaimerFooter({ theme }) {
  return (
    <p className={`text-[10px] text-center ${theme.mt} italic px-4 leading-relaxed`}>
      Ce guide donne des informations générales sur le système suisse de poursuites. Il ne remplace pas le conseil d'un professionnel (service de désendettement, avocat, fiduciaire). Les montants et délais cités sont les références 2025 — vérifiez toujours avec l'Office des poursuites de votre canton pour votre situation précise.
    </p>
  );
}

function Card({ theme, icon: Ic, iconColor, title, children }) {
  return (
    <div className={`p-5 rounded-2xl border ${theme.cd} ${theme.bd}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl bg-${iconColor}-500/10 text-${iconColor}-500 flex items-center justify-center`}>
          <Ic size={18} />
        </div>
        <h3 className={`font-black text-base ${theme.tx}`}>{title}</h3>
      </div>
      {children}
    </div>
  );
}
