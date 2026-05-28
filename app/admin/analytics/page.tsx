'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getOrders, getProducts, getRevenueByDays } from '@/lib/firestore';
import { formatCurrency, downloadCSV } from '@/lib/utils';
import { Order, Product } from '@/types';
import { PAYMENT_METHODS } from '@/lib/pakasir';

const COLORS = ['#2563EB','#F59E0B','#10B981','#8B5CF6','#EF4444','#F97316','#EC4899','#6366F1'];
type Period = '7' | '30' | '90';

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('7');
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [rev, ords, prods] = await Promise.all([
        getRevenueByDays(Number(period)), getOrders({}), getProducts({}),
      ]);
      setRevenueData(rev); setOrders(ords); setProducts(prods); setLoading(false);
    }
    load();
  }, [period]);

  const bestSelling = [...products].sort((a,b) => b.totalSold - a.totalSold).slice(0,5)
    .map((p) => ({ name: p.name.length > 22 ? p.name.slice(0,22)+'…' : p.name, sold: p.totalSold }));

  const paymentBreakdown = PAYMENT_METHODS.map((m) => ({
    name: m.label,
    value: orders.filter((o) => o.paymentMethod === m.id && ['paid','delivered'].includes(o.status)).length,
  })).filter((p) => p.value > 0);

  const paidOrders = orders.filter((o) => ['paid','delivered'].includes(o.status));
  const totalRevenue = paidOrders.reduce((s,o) => s + (o.totalPayment || o.amount), 0);
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
  const conversionRate = orders.length > 0 ? ((paidOrders.length / orders.length) * 100).toFixed(1) : '0';

  const handleExport = () => {
    const data = orders.map((o) => ({
      orderId: o.orderId, customerName: o.customerName, customerEmail: o.customerEmail,
      productName: o.productName, amount: o.amount, totalPayment: o.totalPayment,
      paymentMethod: o.paymentMethod, status: o.status,
    }));
    downloadCSV(data as unknown as Record<string, unknown>[], `orders-${new Date().toISOString().slice(0,10)}`);
  };

  const tt = { contentStyle: { background: '#141929', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 12, color: 'white', fontSize: 12 } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Analitik</h1>
          <p className="text-white/40 text-sm mt-0.5">Performa penjualan & pendapatan</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/10 text-white/60 text-sm hover:text-white">
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="flex gap-2">
        {(['7','30','90'] as Period[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${period === p ? 'bg-electric-gradient text-white shadow-glow-sm' : 'glass text-white/40 hover:text-white/70'}`}>
            {p} Hari
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pendapatan', value: formatCurrency(totalRevenue), color: 'text-gold-400' },
          { label: 'Pesanan Berhasil', value: paidOrders.length.toString(), color: 'text-electric-400' },
          { label: 'Rata-rata Order', value: formatCurrency(avgOrderValue), color: 'text-green-400' },
          { label: 'Konversi', value: `${conversionRate}%`, color: 'text-purple-400' },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass rounded-2xl p-5 border border-white/5">
            <p className="text-white/40 text-xs mb-1">{label}</p>
            <p className={`font-bold text-xl font-mono ${color}`}>{loading ? '...' : value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6 border border-white/5">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <TrendingUp size={16} className="text-electric-400" /> Pendapatan {period} Hari Terakhir
        </h2>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip {...tt} formatter={(v: number) => [formatCurrency(v), 'Pendapatan']} />
              <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <div className="h-60 flex items-center justify-center text-white/20">Belum ada data</div>}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-6 border border-white/5">
          <h2 className="text-white font-semibold mb-5">Produk Terlaris</h2>
          {bestSelling.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bestSelling} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...tt} formatter={(v: number) => [v, 'Terjual']} />
                <Bar dataKey="sold" fill="#F59E0B" radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-52 flex items-center justify-center text-white/20">Belum ada data</div>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 border border-white/5">
          <h2 className="text-white font-semibold mb-5">Metode Pembayaran</h2>
          {paymentBreakdown.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={paymentBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {paymentBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tt} formatter={(v: number) => [v, 'Transaksi']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {paymentBreakdown.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-white/50 text-xs flex-1 truncate">{item.name}</span>
                    <span className="text-white/70 text-xs font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="h-52 flex items-center justify-center text-white/20">Belum ada data</div>}
        </motion.div>
      </div>
    </div>
  );
}
