/**
 * Page shell. Wraps every routed page in the persistent sidebar + header.
 */
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-10">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
