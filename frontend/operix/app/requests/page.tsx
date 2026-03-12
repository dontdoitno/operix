import Link from "next/link";

import { CreateRequestModal } from "@/components/requests/create-request-modal";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { purchaseRequests } from "@/lib/mock-data";

const totalRequested = purchaseRequests.reduce(
  (sum, request) => sum + request.amount,
  0,
);
const approvedCount = purchaseRequests.filter(
  (request) => request.status === "Approved",
).length;

export default function RequestsPage() {
  return (
    <div className="space-y-6 pb-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)] md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1F2937]">
            Purchase Requests
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Track all submissions, approval status, and requested procurement
            budget in one place.
          </p>
        </div>
        <CreateRequestModal />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Total Requests</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {purchaseRequests.length}
          </p>
        </Card>
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Requested Value</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {formatCurrency(totalRequested)}
          </p>
        </Card>
        <Card className="rounded-3xl sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-[#6B7280]">Approved Requests</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {approvedCount}
          </p>
        </Card>
      </section>

      <Card className="rounded-3xl p-0">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1F2937]">All requests</h2>
        </div>
        <Table
          headers={[
            "Request ID",
            "Title",
            "Department",
            "Requester",
            "Submitted",
            "Amount",
            "Status",
          ]}
          rows={purchaseRequests.map((request) => ({
            key: request.id,
            cells: [
              <Link
                key={`${request.id}-link`}
                className="font-medium text-[#1F2937] hover:text-[#FF5A3C]"
                href={`/requests/${request.id}`}
              >
                {request.id}
              </Link>,
              request.title,
              request.department,
              request.requester,
              formatDate(request.submittedAt),
              formatCurrency(request.amount),
              <StatusBadge key={`${request.id}-status`} status={request.status} />,
            ],
          }))}
        />
      </Card>
    </div>
  );
}
