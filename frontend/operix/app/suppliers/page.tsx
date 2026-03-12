import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { suppliers } from "@/lib/mock-data";

const averagePerformance = Math.round(
  suppliers.reduce((sum, supplier) => sum + supplier.performance, 0) /
    suppliers.length,
);

const totalActiveOrders = suppliers.reduce(
  (sum, supplier) => sum + supplier.activeOrders,
  0,
);

export default function SuppliersPage() {
  return (
    <div className="space-y-6 pb-4">
      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)]">
        <h1 className="text-3xl font-semibold tracking-tight text-[#1F2937]">Suppliers</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Monitor supplier quality, category coverage, and active fulfillment volume.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Total Suppliers</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {suppliers.length}
          </p>
        </Card>
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Average Performance</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {averagePerformance}%
          </p>
        </Card>
        <Card className="rounded-3xl sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-[#6B7280]">Active Orders</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {totalActiveOrders}
          </p>
        </Card>
      </section>

      <Card className="rounded-3xl p-0">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1F2937]">Supplier directory</h2>
        </div>
        <Table
          headers={[
            "Supplier ID",
            "Name",
            "Category",
            "Contact",
            "Performance",
            "Active Orders",
          ]}
          rows={suppliers.map((supplier) => ({
            key: supplier.id,
            cells: [
              supplier.id,
              <span key={`${supplier.id}-name`} className="font-medium text-[#1F2937]">
                {supplier.name}
              </span>,
              supplier.category,
              supplier.contact,
              `${supplier.performance}%`,
              supplier.activeOrders,
            ],
          }))}
        />
      </Card>
    </div>
  );
}
