export const PAYMENT_METHODS = [
  { id: 'qris', label: 'QRIS', icon: '🔲', category: 'qr' },
  { id: 'bca', label: 'BCA Virtual Account', icon: '🏦', category: 'bank' },
  { id: 'bni', label: 'BNI Virtual Account', icon: '🏦', category: 'bank' },
  { id: 'bri', label: 'BRI Virtual Account', icon: '🏦', category: 'bank' },
  { id: 'mandiri', label: 'Mandiri Virtual Account', icon: '🏦', category: 'bank' },
  { id: 'dana', label: 'DANA', icon: '💙', category: 'ewallet' },
  { id: 'ovo', label: 'OVO', icon: '💜', category: 'ewallet' },
  { id: 'gopay', label: 'GoPay', icon: '💚', category: 'ewallet' },
];

export interface PakasirResponse {
  status: string;
  message: string;
  payment?: {
    order_id: string;
    payment_number: string;
    amount: number;
    fee: number;
    total_payment: number;
    expired_at: string;
    method: string;
    status: string;
  };
}

export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${timestamp}-${random}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getTimeRemaining(expiredAt: string): {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const total = Math.max(0, new Date(expiredAt).getTime() - Date.now());
  const hours = Math.floor(total / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, total };
}
