import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const statusVariantMap: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  Pending: "warning",
  "In Review": "info",
  Approved: "success",
  Rejected: "danger",
  Draft: "default",
  Confirmed: "info",
  Delivered: "success",
  Delayed: "danger",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={statusVariantMap[status] ?? "default"}>{status}</Badge>;
}
