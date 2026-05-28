import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | { toDate?: () => Date }): string {
  let d: Date;
  if (typeof date === 'string') d = new Date(date);
  else if (date && typeof (date as { toDate?: () => Date }).toDate === 'function')
    d = (date as { toDate: () => Date }).toDate();
  else d = date as Date;

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 3) + '...' : str;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    paid: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    delivered: 'text-green-400 bg-green-400/10 border-green-400/20',
    failed: 'text-red-400 bg-red-400/10 border-red-400/20',
    cancelled: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  };
  return map[status] || map.pending;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Menunggu Pembayaran',
    paid: 'Sudah Dibayar',
    delivered: 'Terkirim',
    failed: 'Gagal',
    cancelled: 'Dibatalkan',
  };
  return map[status] || status;
}

export function getRatingStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(empty);
}

export function downloadCSV(data: Record<string, unknown>[], filename: string) {
  const headers = Object.keys(data[0] || {});
  const rows = data.map((row) =>
    headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
