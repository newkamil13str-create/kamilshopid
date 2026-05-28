'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Eye, EyeOff, Settings, User, Globe, CreditCard } from 'lucide-react';
import { getSettings, updateSettings, updateUser } from '@/lib/firestore';
import { useAuthStore } from '@/store';
import { SiteSettings } from '@/types';
import toast from 'react-hot-toast';

const siteSchema = z.object({
  siteName: z.string().min(2),
  tagline: z.string().optional(),
  pakasirSlug: z.string().min(1, 'Pakasir slug wajib diisi'),
  pakasirApiKey: z.string().min(1, 'API key wajib diisi'),
  maintenanceMode: z.boolean(),
});
const profileSchema = z.object({
  displayName: z.string().min(2),
  phone: z.string().optional(),
});
type SiteForm = z.infer<typeof siteSchema>;
type ProfileForm = z.infer<typeof profileSchema>;

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [savingSite, setSavingSite] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const siteForm = useForm<SiteForm>({ resolver: zodResolver(siteSchema), defaultValues: { siteName: 'KAMIL-SHOP', maintenanceMode: false } });
  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema), defaultValues: { displayName: user?.displayName || '', phone: user?.phone || '' } });

  useEffect(() => {
    getSettings().then((settings) => {
      if (settings) siteForm.reset({ siteName: settings.siteName || 'KAMIL-SHOP', tagline: settings.tagline || '', pakasirSlug: settings.pakasirSlug || '', pakasirApiKey: settings.pakasirApiKey || '', maintenanceMode: settings.maintenanceMode || false });
      setLoading(false);
    });
  }, [siteForm]);

  const onSaveSite = async (data: SiteForm) => {
    setSavingSite(true);
    try { await updateSettings(data as SiteSettings); toast.success('Pengaturan disimpan!'); }
    catch { toast.error('Gagal menyimpan'); } finally { setSavingSite(false); }
  };

  const onSaveProfile = async (data: ProfileForm) => {
    if (!user?.id) return;
    setSavingProfile(true);
    try { await updateUser(user.id, { displayName: data.displayName, phone: data.phone }); toast.success('Profil diperbarui!'); }
    catch { toast.error('Gagal memperbarui'); } finally { setSavingProfile(false); }
  };

  if (loading) return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 shimmer rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Pengaturan</h1>
        <p className="text-white/40 text-sm mt-0.5">Konfigurasi sistem KAMIL-SHOP</p>
      </div>

      {/* Site */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-white/5"><Globe size={17} className="text-electric-400" /><h2 className="text-white font-semibold">Pengaturan Situs</h2></div>
        <form onSubmit={siteForm.handleSubmit(onSaveSite)} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-xs mb-1 block">Nama Situs</label>
              <input {...siteForm.register('siteName')} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Tagline</label>
              <input {...siteForm.register('tagline')} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/5">
            <div>
              <p className="text-white font-medium text-sm">Mode Maintenance</p>
              <p className="text-white/40 text-xs mt-0.5">Sembunyikan situs dari pengunjung</p>
            </div>
            <button type="button" onClick={() => siteForm.setValue('maintenanceMode', !siteForm.watch('maintenanceMode'))}
              className={`w-12 h-6 rounded-full transition-colors relative ${siteForm.watch('maintenanceMode') ? 'bg-gold-500' : 'bg-white/10'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${siteForm.watch('maintenanceMode') ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <button type="submit" disabled={savingSite} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-gradient text-white text-sm font-semibold disabled:opacity-50">
            {savingSite ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={15} /> Simpan</>}
          </button>
        </form>
      </motion.div>

      {/* Payment */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-white/5"><CreditCard size={17} className="text-gold-400" /><h2 className="text-white font-semibold">Konfigurasi Pakasir</h2></div>
        <form onSubmit={siteForm.handleSubmit(onSaveSite)} className="p-5 space-y-4">
          <div className="glass-blue rounded-xl p-4 text-sm text-electric-300/70">
            ℹ️ Dapatkan credentials di <a href="https://app.pakasir.com" target="_blank" rel="noopener noreferrer" className="text-electric-400 hover:underline">app.pakasir.com</a>
          </div>
          <div>
            <label className="text-white/60 text-xs mb-1 block">Project Slug</label>
            <input {...siteForm.register('pakasirSlug')} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm font-mono" placeholder="your-project-slug" />
            {siteForm.formState.errors.pakasirSlug && <p className="text-red-400 text-xs mt-1">{siteForm.formState.errors.pakasirSlug.message}</p>}
          </div>
          <div>
            <label className="text-white/60 text-xs mb-1 block">API Key</label>
            <div className="relative">
              <input {...siteForm.register('pakasirApiKey')} type={showApiKey ? 'text' : 'password'} className="input-dark w-full px-3 pr-10 py-2.5 rounded-xl text-sm font-mono" placeholder="pak_live_xxxx" />
              <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {siteForm.formState.errors.pakasirApiKey && <p className="text-red-400 text-xs mt-1">{siteForm.formState.errors.pakasirApiKey.message}</p>}
            <p className="text-white/20 text-xs mt-1">🔒 Tersimpan di Firestore. Tidak dikirim ke client.</p>
          </div>
          <button type="submit" disabled={savingSite} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-gradient text-navy-300 text-sm font-bold disabled:opacity-50">
            {savingSite ? <span className="w-4 h-4 border-2 border-navy-300/30 border-t-navy-300 rounded-full animate-spin" /> : <><Save size={15} /> Simpan Konfigurasi</>}
          </button>
        </form>
      </motion.div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-white/5"><User size={17} className="text-green-400" /><h2 className="text-white font-semibold">Profil Admin</h2></div>
        <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="p-5 space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-electric-gradient flex items-center justify-center text-white text-xl font-bold">{user?.displayName?.charAt(0).toUpperCase()}</div>
            <div>
              <p className="text-white font-medium">{user?.displayName}</p>
              <p className="text-white/40 text-sm">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-xs mb-1 block">Nama Tampilan</label>
              <input {...profileForm.register('displayName')} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">No. HP</label>
              <input {...profileForm.register('phone')} className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
          <button type="submit" disabled={savingProfile} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-gradient text-white text-sm font-semibold disabled:opacity-50">
            {savingProfile ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={15} /> Perbarui Profil</>}
          </button>
        </form>
      </motion.div>

      {/* System info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-white/5"><Settings size={17} className="text-purple-400" /><h2 className="text-white font-semibold">Informasi Sistem</h2></div>
        <div className="p-5 divide-y divide-white/5">
          {[
            { label: 'Versi', value: '1.0.0' },
            { label: 'Framework', value: 'Next.js 14 App Router' },
            { label: 'Database', value: 'Firebase Firestore' },
            { label: 'Payment Gateway', value: 'Pakasir' },
            { label: 'Domain', value: 'kamilshop.my.id' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-3">
              <span className="text-white/40 text-sm">{label}</span>
              <span className="text-white/70 text-sm font-mono">{value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
