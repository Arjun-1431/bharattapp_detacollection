import Image from 'next/image';

async function getOrders() {
  const res = await fetch(`/api/getallusersDetail`, {
    cache: 'no-store', // force fresh fetch every time
  });

  const json = await res.json();
  if (!json.success) throw new Error('Failed to fetch orders');
  return json.data;
}

export default async function ViewOrdersServer() {
  const orders = await getOrders();
  const ITEMS_PER_PAGE = 20;

  return (
    <div className="p-6 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Standee Orders</h2>

      <table className="table-auto w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Standee Type</th>
            <th className="p-2 border">Icons</th>
            <th className="p-2 border">Other Icons</th>
            <th className="p-2 border">Logo</th>
            <th className="p-2 border">UPI QR</th>
            <th className="p-2 border">Created At</th>
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, ITEMS_PER_PAGE).map((order, index) => {
            const hasUPI = order.icons_selected?.includes('UPI');
            return (
              <tr key={index} className="text-center">
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">{order.name}</td>
                <td className="p-2 border">{order.phone}</td>
                <td className="p-2 border">{order.standee_type}</td>
                <td className="p-2 border">
                  {Array.isArray(order.icons_selected)
                    ? order.icons_selected.join(', ')
                    : '--'}
                </td>
                <td className="p-2 border">
                  {order.other_icons?.trim() ? order.other_icons : '--'}
                </td>
                <td className="p-2 border">
                  {order.logo_url ? (
                    <Image
                      src={order.logo_url}
                      alt="Logo"
                      width={48}
                      height={48}
                      className="mx-auto rounded"
                    />
                  ) : (
                    'No Logo'
                  )}
                </td>
                <td className="p-2 border">
                  {hasUPI && order.upi_qr_url ? (
                    <Image
                      src={order.upi_qr_url}
                      alt="UPI QR"
                      width={48}
                      height={48}
                      className="mx-auto"
                    />
                  ) : (
                    '--'
                  )}
                </td>
                <td className="p-2 border">
                  {order.created_at ? (
                    <>
                      <div><b>{new Date(order.created_at).toLocaleDateString()}</b></div>
                      <div>{new Date(order.created_at).toLocaleTimeString()}</div>
                    </>
                  ) : (
                    '--'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
