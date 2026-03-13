"use client";

import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/format";
import { merchandise, suppliers } from "@/lib/mock-data";

interface CreateRequestModalProps {
  triggerLabel?: string;
  defaultSupplierId?: string;
  defaultProductId?: string;
}

export function CreateRequestModal({
  triggerLabel = "Новая заявка",
  defaultSupplierId,
  defaultProductId,
}: CreateRequestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [supplierId, setSupplierId] = useState(defaultSupplierId ?? suppliers[0]?.id ?? "");
  const [productId, setProductId] = useState(defaultProductId ?? "");
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [successText, setSuccessText] = useState("");

  const availableProducts = useMemo(
    () => merchandise.filter((item) => item.supplierId === supplierId),
    [supplierId],
  );

  const selectedProduct = availableProducts.find((item) => item.id === productId) ?? availableProducts[0];
  const effectiveProductId = selectedProduct?.id ?? "";
  const maxQuantity = selectedProduct?.availableQuantity ?? 1;
  const safeQuantity = Math.min(Math.max(quantity, 1), maxQuantity);
  const totalAmount = (selectedProduct?.price ?? 0) * safeQuantity;

  const resetForm = () => {
    setTitle("");
    setDepartment("");
    setSupplierId(defaultSupplierId ?? suppliers[0]?.id ?? "");
    setProductId(defaultProductId ?? "");
    setQuantity(1);
    setDescription("");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProduct) {
      return;
    }

    setSuccessText(
      `Заявка отправлена: ${title || "Без названия"} — ${selectedProduct.name}, ${safeQuantity} шт. на сумму ${formatCurrency(totalAmount)}.`,
    );
    setIsOpen(false);
    resetForm();
  };

  return (
    <>
      <div className="space-y-2">
        <Button onClick={() => setIsOpen(true)} size="md" variant="primary">
          {triggerLabel}
        </Button>
        {successText ? (
          <p className="text-xs font-medium text-[#166534]">{successText}</p>
        ) : null}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Создание заявки на закупку"
        footer={
          <>
            <Button onClick={() => setIsOpen(false)} variant="secondary">
              Отмена
            </Button>
            <Button form="create-request-form" type="submit">
              Отправить заявку
            </Button>
          </>
        }
      >
        <form className="space-y-4" id="create-request-form" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="title">
              Название заявки
            </label>
            <input
              className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Например: Закупка ноутбуков"
              required
              type="text"
              value={title}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="department">
              Отдел
            </label>
            <input
              className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="department"
              onChange={(event) => setDepartment(event.target.value)}
              placeholder="Инженерия"
              required
              type="text"
              value={department}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="supplier">
                Поставщик
              </label>
              <select
                className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="supplier"
                onChange={(event) => {
                  const nextSupplierId = event.target.value;
                  setSupplierId(nextSupplierId);
                  const firstProduct = merchandise.find((item) => item.supplierId === nextSupplierId);
                  setProductId(firstProduct?.id ?? "");
                  setQuantity(1);
                }}
                required
                value={supplierId}
              >
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="product">
                Доступный товар
              </label>
              <select
                className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="product"
                onChange={(event) => {
                  setProductId(event.target.value);
                  setQuantity(1);
                }}
                required
                value={effectiveProductId}
              >
                {availableProducts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — остаток {item.availableQuantity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="quantity">
                Количество
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="quantity"
                max={maxQuantity}
                min={1}
                onChange={(event) => setQuantity(Number(event.target.value) || 1)}
                required
                type="number"
                value={safeQuantity}
              />
              <p className="text-xs text-[#6B7280]">Доступно к заказу: {maxQuantity} шт.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="amount">
                Сумма (автоматически)
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm font-medium text-[#1F2937]"
                id="amount"
                readOnly
                type="text"
                value={formatCurrency(totalAmount)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="description">
              Описание
            </label>
            <textarea
              className="min-h-24 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="description"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Опишите детали заявки"
              required
              value={description}
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
