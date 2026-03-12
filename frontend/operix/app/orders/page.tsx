import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { orders } from "@/lib/mock-data";

const deliveredOrders = orders.filter((order) => order.status === "Delivered").length;
const delayedOrders = orders.filter((order) => order.status === "Delayed").length;
const totalOrderValue = orders.reduce((sum, order) => sum + order.total, 0);

export default function OrdersPage() {
  return (
    <div className="space-y-6 pb-4">
      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)]">
        <h1 className="text-3xl font-semibold tracking-tight text-[#1F2937]">Orders</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Follow fulfillment progress, supplier commitments, and expected delivery dates.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Total Orders</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{orders.length}</p>
        </Card>
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Delivered</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {deliveredOrders}
          </p>
        </Card>
        <Card className="rounded-3xl sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-[#6B7280]">Delayed</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {delayedOrders}
          </p>
        </Card>
      </section>

      <Card className="rounded-3xl p-0">
        <div className="flex flex-col gap-1 border-b border-[#E5E7EB] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[#1F2937]">Order tracker</h2>
          <p className="text-sm text-[#6B7280]">Total value: {formatCurrency(totalOrderValue)}</p>
        </div>
        <Table
          headers={[
            "Order ID",
            "Supplier",
            "Request ID",
            "Expected Date",
            "Total",
            "Status",
          ]}
          rows={orders.map((order) => ({
            key: order.id,
            cells: [
              order.id,
              <span key={`${order.id}-supplier`} className="font-medium text-[#1F2937]">
                {order.supplier}
              </span>,
              order.requestId,
              formatDate(order.expectedDate),
              formatCurrency(order.total),
              <StatusBadge key={`${order.id}-status`} status={order.status} />,
            ],
          }))}
        />
      </Card>
    </div>
  );
}
