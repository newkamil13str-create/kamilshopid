'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users,
  BarChart2, Settings, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { logout } from '@/lib/auth';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/admin/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/products',   label: 'Produk',       icon: Package },
  { href: '/admin/categories', label: 'Kategori',     icon: Tag },
  { href: '/admin/orders',     label: 'Pesanan',      icon: ShoppingBag },
  { href: '/admin/customers',  label: 'Pelanggan',    icon: Users },
  { href: '/admin/analytics',  label: 'Analitik',     icon: BarChart2 },
  { href: '/admin/settings',   label: 'Pengaturan',   icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    toast.success('Berhasil keluar');
    router.push('/');
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-electric-600/30 border-t-electric-600 rounded-full animate-spin" />
      </div>
    );
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? 'p-4' : 'p-5'}`}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-600 to-gold-500 flex items-center justify-center text-white font-display font-bold text-lg shadow-glow-blue">
          K
        </div>
        <div>
          <span className="font-display font-bold text-base text-white">
            KAMIL<span className="text-gold-500">-SHOP</span>
          </span>
          <p className="text-white/30 text-xs -mt-0.5">Admin Panel</p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-electric-600/15 text-electric-400 border border-electric-600/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={17} className={active ? 'text-electric-400' : 'text-white/30 group-hover:text-white/60'} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto text-electric-400/60" />}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/5 pt-4 mt-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl glass mb-2">
          <div className="w-8 h-8 rounded-lg bg-electric-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.displayName?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.displayName}</p>
            <p className="text-white/30 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut size={17} />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen animated-gradient flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 glass border-r border-white/5 fixed top-0 left-0 h-full z-40">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 left-0 h-full w-72 glass border-r border-white/5 z-50 lg:hidden"
            >
              <div className="flex justify-end p-4">
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl glass text-white/60 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="glass border-b border-white/5 sticky top-0 z-30 px-5 h-14 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl glass text-white/60 hover:text-white"
          >
            <Menu size={18} />
          </button>
          <div className="hidden lg:block">
            <p className="text-white/40 text-sm">
              {navItems.find((n) => pathname.startsWith(n.href))?.label || 'Admin'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Sistem Aktif
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-5 lg:p-7 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
