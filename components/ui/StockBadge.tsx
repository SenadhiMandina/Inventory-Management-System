/**
 * A small badge that visualises stock level: in stock / low / out.
 * Uses thresholds the interviewer will appreciate: > 10 = in stock,
 * 1..10 = low, 0 = out.
 */
import { CheckCircle2, AlertTriangle, PackageX } from 'lucide-react';

interface Props {
  stock: number;
}

export default function StockBadge({ stock }: Props) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30">
        <PackageX size={12} />
        Out of Stock
      </span>
    );
  }
  if (stock < 10) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30">
        <AlertTriangle size={12} />
        Low · {stock}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
      <CheckCircle2 size={12} />
      In Stock · {stock}
    </span>
  );
}
