import React from 'react';

export function EmptyState({ theme, icon: Icon, title, description, ctaLabel, onCta, hint, accent = 'emerald' }) {
  return (
    <div className={`p-8 md:p-10 text-center rounded-3xl border border-dashed ${theme.bd} ${theme.cd}`}>
      {Icon && (
        <div className={`mx-auto mb-3 w-12 h-12 rounded-2xl flex items-center justify-center bg-${accent}-500/10 text-${accent}-500`}>
          <Icon size={22} />
        </div>
      )}
      <h4 className={`font-black text-sm mb-1 ${theme.tx}`}>{title}</h4>
      {description && (
        <p className={`text-xs ${theme.mt} leading-relaxed mb-4 max-w-xs mx-auto`}>{description}</p>
      )}
      {onCta && ctaLabel && (
        <button
          onClick={onCta}
          className={`px-5 py-2 rounded-xl text-white font-bold text-xs bg-${accent}-600 hover:bg-${accent}-500 transition-colors`}
        >
          {ctaLabel}
        </button>
      )}
      {hint && (
        <p className={`mt-3 text-[10px] ${theme.mt} italic`}>{hint}</p>
      )}
    </div>
  );
}
