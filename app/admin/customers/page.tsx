'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Users, X, ShoppingBag } from 'lucide-react';
import { getAllUsers, getOrders } from '@/lib/firestore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { User, Order } from '@/types';

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    getAllUsers().then((data) => { setUsers(data); setLoading(false); });
  }, []);

  const handleViewUser = async (user: User) => {
    setSelected(user);
    setLoadingOrders(true);
    try {
      const orders = await getOrders({ userId: user.id });
      setUserOrders(orders);
    } finally { setLoadingOrders(false); }
  };

  const filtered = users.filter((u) =>
    !search || u.displayName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpend = userOrders
    .filter((o) => ['paid','delivered'].includes(o.status))
    .reduce((s, o) => s + (o.totalPayment || o.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Pelanggan</h1>
        <p className="text-white/40 text-sm mt-0.5">{users.length} pengguna terdaftar</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama / email..." className="input-dark w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Pengguna','Email','No. HP','Role','Total Pesanan','Bergabung',''].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-white/30 text-xs font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 shimmer rounded w-24" /></td>)}
                </tr>
              )) : filtered.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-electric-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user.displayName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="text-white/80 font-medium whitespace-nowrap">{user.displayName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-white/50 text-xs">{user.email}</td>
                  <td className="px-5 py-4 text-white/40 text-xs">{user.phone || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${user.role === 'admin' ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/60 text-sm">{user.totalOrders || 0}</td>
                  <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">{user.createdAt ? formatDate(user.createdAt as Date) : '—'}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleViewUser(user)} className="p-2 rounded-lg glass text-white/40 hover:text-electric-400 hover:bg-electric-600/10 transition-all">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 text-white/20">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              Tidak ada pelanggan ditemukan
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="glass rounded-2xl border border-white/5 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 glass z-10">
                <h2 className="text-white font-semibold">Detail Pelanggan</h2>
                <button onClick={() => setSelected(null)} className="p-2 rounded-xl glass text-white/40 hover:text-white"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-electric-gradient flex items-center justify-center text-white text-2xl font-bold">
                    {selected.displayName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{selected.displayName}</p>
                    <p className="text-white/40 text-sm">{selected.email}</p>
                    {selected.phone && <p className="text-white/30 text-xs mt-0.5">{selected.phone}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass rounded-xl p-4 text-center border border-white/5">
                    <p className="text-white/30 text-xs mb-1">Total Pesanan</p>
                    <p className="text-electric-400 font-bold text-2xl">{selected.totalOrders || 0}</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center border border-white/5">
                    <p className="text-white/30 text-xs mb-1">Total Pengeluaran</p>
                    <p className="text-gold-400 font-bold text-sm font-mono">{formatCurrency(totalSpend)}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-white/60 text-sm font-medium mb-3 flex items-center gap-2">
                    <ShoppingBag size={14} /> Riwayat Pesanan
                  </h3>
                  {loadingOrders ? (
                    <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 shimmer rounded-xl" />)}</div>
                  ) : userOrders.length === 0 ? (
                    <p className="text-white/20 text-sm text-center py-6">Belum ada pesanan</p>
                  ) : (
                    <div className="space-y-2">
                      {userOrders.map((order) => (
                        <div key={order.orderId} className="glass rounded-xl p-3.5 border border-white/5 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-white/70 text-sm truncate">{order.productName}</p>
                            <p className="text-white/30 text-xs font-mono mt-0.5">{order.orderId.slice(0,20)}…</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-gold-400 font-mono text-sm font-semibold">{formatCurrency(order.totalPayment || order.amount)}</p>
                            <p className="text-white/30 text-xs mt-0.5">{order.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
