import React from 'react';
import {
  Zap, Landmark, Flame, Crown, Sun, Moon, LogOut,
  CheckSquare, Target, GraduationCap, MessageCircle, Settings,
  LayoutDashboard, Receipt, Camera, FileSignature, BookOpen,
} from 'lucide-react';

export function TopNav({ theme, mode, xp, streak, isPremium, onUpgrade, onToggleDark, onSignOut }) {
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
          {!isPremium && (
            <button onClick={onUpgrade} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <Crown size={11} />Pro
            </button>
          )}
          {isPremium && (
            <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black ${theme.dk ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              <Crown size={11} />PRO
            </span>
          )}
          <button onClick={onToggleDark} className={`p-2 rounded-full ${theme.dk ? 'text-yellow-400 bg-zinc-900' : 'text-stone-500 bg-stone-100'}`}>
            {theme.dk ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={onSignOut} className={`p-2 rounded-full ${theme.dk ? 'text-zinc-500 bg-zinc-900' : 'text-stone-400 bg-stone-100'}`}>
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </nav>
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
