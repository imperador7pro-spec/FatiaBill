export function getTheme(darkMode, mode) {
  const dk = !!darkMode;
  return {
    dk,
    accent: mode === 'pro' ? 'indigo' : 'emerald',
    bg: dk ? 'bg-zinc-950' : 'bg-stone-50',
    cd: dk ? 'bg-zinc-900' : 'bg-white',
    bd: dk ? 'border-zinc-800' : 'border-stone-200',
    tx: dk ? 'text-zinc-100' : 'text-stone-900',
    mt: dk ? 'text-zinc-500' : 'text-stone-500',
    inp: dk ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-stone-50 border-stone-200 text-stone-900',
    sf: dk ? 'bg-zinc-800' : 'bg-stone-100',
    hv: dk ? 'hover:bg-zinc-800' : 'hover:bg-stone-100',
  };
}
