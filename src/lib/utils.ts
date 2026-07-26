/**
 * Pure formatting helpers that don't depend on React.
 * Keeping them in one file makes them easy to unit-test.
 */

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

/** A small palette of colour keys that map well to Tailwind utility classes. */
export const CATEGORY_COLORS = [
  'indigo',
  'emerald',
  'rose',
  'amber',
  'sky',
  'violet',
  'teal',
  'fuchsia',
  'lime',
  'orange',
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

/** Returns Tailwind classes for a given colour key (works in both modes). */
export function colorClasses(color: string): { bg: string; text: string; ring: string } {
  // We use semantic Tailwind classes so light/dark mode both look right.
  const map: Record<string, { bg: string; text: string; ring: string }> = {
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-500/15',
      text: 'text-indigo-700 dark:text-indigo-300',
      ring: 'ring-indigo-200 dark:ring-indigo-500/30',
    },
    emerald: {
      bg: 'bg-emerald-100 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-300',
      ring: 'ring-emerald-200 dark:ring-emerald-500/30',
    },
    rose: {
      bg: 'bg-rose-100 dark:bg-rose-500/15',
      text: 'text-rose-700 dark:text-rose-300',
      ring: 'ring-rose-200 dark:ring-rose-500/30',
    },
    amber: {
      bg: 'bg-amber-100 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-300',
      ring: 'ring-amber-200 dark:ring-amber-500/30',
    },
    sky: {
      bg: 'bg-sky-100 dark:bg-sky-500/15',
      text: 'text-sky-700 dark:text-sky-300',
      ring: 'ring-sky-200 dark:ring-sky-500/30',
    },
    violet: {
      bg: 'bg-violet-100 dark:bg-violet-500/15',
      text: 'text-violet-700 dark:text-violet-300',
      ring: 'ring-violet-200 dark:ring-violet-500/30',
    },
    teal: {
      bg: 'bg-teal-100 dark:bg-teal-500/15',
      text: 'text-teal-700 dark:text-teal-300',
      ring: 'ring-teal-200 dark:ring-teal-500/30',
    },
    fuchsia: {
      bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/15',
      text: 'text-fuchsia-700 dark:text-fuchsia-300',
      ring: 'ring-fuchsia-200 dark:ring-fuchsia-500/30',
    },
    lime: {
      bg: 'bg-lime-100 dark:bg-lime-500/15',
      text: 'text-lime-700 dark:text-lime-300',
      ring: 'ring-lime-200 dark:ring-lime-500/30',
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-500/15',
      text: 'text-orange-700 dark:text-orange-300',
      ring: 'ring-orange-200 dark:ring-orange-500/30',
    },
  };
  return map[color] ?? map.indigo;
}
