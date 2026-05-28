import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Order, User, Category, SiteSettings } from '@/types';

// ─── Users ───────────────────────────────────────────────────────────────────
export async function createUser(uid: string, data: Partial<User>) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    role: data.role || 'user',
    totalOrders: 0,
    createdAt: serverTimestamp(),
  });
}

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null;
}

export async function updateUser(uid: string, data: Partial<User>) {
  await updateDoc(doc(db, 'users', uid), { ...data });
}

export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getProducts(filters?: {
  category?: string;
  isActive?: boolean;
  limitCount?: number;
}): Promise<Product[]> {
  const constraints: QueryConstraint[] = [];
  if (filters?.isActive !== undefined) constraints.push(where('isActive', '==', filters.isActive));
  if (filters?.category) constraints.push(where('category', '==', filters.category));
  constraints.push(orderBy('createdAt', 'desc'));
  if (filters?.limitCount) constraints.push(limit(filters.limitCount));
  const snap = await getDocs(query(collection(db, 'products'), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const snap = await getDocs(query(collection(db, 'products'), where('slug', '==', slug)));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Product;
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'products'), {
    ...data,
    createdAt: serverTimestamp(),
    totalSold: 0,
    rating: 5.0,
  });
  return ref.id;
}

export async function updateProduct(id: string, data: Partial<Product>) {
  await updateDoc(doc(db, 'products', id), { ...data });
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, 'products', id));
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  const snap = await getDocs(query(collection(db, 'categories'), orderBy('name')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function createCategory(data: Omit<Category, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'categories'), data);
  return ref.id;
}

export async function updateCategory(id: string, data: Partial<Category>) {
  await updateDoc(doc(db, 'categories', id), { ...data });
}

