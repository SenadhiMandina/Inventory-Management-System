/**
 * Global state for the entire app.
 *
 * Why a single context instead of several?
 *  - For an interview-level project, one context that owns
 *    [products, categories, movements] is easy to reason about and easy to
 *    explain ("there is one source of truth, in localStorage").
 *  - For a real production app we'd reach for Redux Toolkit / Zustand,
 *    but explaining that trade-off is the *right* answer to
 *    "why didn't you use Redux?".
 *
 * All mutators are exposed as functions so components don't write to
 * localStorage directly. That keeps the persistence layer centralised.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { v4 as uuid } from 'uuid';

import type { Category, Product, StockMovement } from '../types';
import { storage } from '../lib/storage';
import { generateUniqueSku } from '../lib/sku';
import { CATEGORY_COLORS } from '../lib/utils';

const KEY_PRODUCTS = 'products';
const KEY_CATEGORIES = 'categories';
const KEY_MOVEMENTS = 'movements';

/**
 * Seed data so the app feels alive on first load. A senior dev trick:
 * instead of leaving the user staring at an empty screen, give them a few
 * rows to interact with. The seed data lives in code, never in storage, so
 * it will re-appear if the user clears their browser data.
 */
const seedProducts: Product[] = [
  {
    id: uuid(),
    sku: 'PRD-100001',
    name: 'Wireless Mouse',
    category: 'Electronics',
    price: 19.99,
    stock: 42,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: uuid(),
    sku: 'PRD-100002',
    name: 'Mechanical Keyboard',
    category: 'Electronics',
    price: 89.5,
    stock: 18,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: uuid(),
    sku: 'PRD-100003',
    name: 'Cotton T-Shirt',
    category: 'Apparel',
    price: 12.0,
    stock: 120,
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: uuid(),
    sku: 'PRD-100004',
    name: 'Ceramic Mug',
    category: 'Home & Kitchen',
    price: 7.5,
    stock: 0,
    createdAt: new Date('2024-02-05').toISOString(),
    updatedAt: new Date('2024-02-05').toISOString(),
  },
  {
    id: uuid(),
    sku: 'PRD-100005',
    name: 'Notebook A5',
    category: 'Stationery',
    price: 4.25,
    stock: 230,
    createdAt: new Date('2024-02-12').toISOString(),
    updatedAt: new Date('2024-02-12').toISOString(),
  },
];

const seedCategories: Category[] = [
  {
    id: uuid(),
    name: 'Electronics',
    color: 'indigo',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: uuid(),
    name: 'Apparel',
    color: 'emerald',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: uuid(),
    name: 'Home & Kitchen',
    color: 'amber',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: uuid(),
    name: 'Stationery',
    color: 'rose',
    createdAt: new Date('2024-01-01').toISOString(),
  },
];

interface InventoryContextValue {
  products: Product[];
  categories: Category[];
  movements: StockMovement[];

  // Product ops
  addProduct: (input: Omit<Product, 'id' | 'sku' | 'createdAt' | 'updatedAt'> & {
    sku?: string;
  }) => Product;
  updateProduct: (id: string, patch: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
  deleteProduct: (id: string) => void;
  deleteProducts: (ids: string[]) => void;

  // Stock ops
  restock: (id: string, amount: number, note?: string) => void;
  sell: (id: string, amount: number, note?: string) => void;

  // Category ops
  addCategory: (name: string, color: string) => Category | null;
  updateCategory: (id: string, patch: Partial<Omit<Category, 'id' | 'createdAt'>>) => void;
  deleteCategory: (id: string, reassignTo?: string) => void;

  // Bulk
  bulkRestock: (ids: string[], amount: number, note?: string) => void;
}

const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  // Lazy initial state - the function only runs once on mount, so we keep
  // the components that don't need data from re-reading localStorage.
  const [products, setProducts] = useState<Product[]>(() =>
    storage.get<Product[]>(KEY_PRODUCTS, seedProducts)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    storage.get<Category[]>(KEY_CATEGORIES, seedCategories)
  );
  const [movements, setMovements] = useState<StockMovement[]>(() =>
    storage.get<StockMovement[]>(KEY_MOVEMENTS, [])
  );

  // Persist whenever data changes. Keeping these as three separate
  // useEffects (rather than one big one) keeps each side-effect's
  // dependencies explicit.
  useEffect(() => storage.set(KEY_PRODUCTS, products), [products]);
  useEffect(() => storage.set(KEY_CATEGORIES, categories), [categories]);
  useEffect(() => storage.set(KEY_MOVEMENTS, movements), [movements]);

  /**
   * Internal helper: every time stock changes, we append a movement.
   * We don't store movements inside the Product itself so deletions don't
   * orphan their history.
   */
  const recordMovement = useCallback(
    (
      product: Product,
      type: StockMovement['type'],
      quantityChange: number,
      previousStock: number,
      note?: string
    ) => {
      const movement: StockMovement = {
        id: uuid(),
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        type,
        quantityChange,
        previousStock,
        newStock: product.stock,
        note,
        timestamp: new Date().toISOString(),
      };
      setMovements((prev) => [movement, ...prev].slice(0, 500));
    },
    []
  );

  // --------------------------- Products -----------------------------

