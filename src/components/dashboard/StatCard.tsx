/**
 * Small reusable card for the dashboard "stats" row.
 * Each card shows a value, a label, and a comparison / hint line.
 */
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  trend?: number; // % change vs last period
  icon: ReactNode;
  accent?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
}

const accentMap: Record<NonNullable<Props['accent']>, string> = {
  indigo: 'from-indigo-500 to-violet-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
  rose: 'from-rose-500 to-pink-500',
  sky: 'from-sky-500 to-cyan-500',
};

export default function StatCard({ label, value, hint, trend, icon, accent = 'indigo' }: Props) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {value}
          </p>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md ${accentMap[accent]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">{hint}</span>
        {typeof trend === 'number' && (
          <span className={trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
            {trend >= 0 ? '+' : ''}
            {trend.toFixed(1)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}
