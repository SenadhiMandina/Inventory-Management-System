/**
 * Dashboard page.
 *
 * Layout:
 *   row 1 : 4 stat cards
 *   row 2 : charts (categories donut + value bar)
 *   row 3 : low stock alert list + recent activity
 */
import { Boxes, CircleDollarSign, AlertTriangle, Layers } from 'lucide-react';
import { useMemo } from 'react';

import { useInventory } from '../context/InventoryContext';
import StatCard from '../components/dashboard/StatCard';
import CategoryChart from '../components/dashboard/CategoryChart';
import StockValueChart from '../components/dashboard/StockValueChart';
import MovementList from '../components/dashboard/MovementList';
import { formatCurrency } from '../lib/utils';
import StockBadge from '../components/ui/StockBadge';

export default function DashboardPage() {
  const { products, categories, movements } = useInventory();

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalUnits = products.reduce((s, p) => s + p.stock, 0);
    const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
    const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    return { totalProducts, totalUnits, totalValue, lowStock, outOfStock };
  }, [products]);

  const lowStockItems = products
    .filter((p) => p.stock < 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Welcome back 👋
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Here's how your inventory is doing today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total products"
          value={stats.totalProducts}
          hint={`Across ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`}
          icon={<Boxes size={18} />}
          accent="indigo"
        />
        <StatCard
          label="Total inventory value"
          value={formatCurrency(stats.totalValue)}
          hint={`${stats.totalUnits} units in stock`}
          icon={<CircleDollarSign size={18} />}
          accent="emerald"
        />
        <StatCard
          label="Low stock"
          value={stats.lowStock}
          hint="Products with < 10 units"
          icon={<AlertTriangle size={18} />}
          accent="amber"
        />
        <StatCard
          label="Out of stock"
          value={stats.outOfStock}
          hint="Need a restock soon"
          icon={<Layers size={18} />}
          accent="rose"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Inventory value by category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sum of (price × stock) per category.
            </p>
          </div>
          <StockValueChart products={products} categories={categories} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Products by category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quick breakdown of count and distribution.
            </p>
          </div>
          <CategoryChart products={products} categories={categories} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Needs attention
          </h3>
          {lowStockItems.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              All products are well stocked. 🎉
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
              {lowStockItems.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                      {p.name}
                    </p>
                    <p className="font-mono text-[11px] text-slate-400">{p.sku}</p>
                  </div>
                  <StockBadge stock={p.stock} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Recent activity
          </h3>
          <MovementList movements={movements} limit={6} />
        </div>
      </div>
    </div>
  );
}
