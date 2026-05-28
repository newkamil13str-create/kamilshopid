'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { registerWithEmail } from '@/lib/auth';
import toast from 'react-hot-toast';

const schema = z.object({
  displayName: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await registerWithEmail(data.email, data.password, data.displayName, data.phone);
      toast.success('Akun berhasil dibuat!');
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('email-already-in-use')) {
        toast.error('Email sudah terdaftar. Silakan masuk.');
      } else {
        toast.error('Gagal membuat akun. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen animated-gradient flex items-center justify-center p-4 py-10">
      <div className="fixed top-1/4 left-1/4 w-80 h-80 bg-electric-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-electric-600 to-gold-500 flex items-center justify-center text-white font-display font-bold text-2xl shadow-glow-blue">
              K
            </div>
            <span className="font-display font-bold text-xl text-white">
              KAMIL<span className="text-gold-500">-SHOP</span>
            </span>
          </Link>
          <p className="text-white/40 text-sm mt-2">Buat akun baru</p>
        </div>

        <div className="glass rounded-3xl p-7 border border-white/5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Nama Lengkap</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  {...register('displayName')}
                  placeholder="Nama lengkap Anda"
                  className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
              {errors.displayName && <p className="text-red-400 text-xs mt-1">{errors.displayName.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="email@contoh.com"
                  className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">
                Nomor HP <span className="text-white/30">(opsional)</span>
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  {...register('phone')}
                  placeholder="08xxxxxxxxxx"
                  className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 karakter"
                  className="input-dark w-full pl-10 pr-10 py-3 rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Konfirmasi Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  {...register('confirmPassword')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-electric-gradient text-white font-semibold mt-2 shadow-glow-blue hover:shadow-glow-gold transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Daftar Sekarang <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-white/40 text-sm text-center mt-5">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-electric-400 hover:text-electric-300 font-medium">
              Masuk
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
