/**
 * A horizontal bar chart of "inventory value per category".
 * Useful at a glance to spot which categories carry the most capital.
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { Product, Category } from '../../types';

interface Props {
  products: Product[];
  categories: Category[];
}

export default function StockValueChart({ products, categories }: Props) {
  if (products.length === 0) {
    return (
      <div className="grid h-64 place-items-center text-sm text-slate-500 dark:text-slate-400">
        No data yet.
      </div>
    );
  }
  const data = categories
    .map((c) => ({
      name: c.name.length > 14 ? c.name.slice(0, 13) + '…' : c.name,
      value: products
        .filter((p) => p.category === c.name)
        .reduce((sum, p) => sum + p.price * p.stock, 0),
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.2)" />
          <XAxis dataKey="name" stroke="rgba(148,163,184,.8)" fontSize={11} />
          <YAxis stroke="rgba(148,163,184,.8)" fontSize={11} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,.15)',
              fontSize: 12,
            }}
            formatter={(v) => `$${Number(v).toFixed(2)}`}
          />
          <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
