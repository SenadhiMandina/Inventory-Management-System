/**
 * A donut chart of products per category.
 *
 * Why a custom component?
 *  - We use Recharts (a popular library already loaded) but we own the
 *    data preparation so the parent doesn't have to think about it.
 */
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Product, Category } from '../../types';

interface Props {
  products: Product[];
  categories: Category[];
}

export default function CategoryChart({ products, categories }: Props) {
  if (products.length === 0) {
    return (
      <div className="grid h-64 place-items-center text-sm text-slate-500 dark:text-slate-400">
        No data yet.
      </div>
    );
  }

  const data = categories
    .map((c) => ({
      name: c.name,
      color: c.color,
      value: products.filter((p) => p.category === c.name).length,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  // If products reference categories no longer in the list, include them too.
  const orphanNames = Array.from(
    new Set(products.map((p) => p.category).filter((n) => !categories.some((c) => c.name === n)))
  );
  orphanNames.forEach((n) => {
    data.push({ name: n, color: 'slate', value: products.filter((p) => p.category === n).length });
  });

  const COLORS: Record<string, string> = {
    indigo: '#6366f1',
    emerald: '#10b981',
    rose: '#f43f5e',
    amber: '#f59e0b',
    sky: '#0ea5e9',
    violet: '#8b5cf6',
    teal: '#14b8a6',
    fuchsia: '#d946ef',
    lime: '#84cc16',
    orange: '#f97316',
    slate: '#64748b',
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={COLORS[entry.color] ?? COLORS.slate} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 10px 30px rgba(0,0,0,.15)',
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2 self-center">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: COLORS[d.color] ?? COLORS.slate }}
              />
              <span className="text-slate-700 dark:text-slate-200">{d.name}</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-50">
              {d.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
