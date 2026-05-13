import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sun, Moon, User, Briefcase } from 'lucide-react';

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

export function AuthScreen({ theme, onSignIn, onSignUp }) {
  const [view, setView] = useState('login');
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
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-black italic tracking-tighter mb-2 ${theme.tx}`}>
            FatiaBill<span className="text-emerald-500">.</span>
          </h1>
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

export function ModeSelectionScreen({ theme, user, darkMode, onToggleDark, onSelectMode }) {
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme.bg}`}>
      <button
        onClick={onToggleDark}
        className={`absolute top-4 right-4 p-3 rounded-full z-10 ${darkMode ? 'bg-zinc-800 text-yellow-400' : 'bg-white text-stone-800 shadow-md'}`}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className="max-w-5xl w-full">
        <div className="text-center mb-10">
          <h1 className={`text-5xl font-black italic tracking-tighter mb-2 ${theme.tx}`}>
            FatiaBill<span className="text-emerald-500">.</span>
          </h1>
          <p className={`text-sm ${theme.mt}`}>
            Bienvenue {user?.email?.split('@')[0]} ! Choisissez votre mode.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => onSelectMode('private')}
            className={`p-8 rounded-3xl border-2 cursor-pointer group text-left ${darkMode ? 'bg-zinc-900 border-zinc-800 hover:border-emerald-500' : 'bg-white border-stone-100 hover:border-emerald-500 shadow-xl'}`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <User size={26} />
              </div>
              <div className="text-right">
                <div className={`text-xl font-black ${theme.tx}`}>Gratuit</div>
                <span className={`text-[9px] font-bold ${theme.mt}`}>Premium 9.-/mois</span>
              </div>
            </div>
            <h2 className={`text-2xl font-black mb-2 ${theme.tx}`}>Employé / Privé</h2>
            <p className={`${theme.mt} text-sm mb-5`}>Budget, épargne, Académie, coaching IA.</p>
            <span className="block w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-center">Démarrer Privé</span>
          </button>
          <button
            onClick={() => onSelectMode('pro')}
            className={`p-8 rounded-3xl border-2 cursor-pointer group relative text-left ${darkMode ? 'bg-indigo-950/50 border-indigo-900 hover:border-indigo-500' : 'bg-stone-900 border-stone-900 hover:border-indigo-500 shadow-xl'}`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase size={26} />
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-white">19.-<span className="text-sm text-stone-400">/mois</span></div>
              </div>
            </div>
            <div className="absolute top-5 right-5 bg-indigo-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Expert</div>
            <h2 className="text-2xl font-black mb-2 text-white">Indépendant / Sàrl</h2>
            <p className="text-stone-400 text-sm mb-5">Trésorerie, TVA, AVS, scanner, fiscal.</p>
            <span className="block w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-center">Démarrer Pro</span>
          </button>
        </div>
      </div>
    </div>
  );
}
