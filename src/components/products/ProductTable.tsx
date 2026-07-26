/**
 * Reusable product list, rendered either as a table (desktop) or cards
 * (mobile). The pagination is intentionally simple - slice the array.
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, PackagePlus, ShoppingCart, CheckSquare, Square, ArrowUpDown } from 'lucide-react';

import type { Product } from '../../types';
import { useInventory } from '../../context/InventoryContext';
import { formatCurrency, relativeTime, colorClasses } from '../../lib/utils';
import StockBadge from '../ui/StockBadge';
import Button from '../ui/Button';

interface Props {
  products: Product[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onStock: (product: Product, direction: 'restock' | 'sell') => void;
}

type SortKey = 'name' | 'sku' | 'category' | 'price' | 'stock' | 'updatedAt';

const PAGE_SIZE = 8;

/**
 * Sortable column header. Defined outside the component so React doesn't
 * recreate the function on every render and ESLint's
 * `react-hooks/static-components` rule is happy.
 */
function SortHeader({
  k,
  activeKey,
  direction,
  onSort,
  children,
}: {
  k: SortKey;
  activeKey: SortKey;
  direction: 'asc' | 'desc';
  onSort: (k: SortKey) => void;
  children: React.ReactNode;
}) {
  const isActive = k === activeKey;
  return (
    <button
      type="button"
      onClick={() => onSort(k)}
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
    >
      {children}
      <ArrowUpDown
        size={12}
        className={
          isActive
            ? direction === 'asc'
              ? 'text-indigo-500'
              : 'text-indigo-500 rotate-180'
            : 'opacity-40'
        }
      />
    </button>
  );
}

export default function ProductTable({
  products,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onStock,
}: Props) {
  const { categories } = useInventory();
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    const copy = [...products];
    copy.sort((a, b) => {
      const av = a[sortKey] as string | number;
      const bv = b[sortKey] as string | number;
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [products, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allSelected =
    products.length > 0 && selectedIds.length === products.length;

  const categoryColorFor = (name: string) => {
    const found = categories.find((c) => c.name === name);
    return found ? found.color : 'slate';
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/60">
            <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-4 py-3 w-10">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  className="grid place-items-center text-slate-400 hover:text-indigo-600"
                  aria-label={allSelected ? 'Unselect all' : 'Select all'}
                >
                  {allSelected ? (
                    <CheckSquare size={18} className="text-indigo-600" />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </th>
              <th className="px-4 py-3">
                <SortHeader k="name" activeKey={sortKey} direction={sortDir} onSort={handleSort}>Name</SortHeader>
              </th>
              <th className="px-4 py-3">
                <SortHeader k="sku" activeKey={sortKey} direction={sortDir} onSort={handleSort}>SKU</SortHeader>
              </th>
              <th className="px-4 py-3">
                <SortHeader k="category" activeKey={sortKey} direction={sortDir} onSort={handleSort}>Category</SortHeader>
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader k="price" activeKey={sortKey} direction={sortDir} onSort={handleSort}>Price</SortHeader>
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader k="stock" activeKey={sortKey} direction={sortDir} onSort={handleSort}>Stock</SortHeader>
              </th>
              <th className="px-4 py-3">
                <SortHeader k="updatedAt" activeKey={sortKey} direction={sortDir} onSort={handleSort}>Updated</SortHeader>
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((p) => {
              const checked = selectedIds.includes(p.id);
              return (
                <motion.tr
                  layout
                  key={p.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 align-middle">
                    <button
                      type="button"
                      onClick={() => onToggleSelect(p.id)}
                      className="grid place-items-center text-slate-400 hover:text-indigo-600"
                      aria-label={checked ? 'Unselect' : 'Select'}
                    >
                      {checked ? (
                        <CheckSquare size={18} className="text-indigo-600" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="font-medium text-slate-900 dark:text-slate-50">{p.name}</div>
                  </td>
                  <td className="px-4 py-3 align-middle font-mono text-xs text-slate-500 dark:text-slate-400">
                    {p.sku}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <CategoryDot color={categoryColorFor(p.category)} name={p.category} />
                  </td>
                  <td className="px-4 py-3 align-middle text-right font-medium text-slate-900 dark:text-slate-50">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <StockBadge stock={p.stock} />
                  </td>
                  <td className="px-4 py-3 align-middle text-xs text-slate-500 dark:text-slate-400">
                    {relativeTime(p.updatedAt)}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onStock(p, 'restock')}
                        className="grid h-8 w-8 place-items-center rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                        aria-label="Restock"
                        title="Restock"
                      >
                        <PackagePlus size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onStock(p, 'sell')}
                        className="grid h-8 w-8 place-items-center rounded-lg text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10"
                        aria-label="Sell"
                        title="Sell"
                      >
                        <ShoppingCart size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                  No products match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 p-3 md:hidden">
        {pageItems.map((p) => (
          <motion.div
            layout
            key={p.id}
            className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/60"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {p.name}
                </p>
                <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                  {p.sku}
                </p>
              </div>
              <StockBadge stock={p.stock} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <CategoryDot color={categoryColorFor(p.category)} name={p.category} />
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                {formatCurrency(p.price)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1">
              <Button size="sm" variant="secondary" onClick={() => onStock(p, 'restock')}>
                + Stock
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onStock(p, 'sell')}>
                Sell
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onEdit(p)}>
                Edit
              </Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(p)}>
                Delete
              </Button>
            </div>
          </motion.div>
        ))}
        {pageItems.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No products match your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span>
            Page {page} of {totalPages} · {products.length} item(s)
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryDot({ name, color }: { name: string; color: string }) {
  const palette = colorClasses(color);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${palette.bg} ${palette.text} ${palette.ring}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {name}
    </span>
  );
}
