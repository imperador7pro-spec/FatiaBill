import React, { useState, useEffect } from 'react';
import {
  Crown, Sparkles, Camera, FileSignature, MapPin, MessageCircle, GraduationCap,
  Check, ArrowRight, Shield, Sun, Moon, Coins, Building2, Receipt,
  ChevronRight, Mail, Rocket,
} from 'lucide-react';

export function Landing({ theme, darkMode, onToggleDark, onSignUp, onSignIn }) {
  return (
    <div className={`min-h-screen ${theme.bg} ${theme.tx}`}>
      <TopBar theme={theme} darkMode={darkMode} onToggleDark={onToggleDark} onSignUp={onSignUp} onSignIn={onSignIn} />
      <Hero theme={theme} onSignUp={onSignUp} />
      <TrustBand theme={theme} />
      <Principles theme={theme} />
      <AppPreview theme={theme} />
      <HowItWorks theme={theme} onSignUp={onSignUp} />
      <Features theme={theme} />
      <Pricing theme={theme} onSignUp={onSignUp} />
      <FAQ theme={theme} />
      <Footer theme={theme} />
    </div>
  );
}

function TopBar({ theme, darkMode, onToggleDark, onSignUp, onSignIn }) {
  return (
    <nav className={`sticky top-0 z-30 border-b backdrop-blur-xl ${theme.dk ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-stone-200'}`}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <span className="font-black text-xl italic tracking-tighter">
            FatiaBill<span className="text-emerald-500">.</span>
          </span>
        </a>
        <div className="flex items-center gap-2">
          <button onClick={onToggleDark} className={`p-2 rounded-full ${theme.dk ? 'text-yellow-400 bg-zinc-900' : 'text-stone-500 bg-stone-100'}`}>
            {theme.dk ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={onSignIn} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${theme.mt} hover:${theme.tx}`}>
            Se connecter
          </button>
          <button onClick={onSignUp} className="text-xs font-black px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
            Essai gratuit
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero({ theme, onSignUp }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div style={{ animation: 'fade-up 0.6s ease-out both' }}>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-4 ${theme.dk ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            <Sparkles size={11} /> Conçu pour la Suisse
          </div>
          <h1 className={`text-4xl md:text-5xl font-black tracking-tight leading-tight ${theme.tx}`}>
            Le copilote financier des Suisses qui en ont assez de{' '}
            <span className="text-emerald-500">payer 30% d'impôts en trop</span>.
          </h1>
          <p className={`text-base mt-5 leading-relaxed ${theme.mt}`}>
            Calculs personnalisés par canton, scanner factures IA, QR-bills conformes, 66 leçons sur la fiscalité suisse, coach IA qui connaît votre situation. Tout dans une seule app — à partir de <strong className={theme.tx}>9 CHF/mois</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <button onClick={onSignUp} className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]">
              Démarrer l'essai 14 jours <ArrowRight size={16} />
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className={`px-6 py-3.5 font-black text-sm rounded-2xl border-2 ${theme.bd} ${theme.tx} ${theme.hv} transition-colors`}>
              Voir ce que ça fait
            </button>
          </div>
          <p className={`text-[11px] mt-3 ${theme.mt}`}>
            Sans carte bancaire · Annulable en 1 clic · Données hébergées en Suisse
          </p>
        </div>
        <HeroVisual theme={theme} />
      </div>
    </section>
  );
}

function AnimatedNumber({ target, duration = 1400 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n.toLocaleString('fr-CH');
}

function HeroVisual({ theme }) {
  const rows = [
    { c: 'Zoug', t: 9000, rank: 1, color: 'emerald' },
    { c: 'Schwyz', t: 10200, rank: 2, color: 'emerald' },
    { c: 'Vaud', t: 17000, rank: 24, color: null },
    { c: 'Genève', t: 17500, rank: 26, color: 'rose', current: true },
  ];
  return (
    <div className="relative" style={{ animation: 'fade-up 0.7s ease-out 0.15s both' }}>
      <div className={`p-5 rounded-3xl border-2 shadow-2xl ${theme.cd} ${theme.bd}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
            <MapPin size={14} />
          </div>
          <div>
            <p className={`text-[9px] font-black uppercase tracking-wider ${theme.mt}`}>Simulateur fiscal</p>
            <p className={`text-xs font-black ${theme.tx}`}>26 cantons comparés</p>
          </div>
          <Sparkles
            size={12}
            className="ml-auto text-emerald-500"
            style={{ animation: 'sparkle-pulse 2.4s ease-in-out infinite' }}
          />
        </div>
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-3">
          <p className={`text-[9px] font-black uppercase ${theme.dk ? 'text-emerald-300' : 'text-emerald-700'}`}>Économie max possible</p>
          <p className="text-2xl font-black tabular-nums">
            CHF <AnimatedNumber target={8500} /> <span className="text-xs text-stone-500">/ an</span>
          </p>
          <p className={`text-[10px] ${theme.mt}`}>En déménageant de Genève à Zoug</p>
        </div>
        <div className="space-y-1.5">
          {rows.map((r, i) => (
            <div
              key={r.c}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${r.current ? (theme.dk ? 'bg-rose-950/40' : 'bg-rose-50') : ''}`}
              style={{
                animation: 'slide-in-left 0.5s ease-out both',
                animationDelay: `${0.3 + i * 0.12}s`,
              }}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black ${
                r.color === 'emerald' ? 'bg-emerald-500 text-white' :
                r.color === 'rose' ? 'bg-rose-500 text-white' :
                (theme.dk ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-100 text-stone-500')
              }`}>{r.rank}</div>
              <span className={`flex-1 font-bold ${theme.tx}`}>{r.c}</span>
              {r.current && <span className="text-[8px] font-black uppercase px-1 py-0.5 rounded-full bg-rose-500 text-white">Vous</span>}
              <span className={`font-black tabular-nums ${theme.tx}`}>CHF {r.t.toLocaleString('fr-CH')}</span>
            </div>
          ))}
        </div>
      </div>
      <div
        className={`absolute -bottom-3 -right-3 p-3 rounded-2xl border-2 shadow-xl ${theme.cd} ${theme.bd} flex items-center gap-2`}
        style={{ animation: 'float 3.2s ease-in-out infinite' }}
      >
        <div className="w-8 h-8 bg-indigo-500 rounded-xl text-white flex items-center justify-center">
          <MessageCircle size={14} />
        </div>
        <div className="text-xs">
          <p className="font-black">Coach IA</p>
          <p className={`text-[9px] ${theme.mt}`}>Connaît votre canton</p>
        </div>
      </div>
    </div>
  );
}

