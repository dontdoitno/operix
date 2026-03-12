import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { orders, purchaseRequests, suppliers } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/format";

const totalSpend = orders.reduce((sum, order) => sum + order.total, 0);
const pendingApprovals = purchaseRequests.filter(
  (request) => request.status === "Pending" || request.status === "In Review",
).length;

const dashboardStats = [
  {
    label: "Monthly Spend",
    value: formatCurrency(totalSpend),
    description: "Across confirmed and delivered orders",
  },
  {
    label: "Open Requests",
    value: String(purchaseRequests.length),
    description: "Purchase requests currently tracked",
  },
  {
    label: "Pending Approvals",
    value: String(pendingApprovals),
    description: "Requests waiting manager decision",
  },
  {
    label: "Active Suppliers",
    value: String(suppliers.length),
    description: "Suppliers fulfilling current demand",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-4">
      <section className="rounded-3xl bg-gradient-to-r from-[#111827] to-[#374151] p-8 text-white shadow-[0_20px_40px_rgba(31,41,55,0.25)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-white/80">Procurement overview</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Welcome back to Operix
            </h1>
            <p className="mt-3 text-sm text-white/75">
              Track requests, approvals, and supplier performance from one clean
              dashboard.
            </p>
          </div>
          <Link href="/requests">
            <Button className="bg-[#FF5A3C] text-white hover:bg-[#e84d31]" size="md">
              Create Request
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="rounded-3xl p-6">
            <p className="text-sm font-medium text-[#6B7280]">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-[#6B7280]">{stat.description}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="rounded-3xl p-0">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
            <h2 className="text-lg font-semibold text-[#1F2937]">Recent requests</h2>
            <Link className="text-sm font-medium text-[#FF5A3C]" href="/requests">
              View all
            </Link>
          </div>
          <Table
            headers={["Request", "Department", "Submitted", "Amount", "Status"]}
            rows={purchaseRequests.slice(0, 4).map((request) => ({
              key: request.id,
              cells: [
                <Link
                  key={`${request.id}-link`}
                  className="font-medium text-[#1F2937] hover:text-[#FF5A3C]"
                  href={`/requests/${request.id}`}
                >
                  {request.id}
                </Link>,
                request.department,
                formatDate(request.submittedAt),
                formatCurrency(request.amount),
                <StatusBadge key={`${request.id}-status`} status={request.status} />, 
              ],
            }))}
          />
        </Card>

        <Card className="rounded-3xl">
          <h2 className="text-lg font-semibold text-[#1F2937]">Supplier pulse</h2>
          <ul className="mt-4 space-y-4">
            {suppliers.slice(0, 3).map((supplier) => (
              <li
                key={supplier.id}
                className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4"
              >
                <p className="font-medium text-[#1F2937]">{supplier.name}</p>
                <p className="mt-1 text-sm text-[#6B7280]">{supplier.category}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Performance</span>
                  <span className="font-medium text-[#1F2937]">{supplier.performance}%</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
