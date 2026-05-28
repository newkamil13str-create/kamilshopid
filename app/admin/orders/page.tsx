'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, CheckCircle, Package, X, RefreshCw } from 'lucide-react';
import { subscribeToOrders, updateOrder } from '@/lib/firestore';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { PAYMENT_METHODS } from '@/lib/pakasir';
import { Order } from '@/types';
import toast from 'react-hot-toast';

const STATUS_TABS = ['all', 'pending', 'paid', 'delivered', 'failed'] as const;
type StatusTab = typeof STATUS_TABS[number];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<StatusTab>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsub = subscribeToOrders((data) => { setOrders(data); setLoading(false); }, { limitCount: 200 });
    return () => unsub();
  }, []);

  const filtered = orders.filter((o) => {
    const matchTab = tab === 'all' || o.status === tab;
    const matchSearch = !search || o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) || o.customerEmail.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const tabCount = (s: StatusTab) => s === 'all' ? orders.length : orders.filter((o) => o.status === s).length;

  const handleMarkPaid = async (order: Order) => {
    setUpdating(true);
    try {
      await fetch('/api/check-payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderId, status: 'paid' }),
      });
      toast.success('Status diperbarui & produk dikirim!');
      setSelected(null);
    } catch { toast.error('Gagal memperbarui status'); }
    finally { setUpdating(false); }
  };

  const handleMarkDelivered = async (order: Order) => {
    setUpdating(true);
    try { await updateOrder(order.orderId, { status: 'delivered' }); toast.success('Terkirim!'); setSelected(null); }
    catch { toast.error('Gagal'); } finally { setUpdating(false); }
  };

  const handleMarkFailed = async (order: Order) => {
    setUpdating(true);
    try { await updateOrder(order.orderId, { status: 'failed' }); toast.success('Ditandai gagal'); setSelected(null); }
    catch { toast.error('Gagal'); } finally { setUpdating(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Pesanan</h1>
        <p className="text-white/40 text-sm mt-0.5">Manajemen semua transaksi</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setTab(s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === s ? 'bg-electric-gradient text-white shadow-glow-sm' : 'glass text-white/40 hover:text-white/70'}`}>
            <span className="capitalize">{getStatusLabel(s)}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === s ? 'bg-white/20' : 'bg-white/5'}`}>{tabCount(s)}</span>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari order ID / pelanggan..." className="input-dark w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Order ID','Pelanggan','Produk','Total','Metode','Status','Waktu',''].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-white/30 text-xs font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 shimmer rounded w-20" /></td>)}
                </tr>
              )) : filtered.map((order) => (
                <tr key={order.orderId} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4 font-mono text-white/50 text-xs whitespace-nowrap">{order.orderId.slice(0, 18)}…</td>
                  <td className="px-5 py-4">
                    <p className="text-white/80 whitespace-nowrap">{order.customerName}</p>
                    <p className="text-white/30 text-xs">{order.customerEmail}</p>
                  </td>
                  <td className="px-5 py-4 text-white/60 max-w-36 truncate text-xs">{order.productName}</td>
                  <td className="px-5 py-4 text-gold-400 font-mono text-xs whitespace-nowrap">{formatCurrency(order.totalPayment || order.amount)}</td>
                  <td className="px-5 py-4 text-white/40 uppercase text-xs">{order.paymentMethod}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                  </td>
                  <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">{order.createdAt ? formatDate(order.createdAt as Date) : '—'}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => setSelected(order)} className="p-2 rounded-lg glass text-white/40 hover:text-electric-400 hover:bg-electric-600/10 transition-all">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && <div className="text-center py-16 text-white/20 text-sm">Tidak ada pesanan</div>}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="glass rounded-2xl border border-white/5 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 glass z-10">
                <div>
                  <h2 className="text-white font-semibold">Detail Pesanan</h2>
                  <p className="text-white/30 text-xs font-mono mt-0.5">{selected.orderId}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-xl glass text-white/40 hover:text-white"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="glass rounded-xl divide-y divide-white/5">
                  {[
                    { label: 'Produk', value: selected.productName },
                    { label: 'Pelanggan', value: selected.customerName },
                    { label: 'Email', value: selected.customerEmail },
                    { label: 'WhatsApp', value: selected.customerWhatsApp },
                    { label: 'Metode', value: PAYMENT_METHODS.find(m => m.id === selected.paymentMethod)?.label || selected.paymentMethod },
                    { label: 'No. Pembayaran', value: selected.paymentNumber || '—', mono: true },
                    { label: 'Total Bayar', value: formatCurrency(selected.totalPayment || selected.amount), mono: true, highlight: true },
                    { label: 'Waktu Buat', value: selected.createdAt ? formatDate(selected.createdAt as Date) : '—' },
                    ...(selected.paidAt ? [{ label: 'Waktu Bayar', value: formatDate(selected.paidAt as Date) }] : []),
                  ].map(({ label, value, mono, highlight }) => (
                    <div key={label} className="flex justify-between items-center px-4 py-3">
                      <span className="text-white/40 text-sm">{label}</span>
                      <span className={`text-sm ${mono ? 'font-mono' : ''} ${highlight ? 'text-gold-400 font-bold' : 'text-white/70'} max-w-48 text-right break-all`}>{value}</span>
                    </div>
                  ))}
                </div>
                {selected.deliveryContent && (
                  <div>
                    <p className="text-white/40 text-xs mb-2">Konten Terkirim</p>
                    <div className="bg-navy-100 rounded-xl p-4">
                      <pre className="text-gold-400 font-mono text-xs break-all whitespace-pre-wrap">{selected.deliveryContent}</pre>
                    </div>
                  </div>
                )}
                <div className="space-y-2 pt-2">
                  {selected.status === 'pending' && (
                    <button onClick={() => handleMarkPaid(selected)} disabled={updating}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-electric-gradient text-white text-sm font-semibold disabled:opacity-50">
                      {updating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={15} /> Tandai Dibayar & Kirim</>}
                    </button>
                  )}
                  {selected.status === 'paid' && (
                    <button onClick={() => handleMarkDelivered(selected)} disabled={updating}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/80 hover:bg-green-500 text-white text-sm font-semibold disabled:opacity-50">
                      {updating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Package size={15} /> Tandai Terkirim</>}
                    </button>
                  )}
                  {(selected.status === 'pending' || selected.status === 'paid') && (
                    <button onClick={() => handleMarkFailed(selected)} disabled={updating}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl glass border border-red-400/20 text-red-400 text-sm disabled:opacity-50">
                      <X size={15} /> Tandai Gagal
                    </button>
                  )}
                  {selected.status === 'pending' && (
                    <button onClick={() => window.open(`/payment/${selected.orderId}`, '_blank')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl glass border border-white/10 text-white/40 text-sm">
                      <RefreshCw size={15} /> Buka Halaman Pembayaran
                    </button>
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
