/**
 * Bottom-of-screen navigation shown only on small viewports.
 * Mirrors the Sidebar so users get the same options everywhere.
 */
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Boxes, FolderKanban, History } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Boxes },
  { to: '/categories', label: 'Categories', icon: FolderKanban },
  { to: '/history', label: 'History', icon: History },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-900/95">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`
          }
        >
          <link.icon size={20} />
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
