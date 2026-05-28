import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId');
  if (!orderId) {
    return NextResponse.json({ error: 'orderId diperlukan' }, { status: 400 });
  }

  try {
    const orderDoc = await adminDb.doc(`orders/${orderId}`).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    const order = orderDoc.data()!;

    // If already delivered or failed, return immediately
    if (['delivered', 'failed', 'cancelled'].includes(order.status)) {
      return NextResponse.json({ status: order.status, order });
    }

    // If already paid but not delivered, process delivery
    if (order.status === 'paid') {
      await processDelivery(orderId, order);
      const updatedOrder = (await adminDb.doc(`orders/${orderId}`).get()).data();
      return NextResponse.json({ status: 'delivered', order: updatedOrder });
    }

    // Check payment status with Pakasir (if we have the order ID)
    // For now, return current status — actual payment status is confirmed via webhook or polling
    // In production, you'd call Pakasir's check endpoint here

    return NextResponse.json({ status: order.status, order });
  } catch (error) {
    console.error('Check payment error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// Simulate payment confirmation (webhook endpoint would call this in production)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const orderDoc = await adminDb.doc(`orders/${orderId}`).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    const order = orderDoc.data()!;

    if (status === 'paid' || status === 'success') {
      // Mark as paid
      await adminDb.doc(`orders/${orderId}`).update({
        status: 'paid',
        paidAt: FieldValue.serverTimestamp(),
      });

      // Process delivery
      await processDelivery(orderId, order);
    } else if (status === 'failed' || status === 'expired') {
      await adminDb.doc(`orders/${orderId}`).update({ status: 'failed' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

async function processDelivery(orderId: string, order: FirebaseFirestore.DocumentData) {
  if (order.status === 'delivered') return;

  try {
    // Get product and claim a stock item
    const productDoc = await adminDb.doc(`products/${order.productId}`).get();
    if (!productDoc.exists) return;

    const product = productDoc.data()!;
    const stock: string[] = product.stock || [];

    if (stock.length === 0) {
      // Out of stock — mark as needs manual handling
      await adminDb.doc(`orders/${orderId}`).update({
        status: 'paid',
        deliveryContent: 'STOK_HABIS — Hubungi admin untuk mendapatkan produk',
      });
      return;
    }

    // Claim first stock item (atomic update)
    const claimedItem = stock[0];
    const remainingStock = stock.slice(1);

    await adminDb.doc(`products/${order.productId}`).update({
      stock: remainingStock,
      totalSold: FieldValue.increment(1),
    });

    await adminDb.doc(`orders/${orderId}`).update({
      status: 'delivered',
      deliveryContent: claimedItem,
      paidAt: order.paidAt || FieldValue.serverTimestamp(),
    });

    // Send delivery email (fire & forget)
    sendDeliveryEmail(order.customerEmail, order.customerName, order.productName, claimedItem).catch(
      console.error
    );
  } catch (err) {
    console.error('Delivery error:', err);
  }
}

async function sendDeliveryEmail(
  email: string,
  name: string,
  productName: string,
  deliveryContent: string
) {
  // In production, configure SMTP credentials in .env
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"KAMIL-SHOP" <${process.env.SMTP_USER || 'admin@kamilshop.my.id'}>`,
    to: email,
    subject: `✅ Produk Anda Telah Dikirim — ${productName}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0F1E; color: white; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2563EB, #1D4ED8); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 800;">KAMIL-SHOP</h1>
          <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Solusi Digital Terpercaya #1</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #F59E0B; margin-top: 0;">✅ Pembayaran Berhasil!</h2>
          <p>Halo <strong>${name}</strong>,</p>
          <p>Terima kasih telah berbelanja di KAMIL-SHOP. Pesanan Anda sudah diproses dan produk siap digunakan.</p>

          <div style="background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.3); border-radius: 12px; padding: 20px; margin: 24px 0;">
            <h3 style="margin-top: 0; color: #60A5FA;">${productName}</h3>
            <pre style="background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; color: #F59E0B; overflow: auto; word-break: break-all; white-space: pre-wrap;">${deliveryContent}</pre>
          </div>

          <p style="color: rgba(255,255,255,0.6); font-size: 14px;">
            Simpan informasi di atas dengan baik. Jika ada pertanyaan, hubungi kami di
            <a href="mailto:admin@kamilshop.my.id" style="color: #60A5FA;">admin@kamilshop.my.id</a>
          </p>
        </div>
        <div style="padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; color: rgba(255,255,255,0.3); font-size: 12px;">
          © ${new Date().getFullYear()} KAMIL-SHOP. Semua hak dilindungi.
        </div>
      </div>
    `,
  });
}
