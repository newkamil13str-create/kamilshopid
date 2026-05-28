'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/firestore';
import { Category } from '@/types';
import { slugify } from '@/lib/utils';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  slug: z.string().min(2),
  icon: z.string().min(1, 'Pilih ikon'),
  color: z.string().min(4, 'Pilih warna'),
});
type FormData = z.infer<typeof schema>;

const EMOJI_OPTIONS = ['📱','✈️','⭐','🛠️','🖥️','🎮','🎵','🎬','📚','💳','🔧','🚀','💡','🎯','🔐','🌐','💼','🎁'];
const COLOR_OPTIONS = ['#25D366','#0088CC','#F59E0B','#8B5CF6','#EF4444','#3B82F6','#10B981','#F97316','#EC4899','#6366F1'];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { icon: '📦', color: '#2563EB' },
  });

  const watchName = watch('name');
  const watchIcon = watch('icon');
  const watchColor = watch('color');

  useEffect(() => {
    if (!editCat && watchName) setValue('slug', slugify(watchName));
  }, [watchName, editCat, setValue]);

  async function load() {
    const cats = await getCategories();
    setCategories(cats);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditCat(null);
    reset({ icon: '📦', color: '#2563EB' });
    setShowModal(true);
  };

  const openEdit = (c: Category) => {
    setEditCat(c);
    reset({ name: c.name, slug: c.slug, icon: c.icon, color: c.color });
    setShowModal(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editCat) {
        await updateCategory(editCat.id, data);
        toast.success('Kategori diperbarui!');
      } else {
        await createCategory(data);
        toast.success('Kategori ditambahkan!');
      }
      setShowModal(false);
      load();
    } catch {
      toast.error('Gagal menyimpan kategori');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success('Kategori dihapus!');
      setDeleteConfirm(null);
      load();
    } catch {
      toast.error('Gagal menghapus kategori');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Kategori</h1>
          <p className="text-white/40 text-sm mt-0.5">{categories.length} kategori total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-gradient text-white font-medium text-sm shadow-glow-blue">
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 shimmer rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass rounded-2xl p-5 border border-white/5 hover:border-electric-600/20 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40` }}>
                    {cat.icon}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{cat.name}</p>
                    <p className="text-white/30 text-xs font-mono mt-0.5">{cat.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg glass text-white/40 hover:text-electric-400"><Pencil size={13} /></button>
                  <button onClick={() => setDeleteConfirm(cat.id)} className="p-1.5 rounded-lg glass text-white/40 hover:text-red-400"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: cat.color }} />
                <span className="text-white/30 text-xs font-mono">{cat.color}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass rounded-2xl p-6 max-w-sm w-full border border-red-400/20">
              <h3 className="text-white font-semibold text-lg mb-2">Hapus Kategori?</h3>
              <p className="text-white/50 text-sm mb-5">Produk dalam kategori ini tidak akan terhapus.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl glass border border-white/10 text-white/60 text-sm">Batal</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold">Hapus</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="glass rounded-2xl border border-white/5 w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h2 className="text-white font-semibold">{editCat ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl glass text-white/40 hover:text-white"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                <div className="flex items-center gap-3 glass-blue rounded-xl p-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${watchColor}20`, border: `1px solid ${watchColor}40` }}>
                    {watchIcon}
                  </div>
                  <div>
                    <p className="text-white font-medium">{watch('name') || 'Nama Kategori'}</p>
                    <p className="text-white/30 text-xs">{watch('slug') || 'slug-kategori'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Nama *</label>
                  <input {...register('name')} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" placeholder="Nama kategori" />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Slug *</label>
                  <input {...register('slug')} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm font-mono" />
                  {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug.message}</p>}
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-2 block">Ikon</label>
                  <div className="grid grid-cols-9 gap-1.5">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button key={emoji} type="button" onClick={() => setValue('icon', emoji)}
                        className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${watchIcon === emoji ? 'bg-electric-600/20 border border-electric-600/40' : 'glass hover:bg-white/10'}`}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-2 block">Warna</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_OPTIONS.map((color) => (
                      <button key={color} type="button" onClick={() => setValue('color', color)}
                        className={`w-8 h-8 rounded-lg transition-all ${watchColor === color ? 'ring-2 ring-white/60 scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: color }} />
                    ))}
                    <input type="color" value={watchColor} onChange={(e) => setValue('color', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl glass border border-white/10 text-white/60 text-sm">Batal</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-electric-gradient text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={14} /> Simpan</>}
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
