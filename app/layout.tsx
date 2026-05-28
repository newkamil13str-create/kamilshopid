import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/shared/AuthProvider';

export const metadata: Metadata = {
  title: {
    default: 'KAMIL-SHOP — Solusi Digital Terpercaya #1',
    template: '%s | KAMIL-SHOP',
  },
  description: 'Platform jual beli produk digital terbaik dan terpercaya di Indonesia. Bot WhatsApp, Bot Telegram, Akun Premium, Tools & Script.',
  keywords: ['digital', 'bot whatsapp', 'bot telegram', 'akun premium', 'tools', 'script', 'kamil shop'],
  authors: [{ name: 'KAMIL-SHOP', url: 'https://kamilshop.my.id' }],
  creator: 'KAMIL-SHOP',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://kamilshop.my.id'),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://kamilshop.my.id',
    siteName: 'KAMIL-SHOP',
    title: 'KAMIL-SHOP — Solusi Digital Terpercaya #1',
    description: 'Platform jual beli produk digital terbaik dan terpercaya di Indonesia.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'KAMIL-SHOP' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KAMIL-SHOP — Solusi Digital Terpercaya #1',
    description: 'Platform jual beli produk digital terbaik dan terpercaya di Indonesia.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#141929',
                color: '#fff',
                border: '1px solid rgba(37,99,235,0.3)',
                borderRadius: '12px',
                fontFamily: 'DM Sans, sans-serif',
              },
              success: {
                iconTheme: { primary: '#F59E0B', secondary: '#141929' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#141929' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
