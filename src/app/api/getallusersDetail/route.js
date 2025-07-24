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

    const formatted = orders.map((order) => ({
      name: order.name,
      phone: order.phone,
      standee_type: order.standee_type,
      icons_selected: order.icons_selected,
      other_icons: order.other_icons || '',
      logo_url: order.logo_url || null,
      upi_qr_url: order.upi_qr_url || null,
      created_at: order.created_at,
    }));

    return new NextResponse(
      JSON.stringify({ success: true, data: formatted }),
      {
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[GET Users Error]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
