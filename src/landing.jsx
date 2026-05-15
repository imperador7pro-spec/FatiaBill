import React, { useState, useEffect } from 'react';
import {
  ArrowRight, Sun, Moon, Check, Sparkles, MapPin, FileText, Camera,
  GraduationCap, LifeBuoy, Send, Wifi, Signal, BatteryFull, ChevronUp,
} from 'lucide-react';
import { Logo } from './logo.jsx';

const ACCENT = 'text-emerald-600';
const SERIF = 'font-display';

export function Landing({ theme, darkMode, onToggleDark, onSignUp, onSignIn }) {
  const dark = theme.dk;
  const bg = dark ? 'bg-zinc-950' : 'bg-white';
  const tx = dark ? 'text-zinc-100' : 'text-zinc-900';
  const mt = dark ? 'text-zinc-400' : 'text-zinc-500';
  const bd = dark ? 'border-zinc-800' : 'border-zinc-200';
  const sf = dark ? 'bg-zinc-900' : 'bg-zinc-50';

  const tokens = { dark, bg, tx, mt, bd, sf };

  return (
    <div className={`min-h-screen ${bg} ${tx}`}>
      <TopBar t={tokens} darkMode={darkMode} onToggleDark={onToggleDark} onSignUp={onSignUp} onSignIn={onSignIn} />
      <Hero t={tokens} onSignUp={onSignUp} />
      <WhatItDoes t={tokens} />
      <CoachIA t={tokens} onSignUp={onSignUp} />
      <HowItWorks t={tokens} onSignUp={onSignUp} />
      <Overview t={tokens} />
      <SOSPoursuite t={tokens} onSignUp={onSignUp} />
      <Pricing t={tokens} onSignUp={onSignUp} />
      <FAQ t={tokens} />
      <Footer t={tokens} />
    </div>
  );
}

// ─────────────────────────────────────────────────
// Shared atoms
// ─────────────────────────────────────────────────

function SectionTag({ number, total = '07', tagline, t }) {
  return (
    <div className={`text-[10px] font-mono uppercase tracking-[0.2em] ${t.mt}`}>
      §{number} / {total}<br />
      {tagline}
    </div>
  );
}

