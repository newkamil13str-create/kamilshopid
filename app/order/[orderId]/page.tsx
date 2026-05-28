'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Package, Zap, Copy, ArrowLeft } from 'lucide-react';
import { subscribeToOrder } from '@/lib/firestore';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { PAYMENT_METHODS } from '@/lib/pakasir';
import { Order } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

const steps = [
  { key: 'pending', label: 'Menunggu Bayar', icon: Clock },
  { key: 'paid', label: 'Pembayaran Dikonfirmasi', icon: CheckCircle },
  { key: 'delivered', label: 'Produk Terkirim', icon: Package },
];

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = subscribeToOrder(orderId as string, (ord) => {
      setOrder(ord);
      setLoading(false);
    });
    return () => unsub();
  }, [orderId]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStepIndex = steps.findIndex((s) => s.key === order?.status);
  const methodInfo = PAYMENT_METHODS.find((m) => m.id === order?.paymentMethod);

  if (loading) {
    return (
      <main className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-electric-600/30 border-t-electric-600 rounded-full animate-spin" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Order Tidak Ditemukan</h1>
          <Link href="/" className="text-electric-400 hover:underline">← Beranda</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen animated-gradient py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/40 text-sm hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
                Status Pesanan
              </h1>
              <p className="text-white/40 font-mono text-sm">{order.orderId}</p>
            </div>
            <span className={`px-4 py-2 rounded-xl border text-sm font-semibold ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
        </motion.div>

        {/* Progress tracker */}
        {order.status !== 'failed' && order.status !== 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 border border-white/5 mb-6"
          >
            <div className="flex items-center gap-0">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const done = currentStepIndex >= i;
                const active = currentStepIndex === i;
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      done
                        ? 'bg-electric-600 border-electric-600 shadow-glow-blue'
                        : 'bg-navy-100 border-white/10'
                    }`}>
                      <Icon size={16} className={done ? 'text-white' : 'text-white/20'} />
                    </div>
                    <p className={`text-xs mt-2 text-center leading-tight ${done ? 'text-white/70' : 'text-white/20'}`}>
                      {step.label}
                    </p>
                    {i < steps.length - 1 && (
                      <div className={`absolute mt-5 h-0.5 w-full max-w-24 ${done && currentStepIndex > i ? 'bg-electric-600' : 'bg-white/5'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Delivered: show product */}
        {order.status === 'delivered' && order.deliveryContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="glass-blue rounded-2xl p-6 border border-electric-600/20 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-gold-400" />
              <h2 className="text-white font-semibold">Produk Digital Anda</h2>
            </div>
            <div className="bg-navy-100 rounded-xl p-4 mb-4">
              <pre className="text-gold-400 font-mono text-sm break-all whitespace-pre-wrap">
                {order.deliveryContent}
              </pre>
            </div>
            <button
              onClick={() => handleCopy(order.deliveryContent || '')}
              className="w-full py-3 rounded-xl glass border border-white/10 text-white/60 text-sm flex items-center justify-center gap-2 hover:text-white hover:bg-white/5 transition-all"
            >
              {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? 'Tersalin!' : 'Salin Konten Produk'}
            </button>
          </motion.div>
        )}

        {/* Order details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl border border-white/5 overflow-hidden mb-6"
        >
          <div className="p-5 border-b border-white/5">
            <h2 className="text-white font-semibold">Detail Pesanan</h2>
          </div>
          <div className="divide-y divide-white/5">
            {[
              { label: 'Produk', value: order.productName },
              { label: 'Pembeli', value: order.customerName },
              { label: 'Email', value: order.customerEmail },
              { label: 'WhatsApp', value: order.customerWhatsApp },
              { label: 'Metode Bayar', value: methodInfo?.label || order.paymentMethod },
              { label: 'Subtotal', value: formatCurrency(order.amount) },
              { label: 'Biaya Admin', value: formatCurrency(order.fee || 0) },
              { label: 'Total Bayar', value: formatCurrency(order.totalPayment || order.amount), highlight: true },
              { label: 'Waktu Pesan', value: order.createdAt ? formatDate(order.createdAt as Date) : '—' },
              ...(order.paidAt ? [{ label: 'Waktu Bayar', value: formatDate(order.paidAt as Date) }] : []),
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex justify-between items-center px-5 py-3.5">
                <span className="text-white/40 text-sm">{label}</span>
                <span className={`text-sm font-medium ${highlight ? 'text-gold-400 font-bold font-mono' : 'text-white/80'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        {order.status === 'pending' && (
          <button
            onClick={() => router.push(`/payment/${orderId}`)}
            className="w-full py-3.5 rounded-2xl bg-electric-gradient text-white font-semibold flex items-center justify-center gap-2 shadow-glow-blue hover:shadow-glow-gold transition-all"
          >
            <Zap size={18} />
            Lanjutkan Pembayaran
          </button>
        )}

        {order.status === 'delivered' && (
          <Link
            href="/products"
            className="w-full py-3.5 rounded-2xl glass border border-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
          >
            Beli Produk Lain
          </Link>
        )}
      </div>
    </main>
  );
}
