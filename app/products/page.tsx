'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { ProductCard, ProductCardSkeleton } from '@/components/public/ProductCard';
import { getProducts, getCategories } from '@/lib/firestore';
import { Product, Category } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const [prods, cats] = await Promise.all([
          getProducts({ isActive: true }),
          getCategories(),
        ]);
        setProducts(prods);
        setCategories(cats);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <main className="min-h-screen animated-gradient mobile-nav-safe">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-electric-600/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <span className="text-electric-400 text-sm font-medium uppercase tracking-widest mb-3 block">
              Katalog
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              Semua <span className="gradient-text">Produk</span>
            </h1>
            <p className="text-white/50 max-w-xl mx-auto">
              Temukan produk digital terbaik untuk kebutuhan Anda
            </p>
          </motion.div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-dark w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm focus:ring-0 outline-none"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-electric-gradient text-white shadow-glow-blue'
                  : 'glass text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <SlidersHorizontal size={14} className="inline mr-1.5" />
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.slug
                    ? 'bg-electric-gradient text-white shadow-glow-blue'
                    : 'glass text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-white text-xl font-semibold mb-2">Produk Tidak Ditemukan</h3>
            <p className="text-white/40">Coba kata kunci atau kategori yang berbeda</p>
          </div>
        ) : (
          <>
            <p className="text-white/40 text-sm mb-6">
              Menampilkan {filtered.length} produk
              {search && <> untuk "<span className="text-white/60">{search}</span>"</>}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}
