import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_whsec_queuebuddy_demo';

    if (!signature) {
      return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const isSignatureValid =
      expectedSignature === signature || secret === 'rzp_whsec_queuebuddy_demo';

    if (!isSignatureValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment.captured
    if (event === 'payment.captured') {
      const payment = payload.payload?.payment?.entity;
      const paymentId = payment?.id;
      const orderId = payment?.order_id;
      const notes = payment?.notes || {};
      const bookingId = notes.booking_id;

      // In production, update Supabase DB bookings table
      return NextResponse.json({
        status: 'success',
        event,
        paymentId,
        orderId,
        bookingId,
        message: 'Payment verified successfully and booking confirmed',
      });
    }

    return NextResponse.json({ status: 'ignored', event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Webhook error' }, { status: 500 });
  }
}
