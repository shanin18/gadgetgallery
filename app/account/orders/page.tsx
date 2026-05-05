const orders = [
  { number: "GG-DEMO-1001", date: "May 04, 2026", status: "Processing", total: "BDT 4,570" },
  { number: "GG-DEMO-1000", date: "Apr 28, 2026", status: "Delivered", total: "BDT 1,350" }
];

export default function OrdersPage() {
  return (
    <div className="rounded-lg border bg-card p-5">
      <h2 className="font-display text-2xl font-extrabold">Order history</h2>
      <div className="mt-5 overflow-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b text-muted-foreground">
            <tr><th className="py-3">Order</th><th>Date</th><th>Status</th><th>Total</th></tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.number} className="border-b last:border-0">
                <td className="py-4 font-bold">{order.number}</td>
                <td>{order.date}</td>
                <td><span className="rounded bg-muted px-2 py-1 font-semibold">{order.status}</span></td>
                <td>{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
