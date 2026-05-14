import React from 'react';
import { BookOpen } from 'lucide-react';
import { AcademyView } from './Academy.jsx';
import { ACADEMY_PRO_MODULES } from '../academy.js';

export function GuidePro({ theme, completedLessons, xp, isPremium, onOpenLesson }) {
  return (
    <AcademyView
      theme={theme}
      modules={ACADEMY_PRO_MODULES}
      completedLessons={completedLessons}
      xp={xp}
      isPremium={isPremium}
      onOpenLesson={onOpenLesson}
      title="Guide Pro Suisse"
      subtitle="Création d'entreprise · TVA · Fiscalité · RH"
      headerColor="indigo"
      headerIcon={BookOpen}
    />
  );
}
