import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const statusVariantMap: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  Ожидает: "warning",
  На_согласовании: "info",
  Одобрено: "success",
  Отклонено: "danger",
  Заказ_создан: "info",
  pending: "warning",
  approved: "success",
  rejected: "danger",
  order_created: "info",
  Черновик: "default",
  Подтвержден: "info",
  В_исполнении: "warning",
  Доставлен: "success",
  Получен: "success",
  created: "default",
  confirmed: "info",
  in_fulfillment: "warning",
  delivered: "success",
  received: "success",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={statusVariantMap[status] ?? "default"}>{status}</Badge>;
}