function TrustBand({ theme }) {
  const items = [
    { icon: Shield, label: 'TVA 8.1% conforme' },
    { icon: MapPin, label: '26 cantons calibrés' },
    { icon: FileSignature, label: 'QR-bill conforme' },
    { icon: Building2, label: 'Données hébergées CH' },
    { icon: Coins, label: 'AVS / LPP exacts' },
  ];
  return (
    <section className={`border-y ${theme.bd} ${theme.dk ? 'bg-zinc-900/50' : 'bg-stone-50'} py-6`}>
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {items.map((it) => {
          const Ic = it.icon;
          return (
            <div key={it.label} className={`flex items-center gap-1.5 text-xs font-bold ${theme.mt}`}>
              <Ic size={14} className="text-emerald-500" /> {it.label}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Principles({ theme }) {
  const pillars = [
    {
      icon: Sparkles,
      title: 'Une seule app pour tout',
      body: 'Budget, charges, factures, scans, simulation fiscale, coach. Plus besoin de jongler entre Excel, un dossier Dropbox et trois sites cantonaux.',
    },
    {
      icon: MapPin,
      title: 'Personnalisé pour vous',
      body: 'Vos calculs s\'adaptent à votre canton, votre statut (suisse, permis B/C/G, frontalier), votre situation famille et votre prévoyance. Rien de générique.',
    },
    {
      icon: MessageCircle,
      title: 'Coach IA qui connaît la Suisse',
      body: 'TVA, 3 piliers, 26 barèmes cantonaux, QR-bill, charges sociales — le coach maîtrise les règles 2025 ET votre profil. Conseil concret, pas du blabla.',
    },
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
      <div className="text-center mb-12">
        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-500 mb-2">Notre approche</p>
        <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${theme.tx}`}>
          Trois principes qui changent tout.
        </h2>
        <p className={`text-sm mt-3 max-w-2xl mx-auto ${theme.mt}`}>
          Aucun outil suisse ne réunit aujourd'hui ces trois dimensions. C'est exactement ce qui rend FatiaBill différent.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {pillars.map((p) => {
          const Ic = p.icon;
          return (
            <div key={p.title} className={`p-5 rounded-2xl border ${theme.cd} ${theme.bd}`}>
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-3">
                <Ic size={20} />
              </div>
              <h3 className={`font-black text-base mb-2 ${theme.tx}`}>{p.title}</h3>
              <p className={`text-xs leading-relaxed ${theme.mt}`}>{p.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AppPreview({ theme }) {

  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      <div
        aria-hidden
        className={`absolute inset-0 ${theme.dk
          ? 'bg-gradient-to-br from-emerald-950/50 via-zinc-950 to-zinc-900'
          : 'bg-gradient-to-br from-emerald-50 via-teal-50/40 to-stone-100'}`}
      />
      <div
        aria-hidden
        className={`absolute top-12 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${theme.dk ? 'bg-emerald-500/15' : 'bg-emerald-300/40'}`}
      />
      <div
        aria-hidden
        className={`absolute bottom-0 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none ${theme.dk ? 'bg-teal-500/10' : 'bg-teal-200/40'}`}
      />
      <div className="relative max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-500 mb-2">Aperçu</p>
          <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${theme.tx}`}>
            Une conversation. Une économie réelle.
          </h2>
          <p className={`text-sm mt-3 max-w-xl mx-auto ${theme.mt}`}>
            Le coach IA connaît votre canton, votre âge, votre situation. Il vous dit quoi faire — avec le chiffre exact à la clé.
          </p>
        </div>

        <div className="max-w-xl mx-auto" style={{ animation: 'fade-up 0.7s ease-out both' }}>
          <div className={`rounded-3xl border-2 overflow-hidden shadow-2xl ${theme.cd} ${theme.bd}`}>
            <div className={`flex items-center gap-3 px-4 py-3 border-b ${theme.bd} ${theme.dk ? 'bg-zinc-900' : 'bg-white'}`}>
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center`}>
                <MessageCircle size={16} />
              </div>
              <div className="flex-1">
                <p className={`font-black text-sm ${theme.tx}`}>Coach FatiaBill</p>
                <p className={`text-[10px] flex items-center gap-1 ${theme.dk ? 'text-emerald-300' : 'text-emerald-600'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ animation: 'sparkle-pulse 1.6s ease-in-out infinite' }} />
                  En ligne · sait Vaud · 35 ans · célibataire
                </p>
              </div>
              <Sparkles size={14} className={`text-emerald-500`} style={{ animation: 'sparkle-pulse 2.4s ease-in-out infinite' }} />
            </div>

            <div className={`p-5 space-y-3 ${theme.dk ? 'bg-zinc-950' : 'bg-stone-50'}`}>
              <div className="flex justify-end" style={{ animation: 'slide-in-right 0.5s ease-out 0.2s both' }}>
                <div className="bg-emerald-600 text-white rounded-2xl rounded-br-md max-w-[80%] px-4 py-2.5 text-xs leading-relaxed">
                  Je gagne 6'000 CHF/mois à Vaud. Je n'ai pas de 3ème pilier. Combien je peux économiser d'impôts cette année ?
                </div>
              </div>

              <div
                className={`flex items-center gap-1 px-3 py-2 rounded-2xl ${theme.dk ? 'bg-zinc-900' : 'bg-white'} max-w-[80px]`}
                style={{ animation: 'fade-up 0.3s ease-out 1.1s both' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ animation: 'sparkle-pulse 1.4s ease-in-out infinite' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ animation: 'sparkle-pulse 1.4s ease-in-out 0.2s infinite' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ animation: 'sparkle-pulse 1.4s ease-in-out 0.4s infinite' }} />
              </div>

              <div className="flex justify-start" style={{ animation: 'slide-in-left 0.5s ease-out 1.9s both' }}>
                <div className={`${theme.dk ? 'bg-zinc-900' : 'bg-white'} ${theme.tx} rounded-2xl rounded-bl-md max-w-[85%] px-4 py-3 text-xs leading-relaxed shadow-sm`}>
                  À votre taux marginal (~24% à Vaud), ouvrir un <strong className={theme.dk ? 'text-emerald-300' : 'text-emerald-700'}>3ème pilier A</strong> et y verser le plafond <strong>7'258 CHF</strong> vous fait économiser <strong className={theme.dk ? 'text-emerald-300' : 'text-emerald-700'}>1'742 CHF d'impôts</strong> cette année.
                  <br /><br />
                  Sur 30 ans à 5%/an en titres (Viac, Frankly ou Finpension), c'est <strong>~480'000 CHF</strong> de capital pour la retraite. Action ce mois : ouvrir Viac, virement automatique 605 CHF/mois.
                </div>
              </div>

              <div
                className={`mt-4 p-4 rounded-2xl bg-gradient-to-br ${theme.dk ? 'from-emerald-900/40 to-emerald-950/40' : 'from-emerald-50 to-emerald-100'} border-2 border-emerald-500/40`}
                style={{ animation: 'fade-up 0.7s ease-out 2.6s both' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[9px] font-black uppercase tracking-wider ${theme.dk ? 'text-emerald-300' : 'text-emerald-700'}`}>Économie débloquée</p>
                    <p className={`text-2xl font-black tabular-nums ${theme.tx}`}>
                      +CHF <AnimatedNumber target={1742} duration={1200} /> <span className="text-xs font-bold text-stone-500">/ an</span>
                    </p>
                    <p className={`text-[10px] ${theme.mt}`}>+480'000 CHF de capital retraite sur 30 ans</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className={`text-center text-[10px] mt-5 ${theme.mt} italic`}>
          Conversation type · Le coach adapte chaque conseil à votre profil exact (canton, âge, situation, prévoyance).
        </p>
      </div>
    </section>
  );
}

function HowItWorks({ theme, onSignUp }) {
  const steps = [
    {
      n: 1,
      icon: Mail,
      title: 'Créez votre compte',
      duration: '30 secondes',
      body: 'Email + mot de passe. Aucune carte bancaire requise.',
    },
    {
      n: 2,
      icon: MapPin,
      title: 'Profil par canton',
      duration: 'Wizard 4 étapes',
      body: 'Canton, permis, situation famille, prévoyance. Tout sera calibré pour vous.',
    },
    {
      n: 3,
      icon: Rocket,
      title: 'Coach + outils prêts',
      duration: '14 jours illimités',
      body: 'Dashboard, scanner, simulateur, coach IA contextuel — explorez sans engagement.',
    },
  ];

  return (
    <section className={`py-16 md:py-20 border-y ${theme.bd} ${theme.dk ? 'bg-zinc-950' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-500 mb-2">Comment ça marche</p>
          <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${theme.tx}`}>
            De zéro à votre tableau de bord en moins de 3 minutes.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
          {steps.map((s, i) => {
            const Ic = s.icon;
            const last = i === steps.length - 1;
            return (
              <div
                key={s.n}
                className={`relative p-6 rounded-3xl border-2 ${theme.cd} ${theme.bd} ${last ? '' : 'md:mr-2'}`}
                style={{
                  animation: 'fade-up 0.6s ease-out both',
                  animationDelay: `${0.15 + i * 0.15}s`,
                }}
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-500/30">
                  {s.n}
                </div>
                {!last && (
                  <ArrowRight
                    size={28}
                    className={`hidden md:block absolute top-1/2 -translate-y-1/2 text-emerald-500 z-10`}
                    style={{ right: '-30px', animation: 'sparkle-pulse 2.8s ease-in-out infinite' }}
                  />
                )}
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-3 mt-2">
                  <Ic size={22} />
                </div>
                <h3 className={`font-black text-base ${theme.tx}`}>{s.title}</h3>
                <p className={`text-[10px] font-black uppercase tracking-wider mt-1 ${theme.dk ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {s.duration}
                </p>
                <p className={`text-xs mt-3 leading-relaxed ${theme.mt}`}>{s.body}</p>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-10">
          <button
            onClick={onSignUp}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            Commencer maintenant <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

function Features({ theme }) {
  const feats = [
    {
      icon: Sparkles, color: 'emerald',
      title: 'Onboarding personnalisé par canton',
      body: 'Canton, permis (B/C/G/frontalier), situation famille, prévoyance. Tous les calculs sont ensuite calibrés pour vous — pas de moyenne mondiale.',
    },
    {
      icon: GraduationCap, color: 'amber',
      title: '66 leçons sur la fiscalité suisse',
      body: 'Cantons, frontaliers FR/DE/IT/AT, immobilier + LPP, comparatif 3A (Viac/Frankly/Finpension), création Sàrl, TVA TDFN vs effective. Quiz + XP.',
    },
    {
      icon: Camera, color: 'indigo',
      title: 'Scanner factures Claude Vision',
      body: 'Photo d\'un reçu Migros, Caffè ou restaurant → l\'IA extrait montant, date, TVA, fournisseur, catégorie. JPG, PNG ou PDF. Vous éditez si besoin.',
    },
    {
      icon: FileSignature, color: 'rose',
      title: 'QR-factures suisses conformes',
      body: 'Obligatoire depuis 30 sept 2022. Génération PDF en 1 clic avec QR scannable par toutes les banques suisses.',
    },
    {
      icon: MapPin, color: 'rose',
      title: 'Simulateur 26 cantons',
      body: '"Déménager à Zoug me ferait gagner combien ?" — réponse en 3 secondes. Inclut écarts d\'impôts ET de LAMal.',
    },
    {
      icon: MessageCircle, color: 'indigo',
      title: 'Coach IA contextuel',
      body: 'Sait que vous êtes 35 ans, marié, à Vaud, sans 3A, avec 1\'100 CHF de capacité mensuelle. Vous dit quoi faire CETTE semaine, pas des généralités.',
    },
  ];
  return (
    <section id="features" className={`py-16 md:py-20 ${theme.dk ? 'bg-zinc-900/50' : 'bg-stone-50'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-500 mb-2">Tout ce qu'il y a dedans</p>
          <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${theme.tx}`}>
            6 outils pensés pour la réalité suisse.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feats.map((f) => {
            const Ic = f.icon;
            return (
              <div key={f.title} className={`p-5 rounded-2xl border ${theme.cd} ${theme.bd} transition-transform hover:-translate-y-1`}>
                <div className={`w-10 h-10 bg-${f.color}-500/10 text-${f.color}-500 rounded-2xl flex items-center justify-center mb-3`}>
                  <Ic size={20} />
                </div>
                <h3 className={`font-black text-sm mb-2 ${theme.tx}`}>{f.title}</h3>
                <p className={`text-xs leading-relaxed ${theme.mt}`}>{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Pricing({ theme, onSignUp }) {
  const plans = [
    {
      name: 'Gratuit', price: '0', period: 'CHF', accent: 'stone',
      tagline: 'Pour goûter',
      features: ['Dashboard budget', '5 charges fixes · 2 objectifs', '3 messages IA / mois', 'Académie de base (~30%)', 'Simulateur cantons'],
      cta: 'Commencer gratuit',
    },
    {
      name: 'Privé Premium', price: '9', period: 'CHF/mois', accent: 'emerald', highlighted: true,
      tagline: 'Pour un particulier',
      features: ['Tout du Gratuit, illimité', 'Académie complète (40 leçons)', 'Coach IA contextuel illimité', 'Décomposition brut → net', 'Comparateur 3A', 'Annulable à tout moment'],
      cta: 'Essai 14 jours',
    },
    {
      name: 'Pro Premium', price: '29', period: 'CHF/mois', accent: 'indigo',
      tagline: 'Indépendant·e / Sàrl',
      features: ['Tout du Privé', 'Scanner factures IA', 'QR-factures conformes', 'Académie Pro (26 modules)', 'Rapport fiscal annuel', 'Coach business IA'],
      cta: 'Essai 14 jours',
    },
  ];
  return (
    <section className={`py-16 md:py-20 ${theme.dk ? 'bg-zinc-900/50' : 'bg-stone-50'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-500 mb-2">Tarifs</p>
          <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${theme.tx}`}>
            Choisissez votre tranche.
          </h2>
          <p className={`text-sm mt-2 ${theme.mt}`}>14 jours d'essai gratuit sur les paliers payants · Sans carte bancaire</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`p-6 rounded-3xl border-2 transition-transform hover:-translate-y-1 ${p.highlighted
                ? `border-${p.accent}-500 ${theme.dk ? 'bg-emerald-950/30' : 'bg-emerald-50/50'} shadow-xl scale-[1.02]`
                : `${theme.cd} ${theme.bd}`}`}
            >
              {p.highlighted && (
                <div className={`inline-block px-2 py-0.5 mb-3 text-[9px] font-black uppercase tracking-wider rounded-full bg-${p.accent}-500 text-white`}>
                  Recommandé
                </div>
              )}
              <p className={`text-[10px] font-black uppercase tracking-wider ${theme.mt}`}>{p.tagline}</p>
              <h3 className={`text-xl font-black mt-1 ${theme.tx}`}>{p.name}</h3>
              <div className="flex items-baseline gap-1 mt-2 mb-4">
                <span className={`text-4xl font-black tabular-nums ${theme.tx}`}>{p.price}</span>
                <span className={`text-xs font-bold ${theme.mt}`}>{p.period}</span>
              </div>
              <ul className="space-y-2 mb-5">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <Check size={13} className={`text-${p.accent}-500 mt-0.5 flex-shrink-0`} />
                    <span className={theme.tx}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onSignUp}
                className={`w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors ${p.highlighted
                  ? `bg-${p.accent}-600 hover:bg-${p.accent}-500 text-white`
                  : `${theme.sf} ${theme.tx} ${theme.hv}`}`}
              >
                {p.cta} <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ({ theme }) {
  const qs = [
    {
      q: 'Pourquoi 14 jours d\'essai gratuit ?',
      a: 'Parce qu\'on est confiants : si en 14 jours vous n\'avez pas vu de différence dans votre gestion, vous n\'aurez pas envie de payer. Et c\'est OK.',
    },
    {
      q: 'Faut-il une carte bancaire pour l\'essai ?',
      a: 'Non. Vous tapez email + mot de passe, vous remplissez votre profil (canton, situation), et vous démarrez. La carte n\'arrive que si vous décidez de passer Premium après les 14 jours.',
    },
    {
      q: 'Où sont mes données ?',
      a: 'Hébergées en Europe (Supabase EU), conformes RGPD/LPD. Aucune revente, aucun partage. Vos scans IA passent par Anthropic (Claude) pour analyse OCR — pas de rétention. Vous pouvez supprimer votre compte à tout moment.',
    },
    {
      q: 'Pour qui FatiaBill est-il fait ?',
      a: 'Particuliers qui veulent maîtriser leur budget et leur fiscalité suisse, frontaliers, indépendant·es et petites Sàrl qui veulent un outil utile au quotidien — scan de factures, QR-bills, coach business — sans payer le prix d\'une suite comptable complète.',
    },
    {
      q: 'Puis-je annuler à tout moment ?',
      a: 'Oui, depuis votre dashboard ou Stripe. Vous gardez l\'accès jusqu\'à la fin du mois payé, puis vous repassez en plan Gratuit avec accès à vos données historiques.',
    },
    {
      q: 'Pour qui FatiaBill n\'est-il PAS fait ?',
      a: 'Pour une PME de 50+ employés avec besoins compta avancés (consolidation multi-sociétés, payroll complexe), il existe des suites dédiées plus adaptées. Pour quelqu\'un qui veut JUSTE émettre 2 factures par an, un simple outil gratuit suffit.',
    },
  ];
  return (
    <section className="max-w-3xl mx-auto px-4 py-16 md:py-20">
      <div className="text-center mb-10">
        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-500 mb-2">FAQ</p>
        <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${theme.tx}`}>Questions fréquentes.</h2>
      </div>
      <div className="space-y-3">
        {qs.map((q, i) => (
          <details key={i} className={`p-4 rounded-2xl border group ${theme.cd} ${theme.bd}`}>
            <summary className={`font-black text-sm cursor-pointer flex items-center justify-between gap-3 ${theme.tx}`}>
              <span>{q.q}</span>
              <ChevronRight size={16} className={`${theme.mt} group-open:rotate-90 transition-transform flex-shrink-0`} />
            </summary>
            <p className={`text-xs mt-3 leading-relaxed ${theme.mt}`}>{q.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer({ theme }) {
  return (
    <footer className={`border-t py-8 ${theme.bd}`}>
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-black italic tracking-tighter">
            FatiaBill<span className="text-emerald-500">.</span>
          </span>
          <span className={`text-[10px] ${theme.mt}`}>· Conçu en Suisse 🇨🇭</span>
        </div>
        <div className={`flex items-center gap-4 text-[10px] font-bold ${theme.mt}`}>
          <a href="mailto:hello@fatiabill.ch" className="hover:text-emerald-500 transition-colors">hello@fatiabill.ch</a>
          <span>·</span>
          <span>© {new Date().getFullYear()} FatiaBill</span>
        </div>
      </div>
    </footer>
  );
}
