'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingCart, User, Mail, Phone, CreditCard, Zap, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { useCartStore, useCheckoutStore, useAuthStore } from '@/store';
import { formatCurrency } from '@/lib/utils';
import { PAYMENT_METHODS, generateOrderId } from '@/lib/pakasir';
import toast from 'react-hot-toast';

const schema = z.object({
  customerName: z.string().min(2, 'Nama minimal 2 karakter'),
  customerEmail: z.string().email('Email tidak valid'),
  customerWhatsApp: z.string().min(10, 'Nomor WhatsApp minimal 10 digit'),
  paymentMethod: z.string().min(1, 'Pilih metode pembayaran'),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { selectedProduct, quantity, clearCheckout } = useCheckoutStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: user?.displayName || '',
      customerEmail: user?.email || '',
      customerWhatsApp: user?.phone || '',
      paymentMethod: '',
    },
  });

  const selectedMethod = watch('paymentMethod');

  // Determine what we're checking out
  const checkoutItems = selectedProduct
    ? [{ product: selectedProduct, quantity }]
    : items;

  const totalAmount = selectedProduct
    ? selectedProduct.price * quantity
    : getTotalPrice();

  if (checkoutItems.length === 0) {
    return (
      <main className="min-h-screen animated-gradient">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <ShoppingCart size={64} className="text-white/20 mx-auto mb-4" />
            <h1 className="text-white text-2xl font-bold mb-2">Keranjang Kosong</h1>
            <p className="text-white/40 mb-6">Tambahkan produk ke keranjang untuk melanjutkan</p>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 rounded-xl bg-electric-gradient text-white font-semibold"
            >
              Lihat Produk
            </button>
          </div>
        </div>
      </main>
    );
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // For simplicity, checkout first item (single product checkout)
      const item = checkoutItems[0];
      const orderId = generateOrderId();

      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: data.paymentMethod,
          amount: totalAmount,
          orderId,
          productId: item.product.id,
          customerData: {
            name: data.customerName,
            email: data.customerEmail,
            whatsApp: data.customerWhatsApp,
          },
          productName: item.product.name,
          userId: user?.id || null,
        }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || 'Gagal membuat pembayaran');
      }

      // Clear cart/checkout
      clearCart();
      clearCheckout();

      router.push(`/payment/${orderId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen animated-gradient mobile-nav-safe">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            <span className="gradient-text">Checkout</span>
          </h1>
          <p className="text-white/40">Lengkapi data untuk menyelesaikan pembelian</p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Customer Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6 border border-white/5"
              >
                <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
                  <User size={18} className="text-electric-400" />
                  Informasi Pembeli
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">Nama Lengkap</label>
                    <input
                      {...register('customerName')}
                      placeholder="Masukkan nama lengkap"
                      className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                    />
                    {errors.customerName && (
                      <p className="text-red-400 text-xs mt-1">{errors.customerName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-1.5 flex items-center gap-1.5 block">
                      <Mail size={13} /> Email
                    </label>
                    <input
                      {...register('customerEmail')}
                      type="email"
                      placeholder="email@contoh.com"
                      className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                    />
                    {errors.customerEmail && (
                      <p className="text-red-400 text-xs mt-1">{errors.customerEmail.message}</p>
                    )}
                    <p className="text-white/30 text-xs mt-1">
                      Produk akan dikirim ke email ini
                    </p>
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-1.5 flex items-center gap-1.5 block">
                      <Phone size={13} /> Nomor WhatsApp
                    </label>
                    <input
                      {...register('customerWhatsApp')}
                      placeholder="08xxxxxxxxxx"
                      className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                    />
                    {errors.customerWhatsApp && (
                      <p className="text-red-400 text-xs mt-1">{errors.customerWhatsApp.message}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6 border border-white/5"
              >
                <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
                  <CreditCard size={18} className="text-electric-400" />
                  Metode Pembayaran
                </h2>

                {/* Categories */}
                {(['qr', 'bank', 'ewallet'] as const).map((cat) => {
                  const methods = PAYMENT_METHODS.filter((m) => m.category === cat);
                  const catLabel = cat === 'qr' ? 'QRIS' : cat === 'bank' ? 'Transfer Bank' : 'E-Wallet';
                  return (
                    <div key={cat} className="mb-5">
                      <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">
                        {catLabel}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {methods.map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setValue('paymentMethod', method.id)}
                            className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                              selectedMethod === method.id
                                ? 'border-electric-600/60 bg-electric-600/10 text-white'
                                : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                            }`}
                          >
                            <span className="text-xl">{method.icon}</span>
                            <span className="text-xs leading-tight">{method.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {errors.paymentMethod && (
                  <p className="text-red-400 text-xs mt-1">{errors.paymentMethod.message}</p>
                )}
              </motion.div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-2xl p-6 border border-white/5 sticky top-24"
              >
                <h2 className="text-white font-semibold text-lg mb-5">Ringkasan Pesanan</h2>

                {/* Items */}
                <div className="space-y-3 mb-5">
                  {checkoutItems.map(({ product, quantity: qty }) => (
                    <div key={product.id} className="flex gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium leading-tight truncate">
                          {product.name}
                        </p>
                        <p className="text-white/40 text-xs mt-0.5">x{qty}</p>
                        <p className="text-gold-400 text-sm font-semibold font-mono mt-1">
                          {formatCurrency(product.price * qty)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2 mb-5">
                  <div className="flex justify-between text-white/50 text-sm">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-white/50 text-sm">
                    <span>Biaya Layanan</span>
                    <span className="text-xs text-white/30">(dihitung saat bayar)</span>
                  </div>
                </div>

                <div className="flex justify-between text-white font-bold text-lg mb-6 pb-4 border-b border-white/5">
                  <span>Total</span>
                  <span className="font-mono gradient-text-gold">{formatCurrency(totalAmount)}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedMethod}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-electric-gradient text-white font-bold text-base shadow-glow-blue hover:shadow-glow-gold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </span>
                  ) : (
                    <>
                      <Zap size={18} />
                      Bayar Sekarang
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <p className="text-white/30 text-xs text-center mt-3">
                  🔒 Pembayaran aman dengan enkripsi SSL
                </p>
              </motion.div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  );
}
