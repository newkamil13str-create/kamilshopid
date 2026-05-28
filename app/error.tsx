'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <main className="min-h-screen animated-gradient flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="font-display text-3xl font-bold text-white mb-3">Terjadi Kesalahan</h1>
        <p className="text-white/40 mb-6 text-sm">{error.message || 'Terjadi kesalahan yang tidak terduga.'}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-2xl bg-electric-gradient text-white font-semibold text-sm"
          >
            Coba Lagi
          </button>
          <Link href="/" className="px-6 py-3 rounded-2xl glass border border-white/10 text-white font-semibold text-sm">
            Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
