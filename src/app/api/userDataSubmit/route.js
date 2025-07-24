import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/db';
import cloudinary from '@/app/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const phone = formData.get('phone');
    const standee_type = formData.get('standee_type');
    const icons_selected = formData.get('icons_selected')?.split(',') || [];
    const other_icons = formData.get('other_icons');
    const logo = formData.get('logo');
    const upiQR = formData.get('upi_qr');

    if (!name || !phone || !standee_type || !logo) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Upload logo to Cloudinary
    const logoBuffer = Buffer.from(await logo.arrayBuffer());
    const logoBase64 = `data:${logo.type};base64,${logoBuffer.toString('base64')}`;

    const logoUploadRes = await cloudinary.uploader.upload(logoBase64, {
      folder: 'standee_app',
    });

    // Optional: Upload UPI QR
    let upiQRUrl = null;
    if (upiQR && upiQR.name) {
      const qrBuffer = Buffer.from(await upiQR.arrayBuffer());
      const qrBase64 = `data:${upiQR.type};base64,${qrBuffer.toString('base64')}`;

      const qrUploadRes = await cloudinary.uploader.upload(qrBase64, {
        folder: 'standee_app/upi_qr',
      });

      upiQRUrl = qrUploadRes.secure_url;
    }

    // Store in DB
    const client = await clientPromise;
    const db = client.db('bharattapp');
    const orders = db.collection('standee_orders');

    await orders.insertOne({
      name,
      phone,
      standee_type,
      icons_selected,
      other_icons,
      logo_url: logoUploadRes.secure_url,
      upi_qr_url: upiQRUrl,
      created_at: new Date(),
    });

    return NextResponse.json({ message: 'Order submitted successfully' });

  } catch (err) {
    console.error('[Upload Error]', err);
    return NextResponse.json({ message: 'Upload failed', error: err.message }, { status: 500 });
  }
}