function Eyebrow({ children, t }) {
  return (
    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${t.mt}`}>
      ─ {children}
    </p>
  );
}

function AnimatedNumber({ target, duration = 1400, suffix = '' }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const v = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - v, 3);
      setN(Math.round(target * eased));
      if (v < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <>{n.toLocaleString('fr-CH')}{suffix}</>;
}

// ─────────────────────────────────────────────────
// TopBar
// ─────────────────────────────────────────────────

function TopBar({ t, darkMode, onToggleDark, onSignUp, onSignIn }) {
  return (
    <nav className={`sticky top-0 z-30 border-b backdrop-blur-xl ${t.dark ? 'bg-zinc-950/85 border-zinc-800' : 'bg-white/85 border-zinc-100'}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="inline-flex items-center">
          <Logo size="md" />
        </a>
        <div className="flex items-center gap-3">
          <button onClick={onToggleDark} className={`p-2 rounded-full ${t.dark ? 'text-yellow-400 bg-zinc-900' : 'text-zinc-500 bg-zinc-100'}`}>
            {t.dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={onSignIn} className={`text-xs font-bold px-3 py-1.5 ${t.mt} hover:${t.tx}`}>
            Se connecter
          </button>
          <button onClick={onSignUp} className={`text-xs font-bold px-4 py-2 rounded-full ${t.dark ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'} hover:opacity-90 transition-opacity flex items-center gap-1.5`}>
            Ouvrir mon compte <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────
// §01 — Hero
// ─────────────────────────────────────────────────

function Hero({ t, onSignUp }) {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-12 pb-20 md:pt-20 md:pb-28">
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-center">
        <div style={{ animation: 'fade-up 0.7s ease-out both' }}>
          <h1 className={`${SERIF} text-5xl md:text-7xl leading-[1.02] tracking-tight ${t.tx}`}>
            Le copilote de vos{' '}
            <span className={`italic ${ACCENT}`}>finances</span>,
            <br />jamais de votre vie.
          </h1>
          <p className={`text-base md:text-lg mt-8 max-w-xl leading-relaxed ${t.mt}`}>
            FatiaBill comprend vos comptes suisses, prévoit vos fins de mois et vous coache au quotidien — sans jamais vendre vos données.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-9">
            <button onClick={onSignUp} className={`px-6 py-3.5 ${t.dark ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'} font-bold rounded-full text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform`}>
              Ouvrir mon compte <ArrowRight size={14} />
            </button>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className={`px-6 py-3.5 font-bold text-sm rounded-full border ${t.bd} ${t.tx} flex items-center justify-center gap-2 ${t.dark ? 'hover:bg-zinc-900' : 'hover:bg-zinc-50'} transition-colors`}>
              Comment ça marche <ArrowRight size={12} />
            </button>
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-6 mt-14 pt-8 border-t ${t.bd}`}>
            <Stat label="cantons calibrés" value="26" t={t} />
            <Stat label="leçons suisses" value="66" t={t} />
            <Stat label="conforme QR-bill" value="2022" t={t} />
            <Stat label="essai sans CB" value="14 j" t={t} />
          </div>
        </div>

        <div className="relative" style={{ animation: 'fade-up 0.8s ease-out 0.15s both' }}>
          <PhoneFrame t={t}>
            <DashboardScreen t={t} />
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, t }) {
  return (
    <div>
      <p className={`${SERIF} text-3xl md:text-4xl ${t.tx} leading-none`}>{value}</p>
      <p className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${t.mt}`}>{label}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────
// iPhone-style frame
// ─────────────────────────────────────────────────

function PhoneFrame({ t, children, size = 'md' }) {
  const widths = { sm: 'max-w-[240px]', md: 'max-w-[280px]', lg: 'max-w-[300px]' };
  return (
    <div className={`mx-auto ${widths[size]} relative`}>
      <div className="bg-zinc-900 rounded-[40px] p-[6px] shadow-2xl shadow-emerald-500/10 ring-1 ring-zinc-800">
        <div className={`${t.dark ? 'bg-zinc-950' : 'bg-stone-50'} rounded-[34px] overflow-hidden relative`}>
          <div className="h-6 bg-zinc-900 relative flex items-center justify-center">
            <div className="absolute top-1.5 w-16 h-3 bg-black rounded-full" />
          </div>
          <div className="px-2 pt-3 pb-4">
            <div className={`text-[9px] font-bold flex items-center justify-between px-2 ${t.mt}`}>
              <span>9:41</span>
              <div className="flex items-center gap-0.5">
                <Signal size={9} />
                <Wifi size={9} />
                <BatteryFull size={11} />
              </div>
            </div>
            <div className="px-2 pt-3">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardScreen({ t }) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`text-[8px] font-bold uppercase tracking-wider ${t.mt}`}>Bonsoir,</p>
          <p className={`${SERIF} text-base ${t.tx}`}>Léa</p>
        </div>
        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">L</div>
      </div>
      <div className="bg-zinc-900 text-white rounded-2xl p-3 mb-3">
        <p className="text-[7px] font-bold uppercase tracking-widest text-zinc-400">Solde disponible</p>
        <p className={`${SERIF} text-2xl mt-0.5`}>CHF <AnimatedNumber target={4287} /><span className="text-sm text-zinc-400">.50</span></p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[8px] font-bold text-emerald-400">↑ +CHF 312 ce mois</span>
          <span className="text-[8px] text-zinc-500">MAI 26</span>
        </div>
      </div>
      <div className={`rounded-2xl p-3 mb-3 ${t.dark ? 'bg-zinc-900' : 'bg-white'} border ${t.bd}`}>
        <div className="flex items-baseline justify-between mb-2">
          <p className={`text-[8px] font-bold ${t.tx}`}>Budget du mois</p>
          <p className="text-[8px] font-black text-emerald-600">68%</p>
        </div>
        <div className="flex items-end gap-0.5 h-10">
          {[5, 6, 7, 5, 9, 8, 11, 7, 13, 9, 6, 8, 7, 5].map((h, i) => (
            <div key={i} className={`flex-1 rounded-sm ${i === 8 ? 'bg-emerald-500' : t.dark ? 'bg-zinc-700' : 'bg-zinc-300'}`} style={{ height: `${h * 8}%` }} />
          ))}
        </div>
      </div>
      <p className={`text-[7px] font-bold uppercase tracking-widest ${t.mt} mb-1.5`}>Transactions récentes</p>
      <div className="space-y-1">
        {[
          { name: 'Café Tassu', cat: 'Restauration', amt: '6.80', icon: '☕', bg: 'bg-orange-500' },
          { name: 'CFF Mobile', cat: 'Transport', amt: '38.00', icon: '🚆', bg: 'bg-blue-500' },
          { name: 'Migros', cat: 'Alimentation', amt: '84.20', icon: '🛒', bg: 'bg-emerald-500' },
        ].map((tx) => (
          <div key={tx.name} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full ${tx.bg} text-white text-[8px] flex items-center justify-center`}>
                {tx.icon}
              </div>
              <div>
                <p className={`text-[9px] font-bold ${t.tx}`}>{tx.name}</p>
                <p className={`text-[7px] ${t.mt}`}>{tx.cat}</p>
              </div>
            </div>
            <p className={`text-[9px] font-bold ${t.tx}`}>-CHF {tx.amt}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────
// §02 — What it does
// ─────────────────────────────────────────────────

function WhatItDoes({ t }) {
  return (
    <section className={`py-20 md:py-28 ${t.sf}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-start mb-12 md:mb-16">
          <div className="max-w-3xl">
            <Eyebrow t={t}>Ce que fait FatiaBill</Eyebrow>
            <h2 className={`${SERIF} text-4xl md:text-5xl mt-3 leading-[1.05] tracking-tight ${t.tx}`}>
              Tout votre argent,<br />
              <span className={`italic ${ACCENT}`}>une seule app</span>.
            </h2>
          </div>
          <SectionTag number="02" tagline="Conçu pour la Suisse" t={t} />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Dark card — budget */}
          <div className="bg-zinc-900 text-white rounded-3xl p-7 md:p-9 min-h-[340px] flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">— 01 · Budget vivant</p>
            <h3 className={`${SERIF} text-2xl mt-3 mb-3 leading-tight`}>
              Vos dépenses, comprises avant d'être analysées.
            </h3>
            <p className="text-sm text-zinc-400 mb-auto">
              Catégorisation automatique, calculs cantonaux exacts, décomposition brut→net en temps réel. Pas de tableurs.
            </p>
            <div className="flex items-end gap-1 h-20 mt-8">
              {[40, 55, 50, 65, 55, 72, 60, 90, 65, 70, 55, 60].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded ${i === 7 ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                  style={{ height: `${h}%`, animation: `fade-up 0.6s ease-out ${0.1 + i * 0.04}s both` }}
                />
              ))}
            </div>
            <p className="text-[9px] text-zinc-500 mt-2 text-center font-bold uppercase tracking-wider">Mai</p>
          </div>

          {/* Mint card — coach */}
          <div className={`rounded-3xl p-7 md:p-9 min-h-[340px] flex flex-col ${t.dark ? 'bg-emerald-950/40 border border-emerald-500/20' : 'bg-emerald-50'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${t.dark ? 'text-emerald-400' : 'text-emerald-700'}`}>— 02 · Copilote IA</p>
            <h3 className={`${SERIF} text-2xl mt-3 mb-3 leading-tight ${t.tx}`}>
              Une question.<br />Une réponse claire.
            </h3>
            <p className={`text-sm mb-auto ${t.dark ? 'text-emerald-200/70' : 'text-emerald-800/70'}`}>
              Posez vos questions financières comme à un ami. Fatia répond avec votre contexte réel.
            </p>
            <div className="flex justify-end mt-8">
              <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-2xl rounded-br-md">
                Je peux partir en weekend ?
              </div>
            </div>
            <div className="mt-2">
              <div className={`text-xs px-4 py-2 rounded-2xl rounded-bl-md ${t.dark ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'} inline-block max-w-[85%]`}>
                Oui, jusqu'à <strong>CHF 142</strong> sans toucher à ton épargne.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────
// §03 — Coach IA (dark section)
// ─────────────────────────────────────────────────

function CoachIA({ t, onSignUp }) {
  const suggestions = [
    'Devrais-je ouvrir un 3A ?',
    'Je peux acheter ce vélo à CHF 1\'200 ?',
    'Combien j\'ai dépensé en café ce mois ?',
    'Mes économies tiennent combien de temps ?',
  ];
  return (
    <section id="coach" className="bg-zinc-950 text-zinc-100 py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-start mb-12 md:mb-16">
          <h2 className={`${SERIF} text-4xl md:text-5xl leading-[1.05] tracking-tight max-w-2xl`}>
            Pas un chatbot.
            <br />
            <span className={`italic ${ACCENT}`}>Un coach</span> qui connaît vos comptes.
          </h2>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 text-right">
            §03 / 07<br />Démonstration<br />en temps réel
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className={`${SERIF} text-2xl md:text-3xl leading-tight mb-4`}>
              Conçu pour les questions qu'on n'ose pas poser à son banquier.
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-8">
              Fatia croise vos transactions réelles, votre canton, votre âge et votre fiscalité suisse pour vous répondre avec des chiffres — pas des généralités.
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">— Essayer une question</p>
            <div className="space-y-2">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={onSignUp}
                  className="w-full text-left flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all text-xs"
                >
                  <span>{q}</span>
                  <ArrowRight size={12} className="text-zinc-500" />
                </button>
              ))}
            </div>
          </div>

          <CoachChatDemo />
        </div>
      </div>
    </section>
  );
}

function CoachChatDemo() {
  return (
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs">F</div>
          <div>
            <p className={`${SERIF} text-sm`}>Fatia</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ animation: 'sparkle-pulse 1.6s ease-in-out infinite' }} />
              Copilote financier · en ligne
            </p>
          </div>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Chiffré ✦</span>
      </div>
      <div className="p-5 min-h-[280px] flex flex-col gap-3">
        <div className="flex justify-end" style={{ animation: 'slide-in-right 0.5s ease-out 0.3s both' }}>
          <div className="bg-emerald-600 text-white text-xs rounded-2xl rounded-br-md max-w-[80%] px-4 py-2.5">
            Je veux mettre 800 CHF de côté chaque mois. C'est réaliste ?
          </div>
        </div>
        <div className="self-start" style={{ animation: 'fade-up 0.4s ease-out 1.2s both' }}>
          <div className="flex items-center gap-1 bg-zinc-800 px-3 py-2 rounded-2xl">
            {[0, 0.2, 0.4].map((d) => (
              <span key={d} className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ animation: `sparkle-pulse 1.4s ease-in-out ${d}s infinite` }} />
            ))}
          </div>
        </div>
        <div className="self-start" style={{ animation: 'slide-in-left 0.5s ease-out 2.0s both' }}>
          <div className="bg-zinc-800 text-zinc-100 text-xs rounded-2xl rounded-bl-md max-w-[85%] px-4 py-3 leading-relaxed">
            À votre profil <strong>Vaud, 35 ans</strong>, votre capacité d'épargne actuelle est de <strong className="text-emerald-400">~1'100 CHF/mois</strong>. 800 CHF est confortable. Suggestion : virement auto le jour du salaire, sur Viac 3A pour +1'742 CHF d'impôts économisés cette année.
          </div>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-zinc-800 flex items-center gap-2">
        <div className="flex-1 text-[11px] text-zinc-500">Pose une question…</div>
        <button className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
          <Send size={12} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// §04 — How it works
