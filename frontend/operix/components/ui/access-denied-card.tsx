import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserRole, roleLabels, withRole } from "@/lib/roles";

interface AccessDeniedCardProps {
  role: UserRole;
  title?: string;
  description: string;
}

export function AccessDeniedCard({
  role,
  title = "Доступ ограничен",
  description,
}: AccessDeniedCardProps) {
  return (
    <Card className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2]">
      <h1 className="text-2xl font-semibold tracking-tight text-[#991B1B]">{title}</h1>
      <p className="mt-2 text-sm text-[#7F1D1D]">{description}</p>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[#B91C1C]">
        Текущая роль: {roleLabels[role]}
      </p>
      <div className="mt-5">
        <Link href={withRole("/", role)}>
          <Button size="sm" variant="secondary">
            Вернуться на главную
          </Button>
        </Link>
      </div>
    </Card>
  );
}
