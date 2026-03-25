"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AccessDeniedCard } from "@/components/ui/access-denied-card";
import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { listSuppliers } from "@/lib/procurement-api";
import { getRoleFromSearchParams, rolePermissions, SearchParams, withRole } from "@/lib/roles";

interface SupplierRow {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export default function SuppliersPageClient() {
  const searchParams = useSearchParams();
  const role = getRoleFromSearchParams({ role: searchParams.get("role") } as SearchParams);
  const permissions = rolePermissions[role];

  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (!permissions.canManageSuppliers) {
      return;
    }

    const loadSuppliers = async () => {
      setIsLoading(true);
      setErrorText("");

      try {
        const response = await listSuppliers();
        setSuppliers(
          response.map((supplier) => ({
            id: supplier.id,
            fullName: supplier.full_name,
            email: supplier.email,
            createdAt: supplier.created_at,
          })),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Не удалось загрузить поставщиков.";
        setErrorText(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSuppliers();
  }, [permissions.canManageSuppliers]);

  const totalSuppliers = suppliers.length;
  const recentlyAdded = useMemo(() => suppliers.slice(0, 3).length, [suppliers]);

  if (!permissions.canManageSuppliers) {
    return <AccessDeniedCard role={role} description="У вашей роли нет доступа к разделу поставщиков." />;
  }

  return (
    <div className="space-y-6 pb-4">
      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)]">
        <h1 className="text-3xl font-semibold tracking-tight text-[#1F2937]">Поставщики</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Управляйте поставщиками и открывайте детальные карточки с данными из базы.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Всего поставщиков</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{totalSuppliers}</p>
        </Card>
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Недавно добавлены</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{recentlyAdded}</p>
        </Card>
      </section>

      {errorText ? <Card className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]">{errorText}</Card> : null}

      <Card className="rounded-3xl p-0">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1F2937]">Справочник поставщиков</h2>
        </div>
        <Table
          headers={["ID поставщика", "Название", "Email", "Создан", "Детали"]}
          rows={suppliers.map((supplier) => ({
            key: supplier.id,
            cells: [
              supplier.id,
              supplier.fullName,
              supplier.email,
              new Date(supplier.createdAt).toLocaleDateString("ru-RU"),
              <Link key={`${supplier.id}-link`} className="font-medium text-[#1F2937] hover:text-[#FF5A3C]" href={withRole(`/suppliers/${supplier.id}`, role)}>
                Открыть
              </Link>,
            ],
          }))}
        />
        {isLoading ? <p className="px-6 py-4 text-sm text-[#6B7280]">Загрузка...</p> : null}
      </Card>
    </div>
  );
}