// ─────────────────────────────────────────────────

function HowItWorks({ t, onSignUp }) {
  const steps = [
    { n: '01', title: 'Créez votre compte', body: 'Email + mot de passe. Aucune carte bancaire requise.', sub: '30 secondes' },
    { n: '02', title: 'Profil par canton', body: 'Canton, permis, situation, prévoyance. Tout sera calibré pour vous.', sub: 'Wizard 4 étapes' },
    { n: '03', title: 'Coach + outils prêts', body: 'Dashboard, scanner, simulateur, coach IA contextuel.', sub: '14 jours illimités' },
  ];
  return (
    <section id="how-it-works" className={`py-20 md:py-28 ${t.bg}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-start mb-12 md:mb-16">
          <div>
            <Eyebrow t={t}>Comment ça marche</Eyebrow>
            <h2 className={`${SERIF} text-4xl md:text-5xl mt-3 leading-[1.05] tracking-tight ${t.tx}`}>
              De zéro à votre tableau de bord,<br />
              <span className={`italic ${ACCENT}`}>en moins de 3 minutes</span>.
            </h2>
          </div>
          <SectionTag number="04" tagline="Essai sans CB" t={t} />
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={s.n} className={`relative p-7 rounded-3xl border ${t.bd} ${t.dark ? 'bg-zinc-900' : 'bg-white'}`} style={{ animation: `fade-up 0.6s ease-out ${0.1 + i * 0.12}s both` }}>
              <p className={`${SERIF} text-5xl ${ACCENT}`}>{s.n}</p>
              <h3 className={`${SERIF} text-xl mt-4 ${t.tx}`}>{s.title}</h3>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${ACCENT}`}>{s.sub}</p>
              <p className={`text-xs mt-3 leading-relaxed ${t.mt}`}>{s.body}</p>
              {i < steps.length - 1 && (
                <ArrowRight size={20} className={`hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 ${t.mt} z-10`} style={{ animation: 'sparkle-pulse 2.8s ease-in-out infinite' }} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button onClick={onSignUp} className={`inline-flex items-center gap-2 px-6 py-3.5 ${t.dark ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'} font-bold rounded-full text-sm hover:scale-[1.02] transition-transform`}>
            Commencer maintenant <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────
// §05 — Overview (3 phones + features grid)
// ─────────────────────────────────────────────────

function Overview({ t }) {
  const features = [
    { icon: Sparkles, title: 'Onboarding par canton', body: '26 cantons · permis · situation · prévoyance. Tout est calibré pour votre réalité.' },
    { icon: GraduationCap, title: 'Académie · 66 leçons', body: 'Cantons, frontaliers, immobilier, 3A comparé, Sàrl, TVA, QR-bill, poursuites.' },
    { icon: Camera, title: 'Scanner IA · Claude Vision', body: 'Photo de reçu → montant, date, TVA, fournisseur extraits. JPG / PNG / PDF.' },
    { icon: FileText, title: 'QR-factures conformes', body: 'Génération PDF avec QR-bill scannable. Conforme norme suisse depuis 2022.' },
    { icon: MapPin, title: 'Simulateur 26 cantons', body: '"Déménager à Zoug = combien d\'économies ?" Impôts + LAMal en 3 secondes.' },
    { icon: LifeBuoy, title: 'SOS Poursuite', body: 'Le seul outil suisse qui aborde dettes et désendettement directement, avec les ressources gratuites.' },
  ];
  return (
    <section className={`py-20 md:py-28 ${t.sf}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-start mb-12 md:mb-16">
          <div>
            <Eyebrow t={t}>L'app en un coup d'œil</Eyebrow>
            <h2 className={`${SERIF} text-4xl md:text-5xl mt-3 leading-[1.05] tracking-tight ${t.tx}`}>
              Une vue d'ensemble<br />
              <span className={`italic ${ACCENT}`}>complète</span>.
            </h2>
          </div>
          <SectionTag number="05" tagline="iOS · Android" t={t} />
        </div>

        {/* 3 phones */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-16">
          {[
            { tag: 'Accueil', title: 'Vue d\'ensemble', render: <DashboardScreen t={t} /> },
            { tag: 'Épargne', title: 'Objectifs vivants', render: <GoalsScreen t={t} /> },
            { tag: 'Copilote', title: 'Conversations utiles', render: <ChatScreen t={t} /> },
          ].map((p, i) => (
            <div key={p.tag} style={{ animation: `fade-up 0.7s ease-out ${0.1 + i * 0.12}s both` }}>
              <PhoneFrame t={t} size="sm">
                {p.render}
              </PhoneFrame>
              <div className="text-center mt-6">
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${t.mt}`}>— 0{i + 1} · {p.tag}</p>
                <p className={`${SERIF} text-lg ${t.tx} mt-1`}>{p.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Ic = f.icon;
            return (
              <div key={f.title} className={`p-5 rounded-2xl border ${t.bd} ${t.dark ? 'bg-zinc-900' : 'bg-white'} transition-transform hover:-translate-y-1`}>
                <div className={`w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3`}>
                  <Ic size={18} />
                </div>
                <h4 className={`${SERIF} text-base ${t.tx}`}>{f.title}</h4>
                <p className={`text-xs leading-relaxed mt-2 ${t.mt}`}>{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GoalsScreen({ t }) {
  const goals = [
    { l: 'Vacances en Italie', pct: 68, cur: 2400, tot: 3500, color: 'bg-emerald-500' },
    { l: 'Nouveau vélo', pct: 71, cur: 850, tot: 1200, color: 'bg-amber-500' },
    { l: 'Acompte logement', pct: 46, cur: 18400, tot: 40000, color: 'bg-blue-500' },
    { l: 'Fonds d\'urgence', pct: 78, cur: 6200, tot: 8000, color: 'bg-purple-500' },
  ];
  return (
    <>
      <p className={`text-[8px] font-bold uppercase tracking-wider ${t.mt}`}>Mes objectifs</p>
      <p className={`${SERIF} text-lg mt-0.5 mb-3 ${t.tx}`}>Épargne</p>
      <div className="space-y-2">
        {goals.map((g) => (
          <div key={g.l}>
            <div className="flex justify-between items-baseline mb-1">
              <p className={`text-[9px] font-bold ${t.tx}`}>{g.l}</p>
              <p className={`text-[9px] font-bold ${t.tx}`}>{g.pct}%</p>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${t.dark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
              <div className={`h-full ${g.color}`} style={{ width: `${g.pct}%` }} />
            </div>
            <div className="flex justify-between mt-0.5">
              <p className={`text-[7px] ${t.mt}`}>CHF {g.cur.toLocaleString('fr-CH')}</p>
              <p className={`text-[7px] ${t.mt}`}>/ CHF {g.tot.toLocaleString('fr-CH')}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={`mt-3 p-2 rounded-xl ${t.dark ? 'bg-emerald-950/40' : 'bg-emerald-50'}`}>
        <p className={`text-[8px] font-bold ${t.dark ? 'text-emerald-300' : 'text-emerald-700'}`}>+ INSIGHT</p>
        <p className={`text-[8px] mt-0.5 ${t.tx}`}>À ce rythme, vous atteignez votre 1er objectif en 5 semaines.</p>
      </div>
    </>
  );
}

function ChatScreen({ t }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: t.dark ? '#27272a' : '#e4e4e7' }}>
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[8px] font-bold flex items-center justify-center">F</div>
        <div>
          <p className={`${SERIF} text-xs ${t.tx}`}>Fatia</p>
          <p className="text-[7px] text-emerald-500 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />Copilote · en ligne
          </p>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-end">
          <div className="bg-emerald-600 text-white text-[8px] px-2.5 py-1.5 rounded-xl rounded-br-sm max-w-[85%]">
            Combien je peux dépenser ce weekend ?
          </div>
        </div>
        <div className="flex">
          <div className={`${t.dark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-800'} text-[8px] px-2.5 py-1.5 rounded-xl rounded-bl-sm max-w-[85%]`}>
            Sur la base de ton budget restant, <strong>CHF 142</strong> sans toucher à ton épargne.
          </div>
        </div>
        <div className={`mt-2 p-2 rounded-xl ${t.dark ? 'bg-zinc-900 border border-zinc-800' : 'bg-stone-50 border border-zinc-200'}`}>
          <p className={`text-[7px] font-bold ${t.dark ? 'text-emerald-400' : 'text-emerald-600'} mb-1`}>+ SIMULATION</p>
          <div className="flex justify-between text-[7px]">
            <span className={t.tx}>Restaurant (×2)</span>
            <span className={t.tx}>CHF 80</span>
          </div>
          <div className="flex justify-between text-[7px]">
            <span className={t.tx}>Sorties</span>
            <span className={t.tx}>CHF 62</span>
          </div>
        </div>
      </div>
      <div className={`mt-3 px-2.5 py-1.5 rounded-full flex items-center justify-between ${t.dark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
        <span className={`text-[8px] ${t.mt}`}>Pose une question…</span>
        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
          <Send size={6} className="text-white" />
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────
// §06 — SOS Poursuites
// ─────────────────────────────────────────────────

function SOSPoursuite({ t, onSignUp }) {
  return (
    <section className={`py-20 md:py-28 ${t.bg}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-start mb-10 md:mb-14">
          <div className="max-w-3xl">
            <Eyebrow t={t}>Le sujet que personne n'aborde</Eyebrow>
            <h2 className={`${SERIF} text-4xl md:text-5xl mt-3 leading-[1.05] tracking-tight ${t.tx}`}>
              En difficulté ?<br />
              <span className="italic text-rose-600">Vous n'êtes pas seul·e</span>.
            </h2>
          </div>
          <SectionTag number="06" tagline="Différenciateur clé" t={t} />
        </div>

        <div className="grid md:grid-cols-[1.3fr_1fr] gap-6 items-stretch">
          <div className={`relative overflow-hidden rounded-3xl p-8 md:p-10 ${t.dark ? 'bg-rose-950/30 border border-rose-500/30' : 'bg-rose-50 border border-rose-200'}`}>
            <div aria-hidden className={`absolute -top-10 -right-10 w-60 h-60 rounded-full blur-3xl ${t.dark ? 'bg-rose-500/15' : 'bg-rose-300/40'}`} />
            <div className="relative">
              <p className={`text-sm leading-relaxed ${t.tx}`}>
                <strong className={SERIF + ' text-2xl block mb-3'}>
                  1 personne sur 7 en Suisse a des dettes.
                </strong>
                Le seul outil suisse qui aborde poursuites, désendettement et article 725 CO directement — avec les ressources gratuites, étape par étape, sans jugement.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mt-7">
                <Bullet t={t} text="L'opposition à un commandement de payer est GRATUITE — 10 jours pour la faire" />
                <Bullet t={t} text="Caritas, CSP, Dettes Conseils Suisse — services gratuits documentés dans l'app" />
                <Bullet t={t} text="Coach IA détecte les signaux et oriente vers les bonnes ressources" />
                <Bullet t={t} text="Pour les Pro : article 725 CO, sursis concordataire, restructuration" />
              </div>
              <button onClick={onSignUp} className="mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-colors">
                Voir la vue SOS Poursuite <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className={`rounded-3xl p-8 ${t.dark ? 'bg-zinc-900' : 'bg-zinc-50'} flex flex-col justify-center`}>
            <Eyebrow t={t}>Note honnête</Eyebrow>
            <p className={`${SERIF} text-xl mt-3 mb-4 leading-tight ${t.tx}`}>
              Une app ne remplace pas un humain.
            </p>
            <p className={`text-xs leading-relaxed ${t.mt}`}>
              Pour une vraie situation de surendettement, contactez un service de désendettement local — gratuit, anonyme, sans trace. FatiaBill vous donne les outils et les bons numéros, mais l'aide finale vient toujours d'humains formés.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bullet({ t, text }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <Check size={14} className="text-rose-600 flex-shrink-0 mt-0.5" strokeWidth={3} />
      <span className={t.tx}>{text}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────
// §07 — Pricing
// ─────────────────────────────────────────────────

function Pricing({ t, onSignUp }) {
  const plans = [
    {
      tag: 'Essentiel',
      name: 'Découverte',
      price: '0',
      sub: 'Pour comprendre vos finances. Pour toujours.',
      features: ['Dashboard budget', '5 charges fixes · 2 objectifs', '3 messages IA / mois', 'Académie de base', 'Simulateur 26 cantons'],
      cta: 'Commencer gratuitement',
      variant: 'light',
    },
    {
      tag: 'Le plus choisi',
      name: 'Privé Premium',
      price: '9',
      sub: 'Pour reprendre le contrôle, sans y penser.',
      features: ['Tout du Gratuit, illimité', 'Académie complète (40 leçons)', 'Coach IA contextuel illimité', 'Décomposition brut → net', 'Comparateur 3A', 'SOS Poursuite complet'],
      cta: 'Essai 14 jours',
      variant: 'dark',
      highlighted: true,
    },
    {
      tag: 'Indépendant·e / Sàrl',
      name: 'Pro Premium',
      price: '29',
      sub: 'Pour ceux qui facturent et gèrent une activité.',
      features: ['Tout du Privé', 'Scanner factures IA', 'QR-factures + envoi email', 'Académie Pro (26 modules)', 'Recouvrement & article 725 CO', 'Coach business IA'],
      cta: 'Essai 14 jours',
      variant: 'light',
    },
  ];

  return (
    <section className={`py-20 md:py-28 ${t.sf}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-start mb-12 md:mb-16">
          <div>
            <Eyebrow t={t}>Tarifs</Eyebrow>
            <h2 className={`${SERIF} text-4xl md:text-5xl mt-3 leading-[1.05] tracking-tight ${t.tx}`}>
              Un abonnement.<br />
              <span className={`italic ${ACCENT}`}>Aucun frais caché</span>.
            </h2>
          </div>
          <SectionTag number="07" tagline="Annulable à tout moment" t={t} />
        </div>

        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`p-8 rounded-3xl flex flex-col ${
                p.highlighted
                  ? 'bg-zinc-900 text-white ring-2 ring-emerald-500/30'
                  : `border ${t.bd} ${t.dark ? 'bg-zinc-900' : 'bg-white'}`
              }`}
            >
              <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${p.highlighted ? 'text-emerald-400' : ACCENT}`}>
                — {p.tag}
              </p>
              <h3 className={`${SERIF} text-2xl mt-3 ${p.highlighted ? 'text-white' : t.tx}`}>{p.name}</h3>
              <div className="flex items-baseline gap-2 mt-5 mb-3">
                <span className={`${SERIF} text-5xl ${p.highlighted ? 'text-white' : t.tx}`}>CHF {p.price}</span>
                <span className={`text-xs ${p.highlighted ? 'text-zinc-400' : t.mt}`}>/mois</span>
              </div>
              <p className={`text-xs leading-relaxed mb-6 ${p.highlighted ? 'text-zinc-300' : t.mt}`}>{p.sub}</p>
              <div className={`h-px ${p.highlighted ? 'bg-zinc-800' : t.bd === 'border-zinc-800' ? 'bg-zinc-800' : 'bg-zinc-200'} mb-5`} />
              <ul className="space-y-2.5 mb-7 flex-1">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <Check size={13} className={`mt-0.5 flex-shrink-0 ${p.highlighted ? 'text-emerald-400' : 'text-emerald-600'}`} strokeWidth={3} />
                    <span className={p.highlighted ? 'text-zinc-200' : t.tx}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onSignUp}
                className={`w-full py-3 rounded-full font-bold text-sm flex items-center justify-center gap-1.5 transition-all ${
                  p.highlighted
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-900'
                    : `border ${t.bd} ${t.tx} ${t.dark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`
                }`}
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

// ─────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────

function FAQ({ t }) {
  const qs = [
    { q: 'Pourquoi 14 jours d\'essai gratuit ?', a: 'Parce qu\'on est confiants : si en 14 jours vous n\'avez pas vu de différence dans votre gestion, vous n\'aurez pas envie de payer. Et c\'est OK.' },
    { q: 'Faut-il une carte bancaire pour l\'essai ?', a: 'Non. Email + mot de passe, profil, et vous démarrez. La carte n\'arrive que si vous décidez de passer Premium après les 14 jours.' },
    { q: 'Où sont mes données ?', a: 'Hébergées en Europe (Supabase EU), conformes RGPD/LPD. Aucune revente, aucun partage. Vos scans IA passent par Anthropic (Claude) sans rétention. Vous pouvez supprimer votre compte à tout moment.' },
    { q: 'Pour qui FatiaBill est-il fait ?', a: 'Particuliers qui veulent maîtriser leur budget et leur fiscalité suisse, frontaliers, indépendant·es et petites Sàrl qui veulent un outil utile au quotidien — scan de factures, QR-bills, coach business — sans payer le prix d\'une suite comptable complète.' },
    { q: 'Puis-je annuler à tout moment ?', a: 'Oui, depuis votre dashboard ou Stripe. Vous gardez l\'accès jusqu\'à la fin du mois payé, puis vous repassez en plan Gratuit avec accès à vos données historiques.' },
    { q: 'Comment FatiaBill aborde-t-il les dettes / poursuites ?', a: 'C\'est l\'un de nos différenciateurs majeurs. Une section dédiée "SOS Poursuite" guide pas à pas, oriente vers les services gratuits suisses (Caritas, CSP, Dettes Conseils Suisse), et le coach IA détecte automatiquement les signaux de difficulté financière pour répondre avec calme et ressources concrètes.' },
  ];
  return (
    <section className={`py-20 md:py-28 ${t.bg}`}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <Eyebrow t={t}>FAQ</Eyebrow>
          <h2 className={`${SERIF} text-4xl md:text-5xl mt-3 leading-[1.05] tracking-tight ${t.tx}`}>
            Questions <span className={`italic ${ACCENT}`}>fréquentes</span>.
          </h2>
        </div>
        <div className="space-y-3">
          {qs.map((q, i) => (
            <details key={i} className={`p-5 rounded-2xl border group ${t.bd} ${t.dark ? 'bg-zinc-900' : 'bg-white'}`}>
              <summary className={`${SERIF} text-base cursor-pointer flex items-center justify-between gap-3 ${t.tx}`}>
                <span>{q.q}</span>
                <ChevronUp size={16} className={`${t.mt} group-open:rotate-180 transition-transform flex-shrink-0`} />
              </summary>
              <p className={`text-sm mt-4 leading-relaxed ${t.mt}`}>{q.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────

function Footer({ t }) {
  return (
    <footer className={`border-t py-12 ${t.bd}`}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <span className={`text-[10px] ${t.mt}`}>· Conçu en Suisse 🇨🇭</span>
        </div>
        <div className={`flex items-center gap-4 text-[11px] font-bold ${t.mt}`}>
          <a href="mailto:hello@fatiabill.ch" className="hover:text-emerald-600 transition-colors">hello@fatiabill.ch</a>
          <span>·</span>
          <span>© {new Date().getFullYear()} FatiaBill</span>
        </div>
      </div>
    </footer>
  );
}
