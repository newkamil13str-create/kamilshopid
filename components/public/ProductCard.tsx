'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Zap } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} ditambahkan ke keranjang!`);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="product-card glass rounded-2xl overflow-hidden group cursor-pointer border border-white/5 hover:border-electric-600/30">
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-navy-50 to-navy-100 overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-300/80 to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {product.badge === 'bestseller' && (
                <span className="badge-bestseller px-2.5 py-1 rounded-lg text-xs font-bold shadow-glow-gold">
                  🏆 Terlaris
                </span>
              )}
              {product.badge === 'new' && (
                <span className="badge-new px-2.5 py-1 rounded-lg text-xs font-bold shadow-glow-blue">
                  ✨ Baru
                </span>
              )}
              {discount > 0 && (
                <span className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
              <Star size={12} className="text-gold-400 fill-gold-400" />
              <span className="text-white text-xs font-medium">{product.rating}</span>
              <span className="text-white/50 text-xs">({product.totalSold})</span>
            </div>

            {/* Stock indicator */}
            <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
              <span className={`text-xs font-medium ${product.stock.length > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {product.stock.length > 0 ? `Stok: ${product.stock.length}` : 'Habis'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="mb-1">
              <span className="text-electric-400/70 text-xs font-medium uppercase tracking-wider">
                {product.category.replace('-', ' ')}
              </span>
            </div>
            <h3 className="text-white font-semibold text-sm leading-tight mb-3 line-clamp-2 group-hover:text-electric-400 transition-colors">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-end gap-2 mb-4">
              <span className="text-gold-400 font-bold text-lg font-mono">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-white/30 text-sm line-through font-mono">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-electric-600/10 hover:border-electric-600/30 hover:text-electric-400 transition-all"
                disabled={product.stock.length === 0}
              >
                <ShoppingCart size={14} />
                Keranjang
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-electric-gradient text-white text-sm font-medium shadow-glow-sm hover:shadow-glow-blue transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={product.stock.length === 0}
              >
                <Zap size={14} />
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Skeleton loader
export function ProductCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/5">
      <div className="h-48 shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-20 shimmer rounded-full" />
        <div className="h-4 w-full shimmer rounded-full" />
        <div className="h-4 w-3/4 shimmer rounded-full" />
        <div className="h-6 w-32 shimmer rounded-full" />
        <div className="flex gap-2">
          <div className="flex-1 h-10 shimmer rounded-xl" />
          <div className="flex-1 h-10 shimmer rounded-xl" />
        </div>
      </div>
    </div>
  );
}
