import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  totalOrders: number;
  createdAt?: Timestamp | Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  price: number;
  originalPrice: number;
  category: string;
  imageUrl: string;
  badge: 'bestseller' | 'new' | '';
  rating: number;
  totalSold: number;
  stock: string[];
  isActive: boolean;
  createdAt?: Timestamp | Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export interface Order {
  id?: string;
  orderId: string;
  userId?: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  amount: number;
  fee: number;
  totalPayment: number;
  paymentMethod: string;
  paymentNumber: string;
  expiredAt: string;
  status: 'pending' | 'paid' | 'delivered' | 'failed' | 'cancelled';
  deliveryContent?: string;
  createdAt?: Timestamp | Date;
  paidAt?: Timestamp | Date;
}

export interface SiteSettings {
  siteName: string;
  pakasirSlug: string;
  pakasirApiKey: string;
  maintenanceMode: boolean;
  tagline?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutForm {
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  paymentMethod: string;
}

export interface PaymentData {
  order_id: string;
  payment_number: string;
  amount: number;
  fee: number;
  total_payment: number;
  expired_at: string;
  method: string;
  status: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalCustomers: number;
}
