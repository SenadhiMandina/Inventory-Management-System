/**
 * Products page - the busiest screen.
 *
 *  - search + filters row
 *  - bulk-action toolbar (appears when the user has ticked rows)
 *  - the table/card view
 *  - modals: add / edit / restock / sell / delete confirm
 */
import { useMemo, useState } from 'react';

import {
  Plus,
  Search,
  Filter,
  Download,
  LayoutList,
  LayoutGrid,
  Trash2,
  PackagePlus,
  X,
} from 'lucide-react';

import type { Product, StockFilter, ViewMode } from '../types';
import { useInventory } from '../context/InventoryContext';
import { useToast } from '../context/ToastContext';
import ProductForm from '../components/products/ProductForm';
import ProductTable from '../components/products/ProductTable';
import StockForm from '../components/products/StockForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { toCsv, downloadCsv } from '../lib/csv';

export default function ProductsPage() {
  const { products, categories, deleteProduct, deleteProducts, bulkRestock } =
    useInventory();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [view, setView] = useState<ViewMode>('table');
  const [selected, setSelected] = useState<string[]>([]);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [stockTarget, setStockTarget] = useState<{
    product: Product;
    direction: 'restock' | 'sell';
  } | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [bulkRestockOpen, setBulkRestockOpen] = useState(false);

  /**
   * Filtering pipeline.
   *
   * We split the filtering into small, named functions so it's easy to
   * explain in an interview: each step removes rows that don't match.
   */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) {
        return false;
      }
      if (category && p.category !== category) return false;
      switch (stockFilter) {
        case 'in-stock':
          return p.stock > 0;
        case 'out-of-stock':
          return p.stock === 0;
        case 'low-stock':
          return p.stock > 0 && p.stock < 10;
        default:
          return true;
      }
    });
  }, [products, search, category, stockFilter]);

  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleSelectAll = () =>
    setSelected((prev) =>
      prev.length === filtered.length ? [] : filtered.map((p) => p.id)
    );

  const clearSelection = () => setSelected([]);

  const exportCsv = () => {
    const csv = toCsv(filtered, [
      { key: 'sku', header: 'SKU' },
      { key: 'name', header: 'Name' },
      { key: 'category', header: 'Category' },
      { key: 'price', header: 'Price (USD)' },
      { key: 'stock', header: 'Stock' },
      { key: 'updatedAt', header: 'Updated At' },
    ]);
    downloadCsv(`inventory-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    toast.success(`Exported ${filtered.length} products`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Products
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {products.length} total · {filtered.length} shown
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={exportCsv}
            iconLeft={<Download size={16} />}
          >
            Export CSV
          </Button>
          <Button variant="primary" iconLeft={<Plus size={16} />} onClick={() => setShowAdd(true)}>
            Add product
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU…"
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Filter size={14} className="text-slate-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {(['all', 'in-stock', 'low-stock', 'out-of-stock'] as StockFilter[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setStockFilter(opt)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                stockFilter === opt
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {opt === 'all'
                ? 'All'
                : opt === 'in-stock'
                ? 'In stock'
                : opt === 'low-stock'
                ? 'Low'
                : 'Out'}
            </button>
          ))}
        </div>

        <div className="ml-auto hidden items-center gap-1 rounded-lg bg-slate-100 p-1 md:flex dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setView('table')}
            className={`grid h-8 w-8 place-items-center rounded-md transition ${
              view === 'table'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            aria-label="Table view"
          >
            <LayoutList size={16} />
          </button>
          <button
            type="button"
            onClick={() => setView('cards')}
            className={`grid h-8 w-8 place-items-center rounded-md transition ${
              view === 'cards'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            aria-label="Card view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Bulk action toolbar */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-500/30">
          <span className="font-medium">{selected.length} selected</span>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="success"
              iconLeft={<PackagePlus size={14} />}
              onClick={() => setBulkRestockOpen(true)}
            >
              Bulk restock
            </Button>
            <Button
              size="sm"
              variant="danger"
              iconLeft={<Trash2 size={14} />}
              onClick={() => {
                deleteProducts(selected);
                toast.success(`Deleted ${selected.length} products`);
                clearSelection();
              }}
            >
              Delete
            </Button>
            <Button
              size="sm"
              variant="ghost"
              iconLeft={<X size={14} />}
              onClick={clearSelection}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your filters, or add a new product to get started."
          action={
            <Button iconLeft={<Plus size={16} />} onClick={() => setShowAdd(true)}>
              Add product
            </Button>
          }
        />
      ) : view === 'table' ? (
        <ProductTable
          products={filtered}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEdit={(p) => setEditing(p)}
          onDelete={(p) => setDeleting(p)}
          onStock={(p, dir) => setStockTarget({ product: p, direction: dir })}
        />
      ) : (
        // We reuse the table view (cards mode is used as the mobile fallback).
        <ProductTable
          products={filtered}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEdit={(p) => setEditing(p)}
          onDelete={(p) => setDeleting(p)}
          onStock={(p, dir) => setStockTarget({ product: p, direction: dir })}
        />
      )}

      {/* Modals */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add a new product"
        description="Create a product to start tracking its stock."
      >
        <ProductForm onSubmit={() => setShowAdd(false)} onCancel={() => setShowAdd(false)} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit product"
        description="Changes are saved instantly."
      >
        <ProductForm
          product={editing ?? undefined}
          onSubmit={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      </Modal>

      <Modal
        open={!!stockTarget}
        onClose={() => setStockTarget(null)}
        title={stockTarget?.direction === 'restock' ? 'Restock' : 'Record sale'}
        size="sm"
      >
        {stockTarget && (
          <StockForm
            productId={stockTarget.product.id}
            productName={stockTarget.product.name}
            productSku={stockTarget.product.sku}
            currentStock={stockTarget.product.stock}
            direction={stockTarget.direction}
            onDone={() => setStockTarget(null)}
          />
        )}
      </Modal>

      <Modal
        open={bulkRestockOpen}
        onClose={() => setBulkRestockOpen(false)}
        title="Bulk restock"
        description="Add stock to every selected product at once."
        size="sm"
      >
        <BulkRestockForm
          productIds={selected}
          onDone={(amount) => {
            bulkRestock(selected, amount, 'Bulk restock');
            toast.success(`Restocked ${selected.length} products by +${amount}`);
            setBulkRestockOpen(false);
            clearSelection();
          }}
          onCancel={() => setBulkRestockOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete product?"
        message={`This will permanently remove "${deleting?.name}" from your inventory. This action cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={() => {
          if (deleting) {
            deleteProduct(deleting.id);
            toast.success(`Deleted ${deleting.name}`);
            setDeleting(null);
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

/**
 * Inline mini-form for the bulk-restock modal. We keep it in the same
 * file because it's only ever used here.
 */
import { Formik, Form } from 'formik';
import { NumberField } from '../components/ui/Field';
import * as Yup from 'yup';

const bulkSchema = Yup.object({
  amount: Yup.number().typeError('Amount must be a number').positive().integer().required(),
});

function BulkRestockForm({
  productIds,
  onDone,
  onCancel,
}: {
  productIds: string[];
  onDone: (amount: number) => void;
  onCancel: () => void;
}) {
  return (
    <Formik
      initialValues={{ amount: 5 }}
      validationSchema={bulkSchema}
      onSubmit={(values, { setSubmitting }) => {
        onDone(values.amount);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            Applying to <strong>{productIds.length}</strong> selected product
            {productIds.length === 1 ? '' : 's'}.
          </p>
          <NumberField
            label="Units to add"
            name="amount"
            min="1"
            step="1"
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="success" loading={isSubmitting} iconLeft={<PackagePlus size={16} />}>
              Apply restock
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
