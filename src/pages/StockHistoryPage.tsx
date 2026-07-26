/**
 * Stock history page. Lists every recorded movement with filters.
 */
import { useMemo, useState } from 'react';
import { Download, History } from 'lucide-react';

import { useInventory } from '../context/InventoryContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/ui/EmptyState';
import MovementList from '../components/dashboard/MovementList';
import Button from '../components/ui/Button';
import { toCsv, downloadCsv } from '../lib/csv';

type MovementTypeFilter = 'all' | 'restock' | 'sale' | 'create' | 'update' | 'delete';

export default function StockHistoryPage() {
  const { movements } = useInventory();
  const toast = useToast();
  const [type, setType] = useState<MovementTypeFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return movements.filter((m) => {
      if (type !== 'all' && m.type !== type) return false;
      if (q && !m.productName.toLowerCase().includes(q) && !m.productSku.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [movements, type, search]);

  const exportCsv = () => {
    const csv = toCsv(filtered, [
      { key: 'timestamp', header: 'Timestamp' },
      { key: 'productSku', header: 'SKU' },
      { key: 'productName', header: 'Product' },
      { key: 'type', header: 'Type' },
      { key: 'quantityChange', header: 'Quantity change' },
      { key: 'previousStock', header: 'Stock before' },
      { key: 'newStock', header: 'Stock after' },
      { key: 'note', header: 'Note' },
    ]);
    downloadCsv(`stock-history-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    toast.success(`Exported ${filtered.length} records`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Stock history
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Every change to stock is logged with a timestamp.
          </p>
        </div>
        <Button variant="secondary" iconLeft={<Download size={16} />} onClick={exportCsv}>
          Export history
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU…"
          className="min-w-[220px] flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {(['all', 'restock', 'sale', 'create', 'delete'] as MovementTypeFilter[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium capitalize transition ${
                type === t
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<History size={20} />}
          title="No movements yet"
          description="Restock or sell a product and you'll see the entry here."
        />
      ) : (
        <MovementList movements={filtered} limit={filtered.length} />
      )}
    </div>
  );
}
