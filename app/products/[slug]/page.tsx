'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Star, Check, ShoppingCart, Zap, ArrowLeft, Minus, Plus, Package, Shield
} from 'lucide-react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { ProductCard } from '@/components/public/ProductCard';
import { getProductBySlug, getProducts } from '@/lib/firestore';
import { useCartStore, useCheckoutStore } from '@/store';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addItem } = useCartStore();
  const { setSelectedProduct } = useCheckoutStore();

  useEffect(() => {
    async function load() {
      try {
        const prod = await getProductBySlug(slug as string);
        setProduct(prod);
        if (prod) {
          const all = await getProducts({ isActive: true, category: prod.category });
          setRelated(all.filter((p) => p.id !== prod.id).slice(0, 4));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen animated-gradient">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="h-96 shimmer rounded-3xl" />
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 shimmer rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen animated-gradient">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-white text-2xl font-bold mb-2">Produk Tidak Ditemukan</h1>
            <Link href="/products" className="text-electric-400 hover:underline">← Kembali ke produk</Link>
          </div>
        </div>
      </main>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleBuyNow = () => {
    setSelectedProduct(product, qty);
    router.push('/checkout');
  };

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`${product.name} ditambahkan!`);
  };

  return (
    <main className="min-h-screen animated-gradient mobile-nav-safe">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-white transition-colors">Produk</Link>
          <span>/</span>
          <span className="text-white/70">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative h-80 lg:h-[480px] rounded-3xl overflow-hidden glass border border-white/10">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-300/60 to-transparent" />
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <span className={product.badge === 'bestseller' ? 'badge-bestseller' : 'badge-new'} style={{ padding: '6px 14px', borderRadius: '10px', display: 'inline-block' }}>
                    {product.badge === 'bestseller' ? '🏆 Terlaris' : '✨ Baru'}
                  </span>
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-xl text-sm font-bold">
                  -{discount}%
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-electric-400/70 text-sm font-medium uppercase tracking-wider">
              {product.category.replace(/-/g, ' ')}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mt-2 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(product.rating) ? 'text-gold-400 fill-gold-400' : 'text-white/20'}
                  />
                ))}
              </div>
              <span className="text-white/60 text-sm">{product.rating} • {product.totalSold} terjual</span>
              <span className={`text-sm font-medium ${product.stock.length > 0 ? 'text-green-400' : 'text-red-400'}`}>
                • {product.stock.length > 0 ? `Stok: ${product.stock.length}` : 'Habis'}
              </span>
            </div>

            {/* Price */}
            <div className="glass rounded-2xl p-5 mb-6 border border-white/5">
              <div className="flex items-end gap-3 mb-2">
                <span className="font-display font-bold text-4xl gradient-text-gold font-mono">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-white/30 text-xl line-through font-mono mb-1">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <span className="text-green-400 text-sm font-medium">
                  💰 Hemat {formatCurrency(product.originalPrice - product.price)} ({discount}% off)
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-white/60 text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Features */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 text-sm">Fitur yang Didapat:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-white/60 text-sm">
                    <Check size={14} className="text-electric-400 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Qty + Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-white/60 text-sm">Jumlah:</span>
                <div className="flex items-center gap-2 glass rounded-xl p-1">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-white font-medium">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock.length, qty + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-white/40 text-xs">Maks. {product.stock.length}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl glass border border-white/10 text-white/70 font-semibold hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
                >
                  <ShoppingCart size={18} />
                  Keranjang
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-electric-gradient text-white font-bold shadow-glow-blue hover:shadow-glow-gold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Zap size={18} />
                  Beli Sekarang
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex gap-4 mt-5 pt-5 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                <Shield size={13} className="text-green-400" />
                Pembayaran Aman
              </div>
              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                <Zap size={13} className="text-gold-400" />
                Pengiriman Instan
              </div>
              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                <Package size={13} className="text-electric-400" />
                Garansi Produk
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-white mb-8">
              Produk <span className="gradient-text">Terkait</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
