import React from 'react';

const SIZES = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-4xl',
  '2xl': 'text-5xl',
};

/**
 * FatiaBill logo — single source of truth.
 * Bold italic sans-serif with emerald period.
 * Used in TopBar, AuthScreen, OnboardingWizard, Footer, etc.
 */
export function Logo({ size = 'md', className = '' }) {
  return (
    <span className={`font-black italic tracking-tighter inline-block ${SIZES[size] || SIZES.md} ${className}`}>
      FatiaBill<span className="text-emerald-500">.</span>
    </span>
  );
}
