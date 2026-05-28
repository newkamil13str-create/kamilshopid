'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, Pencil, Trash2, X, Check, ToggleLeft, ToggleRight,
  Image as ImageIcon, Search, Package,
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import {
  getProducts, getCategories, createProduct, updateProduct, deleteProduct,
} from '@/lib/firestore';
import { formatCurrency, slugify } from '@/lib/utils';
import { Product, Category } from '@/types';
import Image from 'next/image';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().min(1000),
  originalPrice: z.coerce.number().min(0),
  category: z.string().min(1),
  imageUrl: z.string().url('URL gambar tidak valid'),
  badge: z.enum(['bestseller', 'new', '']),
  features: z.string(),
  stock: z.string(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, badge: '' },
  });

  const watchName = watch('name');
  useEffect(() => {
    if (!editProduct && watchName) {
      setValue('slug', slugify(watchName));
    }
  }, [watchName, editProduct, setValue]);

  async function load() {
    const [prods, cats] = await Promise.all([getProducts({}), getCategories()]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditProduct(null);
    reset({ isActive: true, badge: '', imageUrl: '' });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    reset({
      name: p.name, slug: p.slug, description: p.description,
      price: p.price, originalPrice: p.originalPrice, category: p.category,
      imageUrl: p.imageUrl, badge: p.badge as 'bestseller' | 'new' | '',
      features: p.features.join('\n'), stock: p.stock.join('\n'),
      isActive: p.isActive,
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setValue('imageUrl', url);
      toast.success('Gambar berhasil diupload!');
    } catch {
      toast.error('Gagal upload gambar');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const productData = {
        name: data.name, slug: data.slug, description: data.description,
        price: data.price, originalPrice: data.originalPrice,
        category: data.category, imageUrl: data.imageUrl,
        badge: data.badge as 'bestseller' | 'new' | '',
        features: data.features.split('\n').filter(Boolean),
        stock: data.stock.split('\n').filter(Boolean),
        isActive: data.isActive,
        rating: editProduct?.rating || 5.0,
        totalSold: editProduct?.totalSold || 0,
      };
      if (editProduct) {
        await updateProduct(editProduct.id, productData);
        toast.success('Produk diperbarui!');
      } else {
        await createProduct(productData);
        toast.success('Produk ditambahkan!');
      }
      setShowModal(false);
      load();
    } catch {
      toast.error('Gagal menyimpan produk');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast.success('Produk dihapus!');
      setDeleteConfirm(null);
      load();
    } catch {
      toast.error('Gagal menghapus produk');
    }
  };

  const handleToggle = async (p: Product) => {
    await updateProduct(p.id, { isActive: !p.isActive });
    toast.success(p.isActive ? 'Produk dinonaktifkan' : 'Produk diaktifkan');
    load();
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Produk</h1>
          <p className="text-white/40 text-sm mt-0.5">{products.length} produk total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-gradient text-white font-medium text-sm shadow-glow-blue hover:shadow-glow-gold transition-all"
        >
          <Plus size={16} />
          Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="input-dark w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Produk', 'Kategori', 'Harga', 'Stok', 'Status', 'Terjual', 'Aksi'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-white/30 text-xs font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 shimmer rounded w-20" /></td>
                      ))}
                    </tr>
                  ))
                : filtered.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-navy-100">
                            <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="40px" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium leading-tight line-clamp-1 max-w-48">{p.name}</p>
                            {p.badge && (
                              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${p.badge === 'bestseller' ? 'badge-bestseller' : 'badge-new'}`}>
                                {p.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white/50 text-xs capitalize">{p.category.replace(/-/g, ' ')}</td>
                      <td className="px-5 py-4 text-gold-400 font-mono text-xs whitespace-nowrap">{formatCurrency(p.price)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium ${p.stock.length > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {p.stock.length} item
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleToggle(p)} className="flex items-center gap-1.5">
                          {p.isActive
                            ? <ToggleRight size={20} className="text-electric-400" />
                            : <ToggleLeft size={20} className="text-white/20" />}
                          <span className={`text-xs ${p.isActive ? 'text-electric-400' : 'text-white/20'}`}>
                            {p.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-4 text-white/50 text-xs">{p.totalSold}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 rounded-lg glass text-white/40 hover:text-electric-400 hover:bg-electric-600/10 transition-all"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(p.id)}
                            className="p-2 rounded-lg glass text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 text-white/20">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              Tidak ada produk
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass rounded-2xl p-6 max-w-sm w-full border border-red-400/20"
            >
              <h3 className="text-white font-semibold text-lg mb-2">Hapus Produk?</h3>
              <p className="text-white/50 text-sm mb-5">Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl glass border border-white/10 text-white/60 text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass rounded-2xl border border-white/5 w-full max-w-2xl my-4"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-white font-semibold text-lg">
                  {editProduct ? 'Edit Produk' : 'Tambah Produk'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl glass text-white/40 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Nama Produk *</label>
                    <input {...register('name')} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" placeholder="Nama produk" />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Slug *</label>
                    <input {...register('slug')} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm font-mono" placeholder="slug-produk" />
                    {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-1 block">Deskripsi *</label>
                  <textarea {...register('description')} rows={3} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm resize-none" placeholder="Deskripsi produk..." />
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Harga (Rp) *</label>
                    <input {...register('price')} type="number" className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" placeholder="75000" />
                    {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Harga Coret (Rp)</label>
                    <input {...register('originalPrice')} type="number" className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" placeholder="150000" />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Kategori *</label>
                    <select {...register('category')} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
                      <option value="">Pilih kategori</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="text-white/60 text-xs mb-1 block">URL Gambar *</label>
                  <div className="flex gap-2">
                    <input {...register('imageUrl')} className="input-dark flex-1 px-3 py-2.5 rounded-xl text-sm" placeholder="https://..." />
                    <input type="file" ref={fileRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="px-3 py-2.5 rounded-xl glass border border-white/10 text-white/50 text-sm hover:text-white hover:bg-white/5 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <ImageIcon size={14} />
                      {uploading ? 'Upload...' : 'Upload'}
                    </button>
                  </div>
                  {errors.imageUrl && <p className="text-red-400 text-xs mt-1">{errors.imageUrl.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Badge</label>
                    <select {...register('badge')} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm">
                      <option value="">Tidak ada</option>
                      <option value="bestseller">Terlaris</option>
                      <option value="new">Baru</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-0.5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input {...register('isActive')} type="checkbox" className="sr-only" />
                      <div className={`w-11 h-6 rounded-full transition-colors ${watch('isActive') ? 'bg-electric-600' : 'bg-white/10'} relative`} onClick={() => setValue('isActive', !watch('isActive'))}>
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${watch('isActive') ? 'left-6' : 'left-1'}`} />
                      </div>
                      <span className="text-white/60 text-sm">Aktif</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-1 block">Fitur (satu per baris)</label>
                  <textarea {...register('features')} rows={4} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm resize-none font-mono" placeholder="Multi-Device Support&#10;Auto Reply Canggih&#10;Panel Admin Web" />
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-1 block">Stok/Konten (satu per baris)</label>
                  <textarea {...register('stock')} rows={5} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm resize-none font-mono text-xs" placeholder="LICENSE-KEY-001|https://link.com&#10;LICENSE-KEY-002|https://link.com" />
                  <p className="text-white/20 text-xs mt-1">Setiap baris = 1 item. Item pertama akan dikirim saat order berhasil.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl glass border border-white/10 text-white/60 text-sm font-medium">
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-electric-gradient text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><Check size={16} /> Simpan</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
