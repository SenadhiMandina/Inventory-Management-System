/**
 * A condensed list of the most recent stock movements.
 */
import { ArrowDownLeft, ArrowUpRight, Package, Pencil, Trash2 } from 'lucide-react';
import type { StockMovement } from '../../types';
import { formatDateTime, relativeTime } from '../../lib/utils';

const iconFor = (type: StockMovement['type']) => {
  switch (type) {
    case 'restock':
      return <ArrowUpRight size={14} className="text-emerald-600 dark:text-emerald-400" />;
    case 'sale':
      return <ArrowDownLeft size={14} className="text-rose-600 dark:text-rose-400" />;
    case 'create':
      return <Package size={14} className="text-sky-600 dark:text-sky-400" />;
    case 'update':
      return <Pencil size={14} className="text-amber-600 dark:text-amber-400" />;
    case 'delete':
      return <Trash2 size={14} className="text-slate-500" />;
  }
};

const labelFor = (m: StockMovement) => {
  switch (m.type) {
    case 'restock':
      return `+${m.quantityChange} restocked`;
    case 'sale':
      return `${m.quantityChange} sold`;
    case 'create':
      return `Product created (${m.quantityChange} units)`;
    case 'update':
      return 'Details updated';
    case 'delete':
      return 'Product deleted';
  }
};

interface Props {
  movements: StockMovement[];
  limit?: number;
}

export default function MovementList({ movements, limit = 8 }: Props) {
  if (movements.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        No stock movements recorded yet.
      </p>
    );
  }

  const items = movements.slice(0, limit);

  return (
    <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
      {items.map((m) => (
        <li key={m.id} className="flex items-center gap-3 px-4 py-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
            {iconFor(m.type)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
              {m.productName}{' '}
              <span className="font-mono text-[11px] font-normal text-slate-400">
                {m.productSku}
              </span>
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {labelFor(m)}
              {m.note && <span className="ml-1 italic">· {m.note}</span>}
            </p>
          </div>
          <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400" title={formatDateTime(m.timestamp)}>
            {relativeTime(m.timestamp)}
          </span>
        </li>
      ))}
    </ul>
  );
}
