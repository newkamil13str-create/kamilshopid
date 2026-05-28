import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminDb = getFirestore();

// Rate limiting (simple in-memory — use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { method, amount, orderId, productId, customerData, productName, userId } = body;

    // Validate required fields
    if (!method || !amount || !orderId || !productId || !customerData) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Get Pakasir credentials — prefer Firestore settings, fallback to env
    let pakasirSlug = process.env.PAKASIR_SLUG || '';
    let pakasirApiKey = process.env.PAKASIR_API_KEY || '';

    try {
      const settingsDoc = await adminDb.doc('settings/site').get();
      if (settingsDoc.exists) {
        const settings = settingsDoc.data();
        if (settings?.pakasirSlug) pakasirSlug = settings.pakasirSlug;
        if (settings?.pakasirApiKey) pakasirApiKey = settings.pakasirApiKey;
      }
    } catch {
      // fallback to env
    }

    if (!pakasirSlug || !pakasirApiKey) {
      return NextResponse.json({ error: 'Konfigurasi pembayaran belum diatur' }, { status: 500 });
    }

    // Call Pakasir API
    const pakasirRes = await fetch(
      `https://app.pakasir.com/api/transactioncreate/${method}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: pakasirSlug,
          order_id: orderId,
          amount: Number(amount),
          api_key: pakasirApiKey,
        }),
      }
    );

    const pakasirData = await pakasirRes.json();

    if (!pakasirRes.ok || pakasirData.status !== 'success') {
      return NextResponse.json(
        { error: pakasirData.message || 'Gagal menghubungi payment gateway' },
        { status: 502 }
      );
    }

    const payment = pakasirData.payment || pakasirData.data || pakasirData;

    // Save order to Firestore
    await adminDb.doc(`orders/${orderId}`).set({
      orderId,
      userId: userId || null,
      productId,
      productName: productName || '',
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerWhatsApp: customerData.whatsApp,
      amount: Number(amount),
      fee: payment.fee || 0,
      totalPayment: payment.total_payment || Number(amount),
      paymentMethod: method,
      paymentNumber: payment.payment_number || '',
      expiredAt: payment.expired_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      deliveryContent: null,
      createdAt: FieldValue.serverTimestamp(),
      paidAt: null,
    });

    // Increment user's total orders if logged in
    if (userId) {
      try {
        await adminDb.doc(`users/${userId}`).update({
          totalOrders: FieldValue.increment(1),
        });
      } catch {
        // non-critical
      }
    }

    return NextResponse.json({ success: true, payment, orderId });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
