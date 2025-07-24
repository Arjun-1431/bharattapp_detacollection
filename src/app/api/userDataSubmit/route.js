// src/app/api/userDataSubmit/route.js

import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/db'; // MongoDB connection
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(request) {
  try {
    // Parse FormData
    let formData;
    try {
      formData = await request.formData();
    } catch (err) {
      console.error('[FormData Error]', err);
      return NextResponse.json({ message: 'Invalid form data' }, { status: 400 });
    }

    const name = formData.get('name');
    const phone = formData.get('phone');
    const standee_type = formData.get('standee_type');
    const icons_selected = formData.getAll('icons_selected');
    const other_icons = formData.get('other_icons');
    const logo = formData.get('logo');
    const upiQR = formData.get('upi_qr');

    if (!name || !phone || !standee_type || !logo) {
      console.error('[Validation Error]', { name, phone, standee_type, logo });
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Save logo file
    let logoFileName = '';
    try {
      const logoBuffer = Buffer.from(await logo.arrayBuffer());
      logoFileName = `${randomUUID()}-${logo.name}`;
      const logoPath = path.join(process.cwd(), 'public/uploads', logoFileName);
      await writeFile(logoPath, logoBuffer);
    } catch (err) {
      console.error('[Logo Upload Error]', err);
      return NextResponse.json({ message: 'Error saving logo file' }, { status: 500 });
    }

    // Save optional UPI QR file
    let upiQRPath = null;
    if (upiQR && upiQR.name) {
      try {
        const upiQRBuffer = Buffer.from(await upiQR.arrayBuffer());
        const upiQRName = `${randomUUID()}-${upiQR.name}`;
        upiQRPath = `/uploads/${upiQRName}`;
        const fullUpiQRPath = path.join(process.cwd(), 'public/uploads', upiQRName);
        await writeFile(fullUpiQRPath, upiQRBuffer);
      } catch (err) {
        console.error('[UPI QR Upload Error]', err);
        return NextResponse.json({ message: 'Error saving UPI QR' }, { status: 500 });
      }
    }

    // Insert into MongoDB
    try {
      const client = await clientPromise;
      const db = client.db('bharattapp');
      const collection = db.collection('standee_orders');

      await collection.insertOne({
        name,
        phone,
        standee_type,
        icons_selected,
        other_icons,
        logo_file: `/uploads/${logoFileName}`,
        upi_qr_file: upiQRPath,
        created_at: new Date(),
      });
    } catch (err) {
      console.error('[Database Error]', err);
      return NextResponse.json({ message: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Order submitted successfully' });
  } catch (err) {
    console.error('[Unhandled Error]', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
