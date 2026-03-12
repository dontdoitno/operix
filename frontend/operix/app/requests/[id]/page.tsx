import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { orders, purchaseRequests } from "@/lib/mock-data";

interface RequestDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const timelineByStatus: Record<string, Array<{ label: string; date: string }>> = {
  Pending: [
    { label: "Submitted", date: "2026-03-01" },
    { label: "Awaiting manager review", date: "2026-03-02" },
  ],
  "In Review": [
    { label: "Submitted", date: "2026-03-01" },
    { label: "Finance pre-check", date: "2026-03-02" },
    { label: "Manager approval in progress", date: "2026-03-03" },
  ],
  Approved: [
    { label: "Submitted", date: "2026-02-26" },
    { label: "Manager approved", date: "2026-02-27" },
    { label: "Procurement sourcing", date: "2026-02-28" },
  ],
  Rejected: [
    { label: "Submitted", date: "2026-02-20" },
    { label: "Review completed", date: "2026-02-21" },
    { label: "Rejected due to budget constraints", date: "2026-02-21" },
  ],
};

export default async function RequestDetailsPage({
  params,
}: RequestDetailsPageProps) {
  const { id } = await params;
  const request = purchaseRequests.find((item) => item.id === id);

  if (!request) {
    notFound();
  }

  const relatedOrder = orders.find((order) => order.requestId === request.id);
  const timeline = timelineByStatus[request.status] ?? [];

  return (
    <div className="space-y-6 pb-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Request details</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {request.title}
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">{request.id}</p>
        </div>
        <StatusBadge status={request.status} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="rounded-3xl">
          <h2 className="text-lg font-semibold text-[#1F2937]">Request summary</h2>
          <p className="mt-4 text-sm leading-6 text-[#4B5563]">{request.description}</p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Department</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">
                {request.department}
              </dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Requester</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">
                {request.requester}
              </dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Submitted</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">
                {formatDate(request.submittedAt)}
              </dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Amount</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">
                {formatCurrency(request.amount)}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="rounded-3xl">
          <h2 className="text-lg font-semibold text-[#1F2937]">Linked order</h2>
          {relatedOrder ? (
            <div className="mt-4 space-y-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <p className="text-sm text-[#6B7280]">Order ID</p>
              <p className="text-base font-semibold text-[#1F2937]">{relatedOrder.id}</p>
              <p className="text-sm text-[#6B7280]">Supplier</p>
              <p className="text-sm font-medium text-[#1F2937]">{relatedOrder.supplier}</p>
              <Link href="/orders">
                <Button size="sm" variant="secondary">
                  View orders
                </Button>
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#6B7280]">
              No order has been issued for this request yet.
            </p>
          )}
        </Card>
      </section>

      <Card className="rounded-3xl">
        <h2 className="text-lg font-semibold text-[#1F2937]">Approval timeline</h2>
        <ol className="mt-4 space-y-4">
          {timeline.map((event) => (
            <li key={`${event.label}-${event.date}`} className="flex gap-4">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#FF5A3C]" />
              <div>
                <p className="text-sm font-medium text-[#1F2937]">{event.label}</p>
                <p className="text-xs text-[#6B7280]">{formatDate(event.date)}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
