// src/app/api/getallusersDetail/route.js

import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/db';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('bharattapp');
    const orders = await db
      .collection('standee_orders')
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('GET API Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch data' }, { status: 500 });
  }
}
