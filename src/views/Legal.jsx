import React, { useEffect } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Logo } from '../logo.jsx';
import { CGU } from '../legal/cgu.js';
import { PRIVACY_POLICY } from '../legal/privacy.js';
import { MENTIONS_LEGALES } from '../legal/mentions.js';

const DOCS = {
  cgu: CGU,
  privacy: PRIVACY_POLICY,
  mentions: MENTIONS_LEGALES,
};

const ORDER_LINKS = [
  { key: 'cgu', label: 'CGU' },
  { key: 'privacy', label: 'Confidentialité' },
  { key: 'mentions', label: 'Mentions légales' },
];

function renderInline(text) {
  // Render **bold** and \n as line breaks.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return p.split('\n').map((line, j, arr) => (
      <React.Fragment key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  });
}

export function Legal({ page = 'cgu', onClose, onNavigate }) {
  const doc = DOCS[page] || DOCS.cgu;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-2 text-sm font-bold text-zinc-700 hover:text-zinc-900 transition-colors">
            <ArrowLeft size={16} /> Retour
          </button>
          <Logo size="md" />
        </div>
        <nav className="max-w-3xl mx-auto px-6 pb-3 flex flex-wrap gap-2">
          {ORDER_LINKS.map((l) => (
            <button
              key={l.key}
              onClick={() => onNavigate?.(l.key)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                page === l.key
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {l.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight mb-2">
          {doc.title}
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-10">
          Dernière mise à jour · {doc.updated}
        </p>

        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 mb-10 flex items-start gap-3">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 leading-relaxed">
            <strong>Document en cours de finalisation.</strong> Ces termes sont rédigés comme une base solide mais n'ont pas encore été validés par un avocat suisse spécialisé. Une révision juridique est prévue avant le lancement public. Pour toute question urgente, écrivez à <a href="mailto:hello@fatiabill.ch" className="font-bold underline">hello@fatiabill.ch</a>.
          </p>
        </div>

        <div className="space-y-10">
          {doc.sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-xl md:text-2xl text-zinc-900 mb-4 leading-tight">
                {s.title}
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-zinc-700">
                {s.paragraphs.map((p, i) => (
                  <p key={i}>{renderInline(p)}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-16 pt-8 border-t border-zinc-200 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Duares Systems · Aclens, Suisse</p>
        </footer>
      </main>
    </div>
  );
}