export async function deleteCategory(id: string) {
  await deleteDoc(doc(db, 'categories', id));
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function saveOrderToFirestore(order: Omit<Order, 'id'>) {
  await setDoc(doc(db, 'orders', order.orderId), {
    ...order,
    createdAt: serverTimestamp(),
  });
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, 'orders', orderId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null;
}

export async function getOrders(filters?: {
  status?: string;
  userId?: string;
  limitCount?: number;
}): Promise<Order[]> {
  const constraints: QueryConstraint[] = [];
  if (filters?.status && filters.status !== 'all') {
    constraints.push(where('status', '==', filters.status));
  }
  if (filters?.userId) constraints.push(where('userId', '==', filters.userId));
  constraints.push(orderBy('createdAt', 'desc'));
  if (filters?.limitCount) constraints.push(limit(filters.limitCount));
  const snap = await getDocs(query(collection(db, 'orders'), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

export async function updateOrder(orderId: string, data: Partial<Order>) {
  await updateDoc(doc(db, 'orders', orderId), { ...data });
}

export function subscribeToOrder(orderId: string, callback: (order: Order | null) => void) {
  return onSnapshot(doc(db, 'orders', orderId), (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null);
  });
}

export function subscribeToOrders(
  callback: (orders: Order[]) => void,
  filters?: { status?: string; limitCount?: number }
) {
  const constraints: QueryConstraint[] = [];
  if (filters?.status && filters.status !== 'all') {
    constraints.push(where('status', '==', filters.status));
  }
  constraints.push(orderBy('createdAt', 'desc'));
  if (filters?.limitCount) constraints.push(limit(filters.limitCount));
  return onSnapshot(query(collection(db, 'orders'), ...constraints), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
  });
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function getSettings(): Promise<SiteSettings | null> {
  const snap = await getDoc(doc(db, 'settings', 'site'));
  return snap.exists() ? (snap.data() as SiteSettings) : null;
}

export async function updateSettings(data: Partial<SiteSettings>) {
  await setDoc(doc(db, 'settings', 'site'), data, { merge: true });
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function getRevenueByDays(days: number): Promise<{ date: string; revenue: number }[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const snap = await getDocs(
    query(
      collection(db, 'orders'),
      where('status', 'in', ['paid', 'delivered']),
      where('createdAt', '>=', Timestamp.fromDate(since)),
      orderBy('createdAt', 'asc')
    )
  );
  const map = new Map<string, number>();
  snap.docs.forEach((d) => {
  const order = d.data() as Order;
  const raw = order.createdAt;
  let dateObj: Date;
  if (raw && typeof (raw as Timestamp).toDate === 'function') {
    dateObj = (raw as Timestamp).toDate();
  } else if (raw instanceof Date) {
    dateObj = raw;
  } else {
    return;
  }
  const date = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  map.set(date, (map.get(date) || 0) + (order.totalPayment || order.amount));
});
  return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
export async function seedInitialData() {
  const categoriesSnap = await getDocs(collection(db, 'categories'));
  if (!categoriesSnap.empty) return; // already seeded

  const batch = writeBatch(db);

  const categories = [
    { name: 'Bot WhatsApp', slug: 'bot-whatsapp', icon: '📱', color: '#25D366' },
    { name: 'Bot Telegram', slug: 'bot-telegram', icon: '✈️', color: '#0088CC' },
    { name: 'Akun Premium', slug: 'akun-premium', icon: '⭐', color: '#F59E0B' },
    { name: 'Tools & Script', slug: 'tools-script', icon: '🛠️', color: '#8B5CF6' },
    { name: 'Panel Hosting', slug: 'panel-hosting', icon: '🖥️', color: '#EF4444' },
  ];

  const catRefs: Record<string, string> = {};
  categories.forEach((cat) => {
    const ref = doc(collection(db, 'categories'));
    batch.set(ref, cat);
    catRefs[cat.slug] = ref.id;
  });

  await batch.commit();

  const products = [
    {
      name: 'Bot WhatsApp Multi-Device Pro',
      slug: 'bot-whatsapp-multi-device-pro',
      description: 'Bot WhatsApp profesional dengan dukungan multi-device terbaru. Fitur lengkap termasuk auto-reply, menu interaktif, dan integrasi database.',
      features: ['Multi-Device Support', 'Auto Reply Canggih', 'Menu Interaktif', 'Integrasi Database', 'Panel Admin Web', 'Update Lifetime'],
      price: 75000,
      originalPrice: 150000,
      category: 'bot-whatsapp',
      imageUrl: 'https://ui-avatars.com/api/?name=WA+Bot&background=25D366&color=fff&size=400',
      badge: 'bestseller',
      rating: 4.9,
      totalSold: 234,
      stock: ['KEY-WA-001|https://github.com/bot1', 'KEY-WA-002|https://github.com/bot2', 'KEY-WA-003|https://github.com/bot3'],
      isActive: true,
    },
    {
      name: 'Bot WhatsApp Blast & Auto-Reply',
      slug: 'bot-whatsapp-blast-auto-reply',
      description: 'Bot WhatsApp untuk keperluan marketing. Blast pesan ke ribuan kontak sekaligus dengan fitur auto-reply pintar dan statistik pengiriman.',
      features: ['Blast ke 10.000+ Kontak', 'Auto Reply AI', 'Statistik Real-time', 'Anti-Spam Protection', 'Template Pesan', 'Export Laporan'],
      price: 120000,
      originalPrice: 250000,
      category: 'bot-whatsapp',
      imageUrl: 'https://ui-avatars.com/api/?name=WA+Blast&background=128C7E&color=fff&size=400',
      badge: 'new',
      rating: 4.8,
      totalSold: 156,
      stock: ['KEY-BLAST-001|https://github.com/blast1', 'KEY-BLAST-002|https://github.com/blast2'],
      isActive: true,
    },
    {
      name: 'Bot Telegram Auto-Forward Premium',
      slug: 'bot-telegram-auto-forward-premium',
      description: 'Bot Telegram premium untuk auto-forward pesan dari berbagai channel dan grup. Support filter keyword, media forwarding, dan jadwal otomatis.',
      features: ['Auto Forward Multi-Channel', 'Filter Keyword', 'Media Forwarding', 'Jadwal Otomatis', 'Anti-Flood', 'Log Aktivitas'],
      price: 89000,
      originalPrice: 180000,
      category: 'bot-telegram',
      imageUrl: 'https://ui-avatars.com/api/?name=TG+Bot&background=0088CC&color=fff&size=400',
      badge: 'bestseller',
      rating: 4.7,
      totalSold: 189,
      stock: ['KEY-TG-001|TOKEN123', 'KEY-TG-002|TOKEN456', 'KEY-TG-003|TOKEN789'],
      isActive: true,
    },
    {
      name: 'Bot Telegram Grup Manager',
      slug: 'bot-telegram-grup-manager',
      description: 'Kelola grup Telegram Anda dengan bot canggih. Fitur anti-spam, welcome message, moderasi otomatis, dan banyak lagi.',
      features: ['Anti-Spam Otomatis', 'Welcome Message Custom', 'Moderasi Pintar', 'Statistik Member', 'Backup Chat', 'Multi Admin'],
      price: 65000,
      originalPrice: 130000,
      category: 'bot-telegram',
      imageUrl: 'https://ui-avatars.com/api/?name=TG+Group&background=0077B5&color=fff&size=400',
      badge: '',
      rating: 4.6,
      totalSold: 98,
      stock: ['KEY-TGG-001|TOKEN_GROUP1', 'KEY-TGG-002|TOKEN_GROUP2'],
      isActive: true,
    },
    {
      name: 'Netflix Premium 1 Bulan',
      slug: 'netflix-premium-1-bulan',
      description: 'Akun Netflix Premium plan terbaru. Nikmati streaming unlimited HD & 4K. Dijamin aktif 30 hari penuh dengan garansi ganti jika bermasalah.',
      features: ['Full HD & 4K Streaming', 'Download Offline', '4 Screen Sekaligus', 'Garansi 30 Hari', 'Ganti Jika Bermasalah', 'Support 24/7'],
      price: 45000,
      originalPrice: 85000,
      category: 'akun-premium',
      imageUrl: 'https://ui-avatars.com/api/?name=Netflix&background=E50914&color=fff&size=400',
      badge: 'bestseller',
      rating: 4.9,
      totalSold: 521,
      stock: ['nf_user1@mail.com:pass123', 'nf_user2@mail.com:pass456', 'nf_user3@mail.com:pass789'],
      isActive: true,
    },
    {
      name: 'Spotify Premium 3 Bulan',
      slug: 'spotify-premium-3-bulan',
      description: 'Nikmati musik tanpa iklan selama 3 bulan penuh. Download lagu, kualitas audio terbaik, dan akses jutaan lagu dari seluruh dunia.',
      features: ['Tanpa Iklan', 'Download Lagu', 'Audio Kualitas Tinggi', '3 Bulan Penuh', 'Semua Perangkat', 'Playlist Unlimited'],
      price: 55000,
      originalPrice: 99000,
      category: 'akun-premium',
      imageUrl: 'https://ui-avatars.com/api/?name=Spotify&background=1DB954&color=fff&size=400',
      badge: 'new',
      rating: 4.8,
      totalSold: 312,
      stock: ['sp_user1@mail.com:pass123', 'sp_user2@mail.com:pass456'],
      isActive: true,
    },
    {
      name: 'VPS Murah Panel Pterodactyl',
      slug: 'vps-murah-panel-pterodactyl',
      description: 'VPS dengan panel Pterodactyl siap pakai. Cocok untuk hosting game server, bot, dan aplikasi web. Spesifikasi tinggi dengan harga terjangkau.',
      features: ['Panel Pterodactyl', 'RAM 2GB DDR4', 'SSD 20GB NVMe', 'Bandwidth 1TB/bulan', 'IP Dedicated', 'Support Teknis'],
      price: 150000,
      originalPrice: 300000,
      category: 'panel-hosting',
      imageUrl: 'https://ui-avatars.com/api/?name=VPS&background=6366F1&color=fff&size=400',
      badge: '',
      rating: 4.7,
      totalSold: 67,
      stock: ['vps1.server.com:root:Pass@123', 'vps2.server.com:root:Pass@456'],
      isActive: true,
    },
    {
      name: 'Script Landing Page Premium',
      slug: 'script-landing-page-premium',
      description: 'Script landing page modern dengan desain premium. Mudah dikustomisasi, loading cepat, dan sudah dioptimalkan untuk konversi tinggi.',
      features: ['Desain Modern', 'Mobile Responsive', 'SEO Optimized', 'Loading Ultra-Cepat', 'Source Code Lengkap', 'Dokumentasi Lengkap'],
      price: 200000,
      originalPrice: 450000,
      category: 'tools-script',
      imageUrl: 'https://ui-avatars.com/api/?name=Script&background=F59E0B&color=fff&size=400',
      badge: 'new',
      rating: 4.9,
      totalSold: 43,
      stock: ['SCRIPT-LP-001|https://github.com/script1', 'SCRIPT-LP-002|https://github.com/script2'],
      isActive: true,
    },
  ];

  const prodBatch = writeBatch(db);
  products.forEach((product) => {
    const ref = doc(collection(db, 'products'));
    prodBatch.set(ref, {
      ...product,
      createdAt: serverTimestamp(),
    });
  });
  await prodBatch.commit();
}
