import Link from 'next/link';
import { Mail, MessageCircle, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-navy-100/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-600 to-gold-500 flex items-center justify-center text-white font-display font-bold text-lg">
                K
              </div>
              <span className="font-display font-bold text-xl text-white">
                KAMIL<span className="text-gold-500">-SHOP</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-5">
              Platform produk digital terbaik & terpercaya. Solusi digital untuk kebutuhan Anda.
            </p>
            <div className="flex gap-3">
              {[
                { icon: MessageCircle, href: 'https://wa.me/62', label: 'WhatsApp' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Mail, href: 'mailto:admin@kamilshop.my.id', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/40 hover:text-electric-400 hover:bg-electric-600/10 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Produk</h4>
            <ul className="space-y-2.5">
              {['Bot WhatsApp', 'Bot Telegram', 'Akun Premium', 'Tools & Script', 'Panel Hosting'].map((item) => (
                <li key={item}>
                  <Link href="/products" className="text-white/40 text-sm hover:text-white/70 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Bantuan</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Cara Pembelian', href: '#' },
                { label: 'Metode Pembayaran', href: '#' },
                { label: 'Cek Pesanan', href: '/order' },
                { label: 'Hubungi Kami', href: 'mailto:admin@kamilshop.my.id' },
                { label: 'FAQ', href: '#faq' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-white/40 text-sm hover:text-white/70 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Kontak</h4>
            <div className="space-y-3">
              <a
                href="mailto:admin@kamilshop.my.id"
                className="flex items-center gap-2 text-white/40 text-sm hover:text-white/70 transition-colors"
              >
                <Mail size={14} />
                admin@kamilshop.my.id
              </a>
              <p className="text-white/40 text-sm">
                Jam Operasional: <br />
                <span className="text-white/60">Senin–Jumat, 09.00–17.00 WIB</span>
              </p>
              <div className="glass-blue rounded-xl p-3">
                <p className="text-electric-400 text-xs font-medium">🔒 Pembayaran Aman</p>
                <p className="text-white/40 text-xs mt-1">Didukung Pakasir Payment Gateway</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} KAMIL-SHOP. All rights reserved.
          </p>
          <p className="text-white/20 text-xs">
            Solusi Digital Terpercaya #1 | kamilshop.my.id
          </p>
        </div>
      </div>
    </footer>
  );
}
