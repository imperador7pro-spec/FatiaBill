import React from 'react';
import { GraduationCap, Trophy, Check, Lock, Play, ChevronRight } from 'lucide-react';
import { ACADEMY_MODULES, getIcon } from '../data.js';

export function Academy({ theme, completedLessons, xp, isPremium, onOpenLesson }) {
  const totalLessons = ACADEMY_MODULES.reduce((a, m) => a + m.lessons.length, 0);
  const doneCount = completedLessons.length;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <GraduationCap size={26} />
        </div>
        <h3 className="font-black text-xl">Académie Financière</h3>
        <p className={`text-xs ${theme.mt}`}>{totalLessons} leçons · {doneCount} faites · {xp} XP</p>
        <div className={`w-full max-w-xs mx-auto h-2 rounded-full overflow-hidden mt-2 ${theme.sf}`}>
          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{ width: `${(doneCount / totalLessons) * 100}%` }} />
        </div>
      </div>
      {ACADEMY_MODULES.map((mod) => {
        const Mi = getIcon(mod.icon);
        const completedInModule = mod.lessons.filter((l) => completedLessons.includes(l.id)).length;
        return (
          <div key={mod.id} className={`rounded-2xl border overflow-hidden ${theme.cd} ${theme.bd}`}>
            <div className={`p-4 border-b ${theme.bd} flex items-center gap-3`}>
              <div className={`p-2 rounded-xl bg-${mod.color}-500/10 text-${mod.color}-500`}><Mi size={20} /></div>
              <div className="flex-1">
                <h4 className="font-black text-xs uppercase">{mod.title}</h4>
                <p className={`text-[9px] ${theme.mt}`}>{completedInModule}/{mod.lessons.length}</p>
              </div>
              {completedInModule === mod.lessons.length && <Trophy size={18} className="text-amber-500" />}
            </div>
            <div className={`divide-y ${theme.dk ? 'divide-zinc-800' : 'divide-stone-100'}`}>
              {mod.lessons.map((l) => {
                const done = completedLessons.includes(l.id);
                const locked = !l.free && !isPremium;
                return (
                  <button
                    key={l.id}
                    onClick={() => onOpenLesson(l)}
                    className={`w-full p-3 flex items-center gap-3 text-left ${theme.hv} ${locked ? 'opacity-50' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500 text-white' : locked ? theme.sf : `bg-${mod.color}-500/10 text-${mod.color}-500`}`}>
                      {done ? <Check size={14} /> : locked ? <Lock size={12} /> : <Play size={12} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-xs truncate ${done ? 'line-through opacity-50' : ''}`}>{l.title}</p>
                      <p className={`text-[9px] ${theme.mt}`}>{l.dur}{locked ? ' · Premium' : ''}</p>
                    </div>
                    {done && <span className="text-[8px] font-bold text-emerald-500">+25</span>}
                    <ChevronRight size={14} className={theme.mt} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
