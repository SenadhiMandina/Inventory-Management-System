/**
 * Domain types for our Inventory Management System.
 * Kept in a single file so newcomers can see the whole data model in one place.
 */

export interface Product {
  id: string;              // Unique identifier (generated via uuid)
  sku: string;             // Human-readable Stock Keeping Unit, e.g. "PRD-482910"
  name: string;
  category: string;        // Category name (matches one of the entries in Category[])
  price: number;           // Stored as a number; UI formats it as currency
  stock: number;           // Current quantity; never allowed to go below 0
  createdAt: string;       // ISO timestamp, useful for sorting & display
  updatedAt: string;       // ISO timestamp, updated whenever the product changes
}

export interface Category {
  id: string;
  name: string;
  color: string;           // Tailwind-friendly color key (e.g. "indigo") for chips
  createdAt: string;
}

/**
 * A single stock movement. We keep an append-only log so we can show
 * an audit trail without having to mutate the Product itself.
 */
export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: 'restock' | 'sale' | 'create' | 'update' | 'delete';
  quantityChange: number;  // positive = added, negative = removed
  previousStock: number;
  newStock: number;
  note?: string;
  timestamp: string;
}

export type StockFilter = 'all' | 'in-stock' | 'out-of-stock' | 'low-stock';
export type ViewMode = 'table' | 'cards';
export type Theme = 'light' | 'dark';
