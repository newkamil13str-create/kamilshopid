'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { resetPassword } from '@/lib/auth';
import toast from 'react-hot-toast';

const schema = z.object({ email: z.string().email('Email tidak valid') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      setSent(true);
      toast.success('Email reset password dikirim!');
    } catch {
      toast.error('Email tidak ditemukan atau terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen animated-gradient flex items-center justify-center p-4">
      <div className="fixed top-1/3 left-1/3 w-64 h-64 bg-electric-600/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-electric-600 to-gold-500 flex items-center justify-center text-white font-display font-bold text-2xl shadow-glow-blue">
              K
            </div>
          </Link>
          <h1 className="font-display text-2xl font-bold text-white mt-4">Reset Password</h1>
          <p className="text-white/40 text-sm mt-1">
            Masukkan email Anda untuk menerima link reset password
          </p>
        </div>

        <div className="glass rounded-3xl p-7 border border-white/5">
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h2 className="text-white font-semibold text-lg mb-2">Email Terkirim!</h2>
              <p className="text-white/50 text-sm mb-6">
                Link reset password telah dikirim ke{' '}
                <span className="text-white/80 font-medium">{getValues('email')}</span>.
                Periksa inbox (dan folder spam) Anda.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-electric-gradient text-white font-semibold text-sm"
              >
                <ArrowLeft size={16} />
                Kembali ke Login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Alamat Email</label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-electric-gradient text-white font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Kirim Link Reset'
                )}
              </button>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                <ArrowLeft size={14} />
                Kembali ke Login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </main>
  );
}