  const addProduct: InventoryContextValue['addProduct'] = useCallback(
    (input) => {
      const sku = input.sku?.trim()
        ? input.sku.trim().toUpperCase()
        : generateUniqueSku(products.map((p) => p.sku));
      const now = new Date().toISOString();
      const newProduct: Product = {
        id: uuid(),
        sku,
        name: input.name.trim(),
        category: input.category,
        price: input.price,
        stock: input.stock,
        createdAt: now,
        updatedAt: now,
      };
      setProducts((prev) => [newProduct, ...prev]);
      recordMovement(newProduct, 'create', newProduct.stock, 0, 'Product created');
      return newProduct;
    },
    [products, recordMovement]
  );

  const updateProduct: InventoryContextValue['updateProduct'] = useCallback(
    (id, patch) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...patch, updatedAt: new Date().toISOString() }
            : p
        )
      );
    },
    []
  );

  const deleteProduct: InventoryContextValue['deleteProduct'] = useCallback((id) => {
    setProducts((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) {
        const movement: StockMovement = {
          id: uuid(),
          productId: target.id,
          productName: target.name,
          productSku: target.sku,
          type: 'delete',
          quantityChange: -target.stock,
          previousStock: target.stock,
          newStock: 0,
          timestamp: new Date().toISOString(),
          note: 'Product deleted',
        };
        setMovements((m) => [movement, ...m].slice(0, 500));
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const deleteProducts: InventoryContextValue['deleteProducts'] = useCallback(
    (ids) => {
      const set = new Set(ids);
      setProducts((prev) => {
        const removed = prev.filter((p) => set.has(p.id));
        if (removed.length) {
          const ts = new Date().toISOString();
          const newMovements: StockMovement[] = removed.map((p) => ({
            id: uuid(),
            productId: p.id,
            productName: p.name,
            productSku: p.sku,
            type: 'delete',
            quantityChange: -p.stock,
            previousStock: p.stock,
            newStock: 0,
            timestamp: ts,
            note: 'Product deleted (bulk)',
          }));
          setMovements((m) => [...newMovements, ...m].slice(0, 500));
        }
        return prev.filter((p) => !set.has(p.id));
      });
    },
    []
  );

  // --------------------------- Stock --------------------------------

  const restock: InventoryContextValue['restock'] = useCallback(
    (id, amount, note) => {
      let target: Product | undefined;
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          target = { ...p, stock: p.stock + amount, updatedAt: new Date().toISOString() };
          return target;
        })
      );
      // We run the recording after React commits (microtask), because
      // `target` is set during the updater above.
      queueMicrotask(() => {
        if (target) recordMovement(target, 'restock', amount, target.stock - amount, note);
      });
    },
    [recordMovement]
  );

  const sell: InventoryContextValue['sell'] = useCallback(
    (id, amount, note) => {
      let target: Product | undefined;
      let blocked = false;
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          if (p.stock < amount) {
            blocked = true;
            return p;
          }
          target = { ...p, stock: p.stock - amount, updatedAt: new Date().toISOString() };
          return target;
        })
      );
      queueMicrotask(() => {
        if (blocked) return; // ignore - caller validates first
        if (target) recordMovement(target, 'sale', -amount, target.stock + amount, note);
      });
    },
    [recordMovement]
  );

  const bulkRestock: InventoryContextValue['bulkRestock'] = useCallback(
    (ids, amount, note) => {
      ids.forEach((id) => restock(id, amount, note));
    },
    [restock]
  );

  // --------------------------- Categories ---------------------------

  const addCategory: InventoryContextValue['addCategory'] = useCallback(
    (name, color) => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      // Reject duplicates (case-insensitive) - good UX + clearer error in UI.
      if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
        return null;
      }
      const newCategory: Category = {
        id: uuid(),
        name: trimmed,
        color: color || CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
        createdAt: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    },
    [categories]
  );

  const updateCategory: InventoryContextValue['updateCategory'] = useCallback(
    (id, patch) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
      );
    },
    []
  );

  /**
   * Deleting a category must NOT orphan products.
   * Pass `reassignTo` to point them at another category, otherwise we
   * fall back to a "Uncategorised" bucket so data is never lost.
   */
  const deleteCategory: InventoryContextValue['deleteCategory'] = useCallback(
    (id, reassignTo = 'Uncategorised') => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setProducts((prev) =>
        prev.map((p) =>
          p.category === categories.find((c) => c.id === id)?.name
            ? { ...p, category: reassignTo, updatedAt: new Date().toISOString() }
            : p
        )
      );
      // Ensure the fallback category exists so the UI label is stable.
      setCategories((prev) =>
        prev.some((c) => c.name === reassignTo)
          ? prev
          : [
              ...prev,
              {
                id: uuid(),
                name: reassignTo,
                color: 'slate',
                createdAt: new Date().toISOString(),
              },
            ]
      );
    },
    [categories]
  );

  const value = useMemo<InventoryContextValue>(
    () => ({
      products,
      categories,
      movements,
      addProduct,
      updateProduct,
      deleteProduct,
      deleteProducts,
      restock,
      sell,
      addCategory,
      updateCategory,
      deleteCategory,
      bulkRestock,
    }),
    [
      products,
      categories,
      movements,
      addProduct,
      updateProduct,
      deleteProduct,
      deleteProducts,
      restock,
      sell,
      addCategory,
      updateCategory,
      deleteCategory,
      bulkRestock,
    ]
  );

  return (
    <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error('useInventory must be used inside <InventoryProvider>');
  }
  return ctx;
}
