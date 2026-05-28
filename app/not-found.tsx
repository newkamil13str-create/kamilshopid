import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen animated-gradient flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-4 animate-float">🔍</div>
        <h1 className="font-display text-6xl font-bold gradient-text mb-4">404</h1>
        <p className="text-white text-xl font-semibold mb-2">Halaman Tidak Ditemukan</p>
        <p className="text-white/40 mb-8">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-electric-gradient text-white font-semibold shadow-glow-blue hover:shadow-glow-gold transition-all hover:scale-105"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
