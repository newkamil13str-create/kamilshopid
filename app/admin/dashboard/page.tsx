'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingBag, Clock, Package, Users, ArrowUpRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { getOrders, getProducts, getAllUsers, getRevenueByDays, subscribeToOrders } from '@/lib/firestore';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Order } from '@/types';
import Link from 'next/link';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

interface AnimatedStatProps {
  value: number;
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
}

function AnimatedStat({ value, isCurrency }: AnimatedStatProps) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const steps = 40;
    const inc = value / steps;
    let cur = 0;
    const id = setInterval(() => {
      cur = Math.min(cur + inc, value);
      setDisplay(Math.floor(cur));
      if (cur >= value) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [value]);
  return (
    <span>{isCurrency ? formatCurrency(display) : display.toLocaleString('id-ID')}</span>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0, totalOrders: 0, pendingOrders: 0,
    totalProducts: 0, totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [chartData, setChartData] = useState<{ date: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [products, users, revenue] = await Promise.all([
        getProducts({}),
        getAllUsers(),
        getRevenueByDays(7),
      ]);
      setStats((s) => ({
        ...s,
        totalProducts: products.length,
        totalCustomers: users.length,
      }));
      setChartData(revenue);
      setLoading(false);
    }
    load();

    // Realtime orders
    const unsub = subscribeToOrders((orders) => {
      setRecentOrders(orders.slice(0, 10));
      const paid = orders.filter((o) => ['paid', 'delivered'].includes(o.status));
      const pending = orders.filter((o) => o.status === 'pending');
      const revenue = paid.reduce((s, o) => s + (o.totalPayment || o.amount), 0);
      setStats((prev) => ({
        ...prev,
        totalRevenue: revenue,
        totalOrders: orders.length,
        pendingOrders: pending.length,
      }));
    }, { limitCount: 100 });

    return () => unsub();
  }, []);

  const statCards = [
    {
      label: 'Total Pendapatan',
      value: stats.totalRevenue,
      isCurrency: true,
      icon: TrendingUp,
      color: 'text-gold-400',
      bg: 'bg-gold-500/10',
      border: 'border-gold-500/20',
    },
    {
      label: 'Total Pesanan',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-electric-400',
      bg: 'bg-electric-600/10',
      border: 'border-electric-600/20',
    },
    {
      label: 'Menunggu Bayar',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/20',
    },
    {
      label: 'Total Produk',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/20',
    },
    {
      label: 'Total Pelanggan',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      border: 'border-green-400/20',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Selamat datang kembali di panel admin</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, isCurrency, icon: Icon, color, bg, border }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`glass rounded-2xl p-5 border ${border}`}
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-white/40 text-xs mb-1">{label}</p>
            <p className={`font-bold text-xl ${color} font-mono`}>
              {loading ? (
                <span className="block h-6 w-20 shimmer rounded" />
              ) : (
                <AnimatedStat value={value} isCurrency={isCurrency} />
              )}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass rounded-2xl p-6 border border-white/5"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold">Pendapatan 7 Hari Terakhir</h2>
            <p className="text-white/30 text-xs mt-0.5">Update real-time dari Firestore</p>
          </div>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-1 text-electric-400 text-xs hover:underline"
          >
            Lihat Semua <ArrowUpRight size={12} />
          </Link>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#141929', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 12, color: 'white' }}
                formatter={(v: number) => [formatCurrency(v), 'Pendapatan']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-56 flex items-center justify-center text-white/20 text-sm">
            Belum ada data pendapatan
          </div>
        )}
      </motion.div>

      {/* Recent orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-white font-semibold">Pesanan Terbaru</h2>
          <Link href="/admin/orders" className="text-electric-400 text-xs hover:underline flex items-center gap-1">
            Lihat Semua <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Order ID', 'Pelanggan', 'Produk', 'Total', 'Metode', 'Status', 'Waktu'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-white/30 text-xs font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-4 shimmer rounded w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                : recentOrders.map((order) => (
                    <tr key={order.orderId} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-white/60 text-xs whitespace-nowrap">
                        {order.orderId.slice(0, 20)}…
                      </td>
                      <td className="px-5 py-3.5 text-white/80 whitespace-nowrap">{order.customerName}</td>
                      <td className="px-5 py-3.5 text-white/60 max-w-40 truncate">{order.productName}</td>
                      <td className="px-5 py-3.5 text-gold-400 font-mono whitespace-nowrap">
                        {formatCurrency(order.totalPayment || order.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-white/50 uppercase text-xs">{order.paymentMethod}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-white/30 text-xs whitespace-nowrap">
                        {order.createdAt ? formatDate(order.createdAt as Date) : '—'}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!loading && recentOrders.length === 0 && (
            <div className="text-center py-12 text-white/20">Belum ada pesanan</div>
          )}
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Tambah Produk', href: '/admin/products', icon: Package, color: 'text-electric-400' },
          { label: 'Kelola Pesanan', href: '/admin/orders', icon: ShoppingBag, color: 'text-gold-400' },
          { label: 'Lihat Pelanggan', href: '/admin/customers', icon: Users, color: 'text-green-400' },
          { label: 'Analitik', href: '/admin/analytics', icon: TrendingUp, color: 'text-purple-400' },
        ].map(({ label, href, icon: Icon, color }) => (
          <Link
            key={label}
            href={href}
            className="glass rounded-2xl p-4 border border-white/5 hover:border-electric-600/20 transition-all group flex items-center gap-3"
          >
            <Icon size={18} className={`${color} group-hover:scale-110 transition-transform`} />
            <span className="text-white/60 text-sm group-hover:text-white transition-colors">{label}</span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
