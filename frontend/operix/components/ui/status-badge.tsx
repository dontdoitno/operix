import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const statusVariantMap: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  "Ожидает": "warning",
  "На согласовании": "info",
  "Одобрено": "success",
  "Отклонено": "danger",
  "Черновик": "default",
  "Подтвержден": "info",
  "Доставлен": "success",
  "Задержан": "danger",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={statusVariantMap[status] ?? "default"}>{status}</Badge>;
}
