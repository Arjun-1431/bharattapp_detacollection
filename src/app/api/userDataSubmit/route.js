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
      console.error('[Validation Error]', {
        name,
        phone,
        standee_type,
        logo,
      });
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload logo to Cloudinary
    let logoUploadRes;
    try {
      const logoBuffer = Buffer.from(await logo.arrayBuffer());
      const logoBase64 = `data:${logo.type};base64,${logoBuffer.toString('base64')}`;

      logoUploadRes = await cloudinary.uploader.upload(logoBase64, {
        folder: 'standee_app',
      });

      console.log('[Logo Uploaded]', logoUploadRes.secure_url);
    } catch (err) {
      console.error('[Cloudinary Logo Upload Error]', err);
      throw new Error('Logo upload failed');
    }

    // Optional: Upload UPI QR
    let upiQRUrl = null;
    if (upiQR && upiQR.name) {
      try {
        const qrBuffer = Buffer.from(await upiQR.arrayBuffer());
        const qrBase64 = `data:${upiQR.type};base64,${qrBuffer.toString('base64')}`;

        const qrUploadRes = await cloudinary.uploader.upload(qrBase64, {
          folder: 'standee_app/upi_qr',
        });

        upiQRUrl = qrUploadRes.secure_url;
        console.log('[UPI QR Uploaded]', upiQRUrl);
      } catch (err) {
        console.error('[Cloudinary UPI QR Upload Error]', err);
        throw new Error('UPI QR upload failed');
      }
    }

    // Store in DB
    try {
      const client = await clientPromise;
      const db = client.db('bharattapp');
      const orders = db.collection('standee_orders');

      const result = await orders.insertOne({
        name,
        phone,
        standee_type,
        icons_selected,
        other_icons,
        logo_url: logoUploadRes.secure_url,
        upi_qr_url: upiQRUrl,
        created_at: new Date(),
      });

      console.log('[DB Insert Success]', result.insertedId);
    } catch (err) {
      console.error('[MongoDB Insert Error]', err);
      throw new Error('Database insert failed');
    }

    return NextResponse.json({ message: 'Order submitted successfully' });
  } catch (err) {
    console.error('[API Handler Error]', err.stack || err);
    return NextResponse.json(
      {
        message: 'Upload failed',
        error: err.message || 'Unexpected error',
      },
      { status: 500 }
    );
  }
}
