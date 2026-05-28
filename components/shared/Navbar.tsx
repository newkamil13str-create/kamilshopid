'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/store';
import { logout } from '@/lib/auth';
import toast from 'react-hot-toast';

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/products', label: 'Produk' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Berhasil keluar');
    setUserMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/5 shadow-glass' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-600 to-gold-500 flex items-center justify-center text-white font-display font-bold text-lg shadow-glow-blue group-hover:shadow-glow-gold transition-all">
              K
            </div>
            <span className="font-display font-bold text-xl text-white hidden sm:block">
              KAMIL<span className="text-gold-500">-SHOP</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? 'text-electric-400 bg-electric-600/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              href="/checkout"
              className="relative p-2.5 rounded-xl glass hover:bg-white/10 transition-all group"
            >
              <ShoppingCart size={20} className="text-white/70 group-hover:text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-500 text-navy-300 text-xs font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/10 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-electric-gradient flex items-center justify-center text-white text-xs font-bold">
                    {user.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-white/80 hidden sm:block max-w-24 truncate">
                    {user.displayName}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-52 glass rounded-2xl overflow-hidden shadow-glass border border-white/10"
                    >
                      <div className="p-3 border-b border-white/5">
                        <p className="text-white text-sm font-medium truncate">{user.displayName}</p>
                        <p className="text-white/40 text-xs truncate">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <LayoutDashboard size={16} />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/order"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Package size={16} />
                        Pesanan Saya
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-400/5 transition-all"
                      >
                        <LogOut size={16} />
                        Keluar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-xl bg-electric-gradient text-white text-sm font-medium shadow-glow-blue hover:shadow-glow-gold transition-all hover:scale-105"
              >
                Masuk
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl glass hover:bg-white/10 transition-all"
            >
              {mobileOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 py-3 space-y-1"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === link.href
                      ? 'text-electric-400 bg-electric-600/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
