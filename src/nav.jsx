import React from 'react';
import {
  Zap, Landmark, Flame, Crown, Sun, Moon, LogOut, Sparkles, AlertCircle,
  CheckSquare, Target, GraduationCap, MessageCircle, Settings,
  LayoutDashboard, Receipt, Camera, FileSignature, BookOpen,
} from 'lucide-react';

export function TopNav({ theme, mode, xp, streak, effPlan, trialLeft, trialExpired, onUpgrade, onToggleDark, onSignOut }) {
  const isPremium = effPlan === 'premium';
  const isTrial = effPlan === 'trial';

  return (
    <nav className={`sticky top-0 z-30 border-b backdrop-blur-xl ${theme.dk ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-stone-200'}`}>
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-xl text-white bg-${theme.accent}-600`}>
            {mode === 'pro' ? <Landmark size={15} /> : <Zap size={15} />}
          </div>
          <span className="font-black text-lg tracking-tighter">
            FatiaBill<span className={`text-${theme.accent}-500`}>.</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {mode === 'private' && xp > 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${theme.dk ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
              <Flame size={12} />{xp}{streak >= 3 && <span>🔥{streak}</span>}
            </div>
          )}
          {isPremium && (
            <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black ${theme.dk ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              <Crown size={11} />PREMIUM
            </span>
          )}
          {isTrial && (
            <button onClick={onUpgrade} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <Sparkles size={11} />Essai · {trialLeft}j
            </button>
          )}
          {!isPremium && !isTrial && (
            <button onClick={onUpgrade} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <Crown size={11} />Premium
            </button>
          )}
          <button onClick={onToggleDark} className={`p-2 rounded-full ${theme.dk ? 'text-yellow-400 bg-zinc-900' : 'text-stone-500 bg-stone-100'}`}>
            {theme.dk ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={onSignOut} className={`p-2 rounded-full ${theme.dk ? 'text-zinc-500 bg-zinc-900' : 'text-stone-400 bg-stone-100'}`}>
            <LogOut size={15} />
          </button>
        </div>
      </div>
      {(isTrial || trialExpired) && (
        <TrialBanner theme={theme} isTrial={isTrial} trialLeft={trialLeft} onUpgrade={onUpgrade} />
      )}
    </nav>
  );
}

function TrialBanner({ theme, isTrial, trialLeft, onUpgrade }) {
  if (isTrial) {
    const urgent = trialLeft <= 3;
    return (
      <div className={`max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-xs ${urgent
        ? (theme.dk ? 'bg-amber-950/40' : 'bg-amber-50') + ' border-t border-amber-500/30'
        : (theme.dk ? 'bg-indigo-950/30' : 'bg-indigo-50') + ' border-t border-indigo-500/20'}`}>
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={14} className={urgent ? 'text-amber-500' : 'text-indigo-500'} />
          <span className={`font-bold ${theme.tx} truncate`}>
            Essai gratuit · <strong>{trialLeft} jour{trialLeft > 1 ? 's' : ''}</strong> restant{trialLeft > 1 ? 's' : ''}
          </span>
        </div>
        <button onClick={onUpgrade} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase whitespace-nowrap ${urgent ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'}`}>
          Passer Premium
        </button>
      </div>
    );
  }
  return (
    <div className={`max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-xs border-t border-rose-500/30 ${theme.dk ? 'bg-rose-950/30' : 'bg-rose-50'}`}>
      <div className="flex items-center gap-2 min-w-0">
        <AlertCircle size={14} className="text-rose-500 flex-shrink-0" />
        <span className={`font-bold ${theme.tx} truncate`}>
          Essai terminé · Passez Premium pour tout débloquer
        </span>
      </div>
      <button onClick={onUpgrade} className="px-3 py-1 rounded-lg text-[10px] font-black uppercase whitespace-nowrap bg-rose-600 text-white">
        Débloquer
      </button>
    </div>
  );
}

const NAV_PRIVATE = [
  { key: 'dashboard', icon: CheckSquare },
  { key: 'savings', icon: Target },
  { key: 'academy', icon: GraduationCap, special: true },
  { key: 'ai', icon: MessageCircle, special: true },
  { key: 'setup', icon: Settings },
];

const NAV_PRO = [
  { key: 'pro_dashboard', icon: LayoutDashboard },
  { key: 'transactions', icon: Receipt },
  { key: 'scanner', icon: Camera },
  { key: 'tax_report', icon: FileSignature },
  { key: 'ai_pro', icon: MessageCircle, special: true },
  { key: 'academy_pro', icon: BookOpen },
  { key: 'setup', icon: Settings },
];

export function TabBar({ theme, mode, view, onChangeView }) {
  const items = mode === 'private' ? NAV_PRIVATE : NAV_PRO;
  return (
    <div className={`flex flex-wrap gap-1 p-1 rounded-2xl ${theme.dk ? 'bg-zinc-900' : 'bg-stone-200/80'}`}>
      {items.map(({ key, icon: Ic, special }) => {
        const active = view === key;
        const cls = active
          ? (special
              ? `bg-${theme.accent}-500/10 text-${theme.accent}-500`
              : (theme.dk ? 'bg-zinc-800 text-white' : 'bg-white text-stone-900 shadow-sm'))
          : theme.mt;
        return (
          <button
            key={key}
            onClick={() => onChangeView(key)}
            className={`flex-1 min-w-[60px] py-2 rounded-xl font-black text-[9px] uppercase flex flex-col items-center justify-center gap-0.5 transition-all ${cls}`}
          >
            <Ic size={13} />
          </button>
        );
      })}
    </div>
  );
}
