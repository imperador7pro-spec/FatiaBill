import React from 'react';
import { GraduationCap, BookOpen, Trophy, Check, Lock, Play, ChevronRight } from 'lucide-react';
import { ACADEMY_MODULES } from '../academy.js';
import { getIcon } from '../data.js';

export function Academy({ theme, completedLessons, xp, isPremium, onOpenLesson }) {
  return (
    <AcademyView
      theme={theme}
      modules={ACADEMY_MODULES}
      completedLessons={completedLessons}
      xp={xp}
      isPremium={isPremium}
      onOpenLesson={onOpenLesson}
      title="Académie Financière"
      subtitle="Maîtrisez vos finances en Suisse"
      headerColor="amber"
      headerIcon={GraduationCap}
    />
  );
}

export function AcademyView({
  theme, modules, completedLessons, xp, isPremium,
  onOpenLesson, title, subtitle, headerColor, headerIcon: HeaderIcon,
}) {
  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);
  const doneCount = modules.reduce(
    (a, m) => a + m.lessons.filter((l) => completedLessons.includes(l.id)).length,
    0,
  );

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="text-center mb-4">
        <div className={`w-12 h-12 bg-${headerColor}-500/10 text-${headerColor}-500 rounded-full flex items-center justify-center mx-auto mb-2`}>
          <HeaderIcon size={26} />
        </div>
        <h3 className="font-black text-xl">{title}</h3>
        {subtitle && <p className={`text-[11px] ${theme.mt} mt-0.5`}>{subtitle}</p>}
        <p className={`text-xs ${theme.mt} mt-2`}>{totalLessons} leçons · {doneCount} faites · {xp} XP</p>
        <div className={`w-full max-w-xs mx-auto h-2 rounded-full overflow-hidden mt-2 ${theme.sf}`}>
          <div
            className={`h-full bg-gradient-to-r from-${headerColor}-500 to-${headerColor === 'amber' ? 'orange' : 'purple'}-400 rounded-full transition-all`}
            style={{ width: `${(doneCount / Math.max(totalLessons, 1)) * 100}%` }}
          />
        </div>
      </div>
      {modules.map((mod) => {
        const Mi = getIcon(mod.icon);
        const completedInModule = mod.lessons.filter((l) => completedLessons.includes(l.id)).length;
        const allDone = completedInModule === mod.lessons.length;
        return (
          <div key={mod.id} className={`rounded-2xl border overflow-hidden ${theme.cd} ${theme.bd}`}>
            <div className={`p-4 border-b ${theme.bd} flex items-center gap-3`}>
              <div className={`p-2 rounded-xl bg-${mod.color}-500/10 text-${mod.color}-500`}><Mi size={20} /></div>
              <div className="flex-1">
                <h4 className="font-black text-xs uppercase">{mod.title}</h4>
                <p className={`text-[9px] ${theme.mt}`}>{completedInModule}/{mod.lessons.length} leçon{mod.lessons.length > 1 ? 's' : ''}</p>
              </div>
              {allDone && <Trophy size={18} className="text-amber-500" />}
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
                      <p className={`font-bold text-xs ${done ? 'line-through opacity-50' : ''}`}>{l.title}</p>
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
