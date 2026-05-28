# KAMIL-SHOP 🛒

> **Solusi Digital Terpercaya #1** — Full-stack e-commerce for digital products built with Next.js 14, Firebase, and Pakasir payment gateway.

---

## ✨ Features

- 🏪 **Public storefront** — hero, products, detail, checkout, payment, order tracker
- 🔐 **Auth** — Google OAuth, Email/Password, Phone OTP (Firebase)
- 💳 **Payments** — QRIS, VA Banks (BCA/BNI/BRI/Mandiri), E-Wallets (DANA/OVO/GoPay) via Pakasir
- ⚡ **Auto-delivery** — digital products sent instantly after payment confirmed
- 📧 **Email delivery** — Nodemailer sends product credentials to customer
- 🎛️ **Admin dashboard** — CRUD products, categories, orders, customers, analytics, settings
- 📊 **Real-time** — Firestore `onSnapshot` for live order updates
- 📱 **Responsive** — mobile-first, glassmorphism UI

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
# also install tailwindcss-animate which is used by config
npm install tailwindcss-animate
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → create project
2. Enable **Firestore**, **Authentication** (Google, Email/Password, Phone), **Storage**
3. Create a **Service Account** key (Project Settings → Service accounts → Generate new private key)
4. Copy all credentials to `.env.local`

### 3. Set up Pakasir

1. Register at [app.pakasir.com](https://app.pakasir.com)
2. Create a project → copy your **slug** and **API key**
3. Add to `.env.local`

### 4. Configure environment

```bash
cp .env.local .env.local  # already created — fill in your values
```

Fill in all values in `.env.local`:
- Firebase client keys (from Firebase Console → Project settings → Your apps)
- Firebase Admin keys (from Service Account JSON)
- Pakasir slug + API key
- SMTP credentials (Gmail App Password recommended)

### 5. Firebase Security Rules

In Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /categories/{id} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /orders/{orderId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow read: if true;  // allow order status page without auth
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /settings/{doc} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 6. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌱 Seed Data

On first login with `admin@kamilshop.my.id`, the system will:
1. Auto-set your role to `admin`
2. Seed 5 categories and 8 sample products to Firestore

---

## 📁 Project Structure

```
kamil-shop/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── products/
│   │   ├── page.tsx                # Product listing
│   │   └── [slug]/page.tsx         # Product detail
│   ├── checkout/page.tsx           # Checkout
│   ├── payment/[orderId]/page.tsx  # Payment page
│   ├── order/[orderId]/page.tsx    # Order status
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── admin/
│   │   ├── layout.tsx              # Admin shell
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── create-payment/route.ts
│       └── check-payment/route.ts
├── components/
│   ├── shared/     # Navbar, Footer, AuthProvider
│   └── public/     # ProductCard, StatsCounter
├── lib/
│   ├── firebase.ts
│   ├── firestore.ts
│   ├── auth.ts
│   ├── pakasir.ts
│   └── utils.ts
├── store/index.ts   # Zustand stores
├── types/index.ts
├── middleware.ts
└── .env.local       # Fill in your credentials
```

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router (TypeScript) |
| Styling | Tailwind CSS + Glassmorphism |
| Animation | Framer Motion |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| Payment | Pakasir API |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| QR Code | qrcode.react |
| Email | Nodemailer |

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Add all `.env.local` variables as Environment Variables in Vercel dashboard.

### Self-hosted

```bash
npm run build
npm start
```

---

## 📄 License

© 2024 KAMIL-SHOP. All rights reserved.
