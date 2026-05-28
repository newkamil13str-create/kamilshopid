# KAMIL-SHOP — Setup Guide

## Prerequisites
- Node.js 18+
- Firebase project (Blaze plan for Auth + Firestore + Storage)
- Pakasir account

---

## 1. Install Dependencies

```bash
npm install
```

> **Note:** If `tailwindcss-animate` is missing, add it:
> ```bash
> npm install tailwindcss-animate
> ```

---

## 2. Firebase Setup

### 2a. Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Sign-in methods: Google, Email/Password, Phone
4. Enable **Firestore Database** (production mode)
5. Enable **Storage**

### 2b. Firebase Security Rules (Firestore)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for products & categories
    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /categories/{id} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    // Users can only read/write their own data
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    // Orders: owner or admin
    match /orders/{orderId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    // Settings: admin only
    match /settings/{doc} {
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 2c. Get Service Account Key (for Firebase Admin SDK)
1. Project Settings → Service Accounts
2. Generate new private key → download JSON
3. Copy `client_email` and `private_key` to `.env.local`

---

## 3. Environment Variables

Copy `.env.example` to `.env.local` and fill all values:

```bash
cp .env.example .env.local
```

Key variables:
- `NEXT_PUBLIC_FIREBASE_*` — from Firebase project settings
- `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` — from service account JSON
- `PAKASIR_SLUG` + `PAKASIR_API_KEY` — from [app.pakasir.com](https://app.pakasir.com)
- `SMTP_*` — optional, for delivery emails (use Gmail App Password)

---

## 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 5. First Admin Login

1. Open the app and go to `/auth/login`
2. Log in with `admin@kamilshop.my.id` (or register first)
3. The system automatically sets `role: "admin"` in Firestore
4. Sample categories and products are seeded automatically
5. Go to `/admin/settings` to configure Pakasir credentials

---

## 6. Configure Pakasir

1. Log in to [app.pakasir.com](https://app.pakasir.com)
2. Get your **Project Slug** and **API Key**
3. Enter them in `/admin/settings` → Konfigurasi Pakasir
4. Or set them in `.env.local` as `PAKASIR_SLUG` and `PAKASIR_API_KEY`

---

## 7. Production Deployment (Vercel)

```bash
npm run build  # verify no TypeScript errors
```

Deploy to Vercel:
1. Push to GitHub
2. Import in Vercel
3. Add all `.env.local` variables as Environment Variables in Vercel
4. Set custom domain: `kamilshop.my.id`

---

## Project Structure

```
kamil-shop/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── products/                   # Products listing & detail
│   ├── checkout/                   # Checkout flow
│   ├── payment/[orderId]/          # Payment page with QR/VA
│   ├── order/[orderId]/            # Order status tracker
│   ├── auth/                       # Login, Register, ForgotPassword
│   ├── admin/                      # Admin dashboard (protected)
│   └── api/                        # API routes (create-payment, check-payment)
├── components/
│   ├── shared/                     # Navbar, Footer, AuthProvider
│   └── public/                     # ProductCard, StatsCounter
├── lib/
│   ├── firebase.ts                 # Firebase initialization
│   ├── firestore.ts                # Firestore helpers + seed data
│   ├── auth.ts                     # Auth helpers
│   ├── pakasir.ts                  # Payment utilities
│   └── utils.ts                    # General utilities
├── store/
│   └── index.ts                    # Zustand stores (auth, cart, checkout)
├── types/
│   └── index.ts                    # TypeScript types
└── middleware.ts                   # Route protection
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router (TypeScript) |
| Styling | Tailwind CSS + custom glassmorphism |
| Animation | Framer Motion |
| Database | Firebase Firestore (realtime) |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| Payment | Pakasir API |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| QR Code | qrcode.react |
| Email | Nodemailer (SMTP) |
| Icons | Lucide React |

---

## Features

- ✅ Full e-commerce flow (browse → checkout → pay → auto-deliver)
- ✅ 3 auth methods: Google, Email/Password, Phone OTP
- ✅ Pakasir payment: QRIS, Bank Transfer, E-Wallet
- ✅ Auto digital delivery after payment confirmed
- ✅ Real-time order tracking (Firestore onSnapshot)
- ✅ Admin dashboard with CRUD, analytics, settings
- ✅ Luxury dark glassmorphism UI
- ✅ Fully responsive (mobile-first)
- ✅ Role-based access control (admin/user)
- ✅ SEO optimized (metadata, sitemap, robots.txt)
- ✅ TypeScript throughout

---

© 2024 KAMIL-SHOP. Solusi Digital Terpercaya #1.
