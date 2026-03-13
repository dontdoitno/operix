"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { MerchandiseItem } from "@/lib/mock-data";
import { UserRole, withRole } from "@/lib/roles";

interface MerchandisePageClientProps {
  role: UserRole;
  initialMerchandise: MerchandiseItem[];
  canManageMerchandise: boolean;
}

export function MerchandisePageClient({
  role,
  initialMerchandise,
  canManageMerchandise,
}: MerchandisePageClientProps) {
  const [items, setItems] = useState<MerchandiseItem[]>(initialMerchandise);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState(1);
  const [reservedQuantity, setReservedQuantity] = useState(0);
  const [price, setPrice] = useState(100);
  const [description, setDescription] = useState("");

  const totalAvailable = useMemo(
    () => items.reduce((sum, item) => sum + item.availableQuantity, 0),
    [items],
  );

  const openAddForm = () => {
    setIsAddOpen(true);
  };

  const handleAddProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextId = `MER-${5000 + items.length + 1}`;
    const supplierId = items[0]?.supplierId ?? "SUP-201";

    const newItem: MerchandiseItem = {
      id: nextId,
      supplierId,
      name,
      sku,
      category,
      availableQuantity,
      reservedQuantity,
      price,
      description,
      updatedAt: new Date().toISOString(),
    };

    setItems((prevState) => [newItem, ...prevState]);
    setNotice(`Товар ${name} добавлен в каталог. Таблица обновлена.`);
    setIsAddOpen(false);

    setName("");
    setSku("");
    setCategory("");
    setAvailableQuantity(1);
    setReservedQuantity(0);
    setPrice(100);
    setDescription("");
  };

  return (
    <div className="space-y-6 pb-4">
      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1F2937]">Товары</h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              Управляйте текущими позициями каталога и отслеживайте доступные и зарезервированные остатки.
            </p>
          </div>
          {canManageMerchandise ? (
            <Button onClick={openAddForm} size="md" variant="primary">
              Добавить товар
            </Button>
          ) : null}
        </div>
        {notice ? <p className="mt-3 text-xs font-medium text-[#166534]">{notice}</p> : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Позиций в каталоге</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{items.length}</p>
        </Card>
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Доступно единиц</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{totalAvailable}</p>
        </Card>
      </section>

      <Card className="rounded-3xl p-0">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1F2937]">Каталог поставщика</h2>
        </div>
        <Table
          headers={[
            "Название товара",
            "Доступное количество",
            "Забронированное количество",
            "Цена",
            "Действия",
          ]}
          rows={items.map((item) => ({
            key: item.id,
            cells: [
              <span key={`${item.id}-name`} className="font-medium text-[#1F2937]">
                {item.name}
              </span>,
              item.availableQuantity,
              item.reservedQuantity,
              formatCurrency(item.price),
              <div key={`${item.id}-actions`} className="flex flex-wrap gap-2">
                {canManageMerchandise ? (
                  <Button onClick={openAddForm} size="sm" variant="secondary">
                    Добавить товар
                  </Button>
                ) : null}
                <Link href={withRole(`/merchandise/${item.id}`, role)}>
                  <Button size="sm" variant="primary">
                    Подробнее
                  </Button>
                </Link>
              </div>,
            ],
          }))}
        />
      </Card>

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Добавить товар"
        footer={
          <>
            <Button onClick={() => setIsAddOpen(false)} variant="secondary">
              Отмена
            </Button>
            <Button form="add-product-form" type="submit">
              Добавить
            </Button>
          </>
        }
      >
        <form className="space-y-4" id="add-product-form" onSubmit={handleAddProduct}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="product-name">
              Название товара
            </label>
            <input
              className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="product-name"
              onChange={(event) => setName(event.target.value)}
              required
              type="text"
              value={name}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="product-sku">
                Артикул
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="product-sku"
                onChange={(event) => setSku(event.target.value)}
                required
                type="text"
                value={sku}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="product-category">
                Категория
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="product-category"
                onChange={(event) => setCategory(event.target.value)}
                required
                type="text"
                value={category}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="product-available">
                Доступно
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="product-available"
                min={1}
                onChange={(event) => setAvailableQuantity(Number(event.target.value) || 1)}
                required
                type="number"
                value={availableQuantity}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="product-reserved">
                Зарезервировано
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="product-reserved"
                min={0}
                onChange={(event) => setReservedQuantity(Number(event.target.value) || 0)}
                required
                type="number"
                value={reservedQuantity}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="product-price">
                Цена
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="product-price"
                min={1}
                onChange={(event) => setPrice(Number(event.target.value) || 1)}
                required
                type="number"
                value={price}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="product-description">
              Описание
            </label>
            <textarea
              className="min-h-20 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="product-description"
              onChange={(event) => setDescription(event.target.value)}
              required
              value={description}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
