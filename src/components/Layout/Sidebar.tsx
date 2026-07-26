/**
 * Sidebar navigation.
 * Uses NavLink so the active route is automatically highlighted.
 */
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Boxes, FolderKanban, History, Sparkles, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Boxes },
  { to: '/categories', label: 'Categories', icon: FolderKanban },
  { to: '/history', label: 'Stock History', icon: History },
];

export default function Sidebar() {
  const { theme, toggle } = useTheme();

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white/80 backdrop-blur md:flex md:flex-col dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md">
          <Sparkles size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-50">Stockpile</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Inventory Suite</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute inset-y-1 left-0 w-1 rounded-r bg-indigo-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <link.icon size={18} className="shrink-0" />
                <span>{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <button
          onClick={toggle}
          className="flex w-full items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
          <span className="relative inline-block h-5 w-9 rounded-full bg-slate-300 transition dark:bg-indigo-500">
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                theme === 'dark' ? 'translate-x-4' : ''
              }`}
            />
          </span>
        </button>
        <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
          v1.0 · Demo
        </p>
      </div>
    </aside>
  );
}
