import React, { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'fatiabill_cookie_notice_v1';

export function CookieBanner({ onOpenPrivacy }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    } catch (e) {
      // localStorage unavailable (private mode strict): show banner anyway
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, new Date().toISOString()); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-md z-40 rounded-2xl border border-zinc-200 bg-white shadow-2xl p-4 flex gap-3 items-start"
      style={{ animation: 'fade-up 0.4s ease-out both' }}
      role="dialog"
      aria-label="Information cookies"
    >
      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
        <Cookie size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-zinc-900 mb-1">Cookies essentiels uniquement</p>
        <p className="text-[11px] leading-relaxed text-zinc-600">
          FatiaBill utilise uniquement des cookies strictement nécessaires (connexion, paiement). Aucun tracker tiers, aucune publicité.{' '}
          <button onClick={onOpenPrivacy} className="text-emerald-600 font-bold underline hover:text-emerald-700">
            En savoir plus
          </button>
        </p>
        <button
          onClick={dismiss}
          className="mt-2.5 px-4 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
        >
          J'ai compris
        </button>
      </div>
      <button onClick={dismiss} className="p-1 -m-1 text-zinc-400 hover:text-zinc-700 flex-shrink-0" aria-label="Fermer">
        <X size={14} />
      </button>
    </div>
  );
}
