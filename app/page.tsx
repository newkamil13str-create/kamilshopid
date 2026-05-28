'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Zap,
  Shield,
  Clock,
  Star,
  ChevronDown,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { ProductCard, ProductCardSkeleton } from '@/components/public/ProductCard';
import { StatsCounter } from '@/components/public/StatsCounter';
import { getProducts, getCategories } from '@/lib/firestore';
import { Product, Category } from '@/types';

const testimonials = [
  { name: 'Budi Santoso', role: 'Pemilik UMKM', text: 'Produk berkualitas tinggi, pengiriman cepat dan aman. Sangat merekomendasikan!', rating: 5, avatar: 'BS' },
  { name: 'Siti Rahayu', role: 'Content Creator', text: 'Bot WhatsApp yang saya beli benar-benar membantu bisnis saya berkembang pesat!', rating: 5, avatar: 'SR' },
  { name: 'Ahmad Fauzi', role: 'Developer', text: 'Script landing page-nya keren banget, responsif dan loading-nya cepet!', rating: 5, avatar: 'AF' },
  { name: 'Dewi Lestari', role: 'Freelancer', text: 'Akun Netflix-nya aman, sudah 3x beli di sini selalu memuaskan!', rating: 5, avatar: 'DL' },
];

const faqs = [
  { q: 'Bagaimana cara membeli produk di KAMIL-SHOP?', a: 'Pilih produk yang Anda inginkan, klik "Beli Sekarang", isi data diri, pilih metode pembayaran, dan selesaikan pembayaran. Produk akan otomatis terkirim setelah pembayaran dikonfirmasi.' },
  { q: 'Metode pembayaran apa saja yang tersedia?', a: 'Kami mendukung QRIS, Transfer Bank (BCA, BNI, BRI, Mandiri), dan E-Wallet (DANA, OVO, GoPay) melalui payment gateway Pakasir yang aman dan terpercaya.' },
  { q: 'Berapa lama pengiriman produk digital?', a: 'Produk digital dikirimkan secara otomatis dalam hitungan detik setelah pembayaran dikonfirmasi oleh sistem kami.' },
  { q: 'Apakah ada garansi untuk produk yang dibeli?', a: 'Ya, kami memberikan garansi sesuai deskripsi produk. Jika ada masalah, hubungi kami melalui WhatsApp atau email untuk penanganan lebih lanjut.' },
  { q: 'Bagaimana cara cek status pesanan saya?', a: 'Anda bisa cek status pesanan di halaman /order dengan memasukkan Order ID yang Anda terima saat checkout.' },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <main className="min-h-screen animated-gradient mobile-nav-safe">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        {/* Radial glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl animate-pulse-slow [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-600/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass-blue rounded-full px-5 py-2.5 mb-8 text-sm"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-electric-400 font-medium">Platform Digital #1 Terpercaya</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Produk Digital{' '}
            <span className="gradient-text block">Terbaik & Terpercaya</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Solusi digital lengkap untuk bisnis Anda. Bot otomatis, akun premium, tools canggih — semuanya di satu tempat dengan harga terjangkau.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-electric-gradient text-white font-semibold shadow-glow-blue hover:shadow-glow-gold transition-all hover:scale-105 text-base"
            >
              <ShoppingBag size={20} />
              Lihat Semua Produk
              <ArrowRight size={16} />
            </Link>
            <a
              href="#featured"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass border border-white/10 text-white/80 font-semibold hover:bg-white/5 transition-all text-base"
            >
              <Zap size={20} />
              Produk Unggulan
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 mt-14"
          >
            {[
              { icon: Shield, label: '100% Aman & Terpercaya' },
              { icon: Zap, label: 'Pengiriman Instan' },
              { icon: Clock, label: 'Support 24/7' },
              { icon: Star, label: 'Rating Bintang 5' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/40 text-sm">
                <Icon size={15} className="text-gold-500" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30"
        >
          <ChevronDown size={28} />
        </motion.div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <StatsCounter />
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-electric-400 text-sm font-medium uppercase tracking-widest mb-3 block">
            Produk Pilihan
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
            Produk <span className="gradient-text-gold">Unggulan</span> Kami
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Temukan produk digital berkualitas premium dengan harga yang terjangkau
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap justify-center mb-10">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-electric-gradient text-white shadow-glow-blue'
                : 'glass text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
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

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.slice(0, 8).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        {filtered.length > 8 && (
          <div className="text-center mt-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl glass border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
            >
              Lihat Semua Produk
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-10 border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-electric-600/10 rounded-full blur-3xl" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: 'Pengiriman Instan', desc: 'Produk digital terkirim otomatis dalam hitungan detik setelah pembayaran', color: 'text-gold-400' },
              { icon: Shield, title: 'Keamanan Terjamin', desc: 'Transaksi aman dengan enkripsi SSL dan payment gateway terpercaya', color: 'text-electric-400' },
              { icon: Star, title: 'Produk Berkualitas', desc: 'Semua produk telah melalui proses kurasi ketat untuk memastikan kualitas', color: 'text-gold-400' },
              { icon: CheckCircle, title: 'Garansi Kepuasan', desc: 'Garansi uang kembali jika produk tidak sesuai dengan deskripsi', color: 'text-green-400' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="text-center">
                <div className={`w-14 h-14 rounded-2xl glass-blue flex items-center justify-center mx-auto mb-4 ${color}`}>
                  <Icon size={26} />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-electric-400 text-sm font-medium uppercase tracking-widest mb-3 block">Testimoni</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white">
            Apa Kata <span className="gradient-text">Pelanggan</span> Kami
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 border border-white/5 hover:border-electric-600/20 transition-all"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="text-gold-400 fill-gold-400" />
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-electric-gradient flex items-center justify-center text-white text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-electric-400 text-sm font-medium uppercase tracking-widest mb-3 block">FAQ</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Pertanyaan <span className="gradient-text-gold">Umum</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl border border-white/5 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-white font-medium text-sm pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-white/40 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-white/50 text-sm leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-electric-gradient opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-300/50 to-transparent" />
          <div className="relative z-10 p-12 text-center">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
              Siap Memulai?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Bergabung dengan ribuan pelanggan yang sudah mempercayai KAMIL-SHOP untuk kebutuhan digital mereka.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-electric-600 font-bold text-base hover:bg-gold-50 transition-all hover:scale-105 shadow-xl"
            >
              <ShoppingBag size={20} />
              Mulai Belanja Sekarang
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
