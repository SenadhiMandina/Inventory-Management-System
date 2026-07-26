import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/categories': 'Categories',
  '/history': 'Stock History',
};

export default function Header() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const title = titles[location.pathname] ?? 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/70 px-4 backdrop-blur md:px-8 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="md:hidden">
        <span className="text-base font-bold text-slate-900 dark:text-slate-50">
          Stockpile
        </span>
      </div>
      <h1 className="hidden text-lg font-semibold text-slate-900 md:block dark:text-slate-50">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggle}
          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
