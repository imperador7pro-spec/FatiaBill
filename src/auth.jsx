import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Logo } from './logo.jsx';

export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500 font-bold text-sm">Chargement...</p>
      </div>
    </div>
  );
}

export function AuthScreen({ theme, initialView = 'login', onSignIn, onSignUp, onBack }) {
  const [view, setView] = useState(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!email || !password) return setError('Email et mot de passe requis');
    if (view === 'signup' && password.length < 6) return setError('Mot de passe: 6 caractères minimum');
    const fn = view === 'signup' ? onSignUp : onSignIn;
    const { error: e } = await fn(email, password);
    if (e) setError(e.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : e.message);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme.bg}`}>
      <div className="max-w-sm w-full">
        {onBack && (
          <button
            onClick={onBack}
            className={`flex items-center gap-1.5 text-xs font-bold mb-6 ${theme.mt} hover:${theme.tx} transition-colors`}
          >
            <ArrowLeft size={14} /> Retour à l'accueil
          </button>
        )}
        <div className="text-center mb-8">
          <Logo size="xl" className="mb-2" />
          <p className={`text-sm ${theme.mt}`}>Copilote financier suisse</p>
        </div>
        <div className={`p-6 rounded-3xl border ${theme.cd} ${theme.bd} shadow-xl`}>
          <h2 className={`text-lg font-black mb-4 ${theme.tx}`}>
            {view === 'login' ? 'Connexion' : 'Créer un compte'}
          </h2>
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-3">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="text-[8px] font-black uppercase text-stone-400">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.ch"
                  className={`w-full border rounded-xl p-2.5 pl-10 text-sm font-medium outline-none ${theme.inp} focus:border-emerald-500`}
                />
              </div>
            </div>
            <div>
              <label className="text-[8px] font-black uppercase text-stone-400">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="••••••"
                  className={`w-full border rounded-xl p-2.5 pl-10 pr-10 text-sm font-medium outline-none ${theme.inp} focus:border-emerald-500`}
                />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-stone-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button onClick={submit} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-colors">
              {view === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </div>
          <div className="mt-4 text-center">
            {view === 'login' ? (
              <p className={`text-xs ${theme.mt}`}>
                Pas encore de compte ?{' '}
                <button onClick={() => { setView('signup'); setError(''); }} className="text-emerald-600 font-bold underline">
                  Inscription
                </button>
              </p>
            ) : (
              <p className={`text-xs ${theme.mt}`}>
                Déjà un compte ?{' '}
                <button onClick={() => { setView('login'); setError(''); }} className="text-emerald-600 font-bold underline">
                  Connexion
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

