'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import {
  loginWithEmail,
  loginWithGoogle,
  sendOTP,
  verifyOTP,
  setupRecaptcha,
} from '@/lib/auth';
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import toast from 'react-hot-toast';

const emailSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const phoneSchema = z.object({
  phone: z.string().min(10, 'Nomor HP minimal 10 digit'),
  otp: z.string().optional(),
});

type EmailForm = z.infer<typeof emailSchema>;
type PhoneForm = z.infer<typeof phoneSchema>;
type Tab = 'google' | 'email' | 'phone';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [tab, setTab] = useState<Tab>('google');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);
  const [recaptcha, setRecaptcha] = useState<RecaptchaVerifier | null>(null);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Berhasil masuk dengan Google!');
      router.push(redirect);
    } catch {
      toast.error('Gagal masuk dengan Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (data: EmailForm) => {
    setLoading(true);
    try {
      await loginWithEmail(data.email, data.password);
      toast.success('Berhasil masuk!');
      router.push(redirect);
    } catch {
      toast.error('Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (data: PhoneForm) => {
    setLoading(true);
    try {
      let rv = recaptcha;
      if (!rv) {
        rv = setupRecaptcha('recaptcha-container');
        setRecaptcha(rv);
      }
      const phone = data.phone.startsWith('+') ? data.phone : `+62${data.phone.replace(/^0/, '')}`;
      const result = await sendOTP(phone, rv);
      setConfirmResult(result);
      setOtpSent(true);
      toast.success('Kode OTP dikirim!');
    } catch {
      toast.error('Gagal mengirim OTP. Periksa nomor HP Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (data: PhoneForm) => {
    if (!confirmResult || !data.otp) return;
    setLoading(true);
    try {
      await verifyOTP(confirmResult, data.otp);
      toast.success('Berhasil masuk!');
      router.push(redirect);
    } catch {
      toast.error('Kode OTP salah atau kadaluarsa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen animated-gradient flex items-center justify-center p-4">
      {/* Glow blobs */}
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
          <p className="text-white/40 text-sm mt-2">Masuk ke akun Anda</p>
        </div>

        <div className="glass rounded-3xl p-7 border border-white/5">
          {/* Tabs */}
          <div className="flex gap-1 bg-navy-100 rounded-xl p-1 mb-6">
            {(['google', 'email', 'phone'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                  tab === t
                    ? 'bg-electric-gradient text-white shadow-glow-sm'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                {t === 'google' ? '🔵 Google' : t === 'email' ? '📧 Email' : '📱 HP'}
              </button>
            ))}
          </div>

          {/* Google */}
          {tab === 'google' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-white/50 text-sm text-center mb-6 leading-relaxed">
                Masuk dengan akun Google Anda dengan mudah dan aman
              </p>
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl glass border border-white/10 text-white font-medium hover:bg-white/5 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Masuk dengan Google
              </button>
            </motion.div>
          )}

          {/* Email */}
          {tab === 'email' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={emailForm.handleSubmit(handleEmail)}
              className="space-y-4"
            >
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    {...emailForm.register('email')}
                    type="email"
                    placeholder="email@contoh.com"
                    className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{emailForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1.5 flex justify-between">
                  <span>Password</span>
                  <Link href="/auth/forgot-password" className="text-electric-400 text-xs hover:underline">
                    Lupa password?
                  </Link>
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    {...emailForm.register('password')}
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
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
                {emailForm.formState.errors.password && (
                  <p className="text-red-400 text-xs mt-1">{emailForm.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-electric-gradient text-white font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Masuk <ArrowRight size={16} /></>
                )}
              </button>
            </motion.form>
          )}

          {/* Phone */}
          {tab === 'phone' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={phoneForm.handleSubmit(otpSent ? handleVerifyOTP : handleSendOTP)}
              className="space-y-4"
            >
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Nomor HP</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    {...phoneForm.register('phone')}
                    placeholder="08xxxxxxxxxx"
                    disabled={otpSent}
                    className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm disabled:opacity-50"
                  />
                </div>
                {phoneForm.formState.errors.phone && (
                  <p className="text-red-400 text-xs mt-1">{phoneForm.formState.errors.phone.message}</p>
                )}
              </div>

              {otpSent && (
                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">Kode OTP</label>
                  <input
                    {...phoneForm.register('otp')}
                    placeholder="Masukkan 6 digit kode OTP"
                    maxLength={6}
                    className="input-dark w-full px-4 py-3 rounded-xl text-sm text-center tracking-widest font-mono text-lg"
                  />
                  <p className="text-white/30 text-xs mt-1 text-center">
                    Kode dikirim via SMS ke {phoneForm.getValues('phone')}
                  </p>
                </div>
              )}

              <div id="recaptcha-container" />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-electric-gradient text-white font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : otpSent ? (
                  <>Verifikasi OTP <ArrowRight size={16} /></>
                ) : (
                  <>Kirim OTP <ArrowRight size={16} /></>
                )}
              </button>

              {otpSent && (
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setConfirmResult(null); }}
                  className="w-full text-white/40 text-sm hover:text-white/60 transition-colors"
                >
                  Ganti nomor HP
                </button>
              )}
            </motion.form>
          )}

          {/* Register link */}
          <p className="text-white/40 text-sm text-center mt-6">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="text-electric-400 hover:text-electric-300 font-medium">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
