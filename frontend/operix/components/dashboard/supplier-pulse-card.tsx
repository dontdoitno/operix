"use client";

import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/format";
import { MerchandiseItem, Supplier } from "@/lib/mock-data";
import { createPurchaseRequest } from "@/lib/procurement-api";

interface SupplierPulseCardProps {
  suppliers: Supplier[];
  merchandise: MerchandiseItem[];
  canCreateQuickRequest: boolean;
  onRequestCreated?: () => Promise<void> | void;
}

interface QuickOrderState {
  supplierName: string;
  productName: string;
  unitPrice: number;
  maxQuantity: number;
}

export function SupplierPulseCard({
  suppliers,
  merchandise,
  canCreateQuickRequest,
  onRequestCreated,
}: SupplierPulseCardProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [quickOrderState, setQuickOrderState] = useState<QuickOrderState | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSupplier = suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? null;

  const selectedSupplierProducts = useMemo(() => {
    if (!selectedSupplier) {
      return [];
    }

    return merchandise.filter((item) => item.supplierId === selectedSupplier.id);
  }, [selectedSupplier, merchandise]);

  const safeQuantity = quickOrderState
    ? Math.min(Math.max(quantity, 1), quickOrderState.maxQuantity)
    : 1;

  const handleQuickOrderOpen = (product: MerchandiseItem, supplierName: string) => {
    setErrorText("");
    setSuccessMessage("");
    setQuickOrderState({
      supplierName,
      productName: product.name,
      unitPrice: product.price,
      maxQuantity: product.availableQuantity,
    });
    setQuantity(1);
    setComment("");
  };

  const handleQuickOrderSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!quickOrderState || !canCreateQuickRequest) {
      return;
    }

    setErrorText("");
    setIsSubmitting(true);

    try {
      const amount = quickOrderState.unitPrice * safeQuantity;

      await createPurchaseRequest({
        title: `Быстрый заказ: ${quickOrderState.productName}`,
        description:
          comment.trim() ||
          `Автоматически создано из пульса поставщиков. Поставщик: ${quickOrderState.supplierName}. Количество: ${safeQuantity} шт.`,
        amount,
        currency: "USD",
      });

      setSuccessMessage(
        `Заявка создана и сохранена в базе: ${quickOrderState.productName}, ${safeQuantity} шт.`,
      );
      setQuickOrderState(null);
      setComment("");
      setQuantity(1);

      if (onRequestCreated) {
        await onRequestCreated();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось создать быстрый заказ.";
      setErrorText(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="rounded-3xl">
        <h2 className="text-lg font-semibold text-[#1F2937]">Пульс поставщиков</h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Нажмите на поставщика, чтобы открыть карточку компании
          {canCreateQuickRequest ? " и быстро оформить заявку по товару." : "."}
        </p>

        <ul className="mt-4 space-y-4">
          {suppliers.slice(0, 3).map((supplier) => (
            <li key={supplier.id} className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <button
                className="w-full text-left"
                onClick={() => setSelectedSupplierId(supplier.id)}
                type="button"
              >
                <p className="font-medium text-[#1F2937] transition-colors hover:text-[#FF5A3C]">
                  {supplier.name}
                </p>
                <p className="mt-1 text-sm text-[#6B7280]">{supplier.industry}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Эффективность</span>
                  <span className="font-medium text-[#1F2937]">{supplier.performance}%</span>
                </div>
              </button>
            </li>
          ))}
        </ul>

        {successMessage ? <p className="mt-4 text-xs font-medium text-[#166534]">{successMessage}</p> : null}
        {errorText ? <p className="mt-2 text-xs font-medium text-[#B91C1C]">{errorText}</p> : null}
      </Card>

      <Modal
        isOpen={selectedSupplier !== null}
        onClose={() => setSelectedSupplierId(null)}
        title="Карточка поставщика"
      >
        {selectedSupplier ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                <p className="text-xs uppercase tracking-wide text-[#6B7280]">Компания</p>
                <p className="mt-1 text-sm font-medium text-[#1F2937]">{selectedSupplier.name}</p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                <p className="text-xs uppercase tracking-wide text-[#6B7280]">Отрасль</p>
                <p className="mt-1 text-sm font-medium text-[#1F2937]">{selectedSupplier.industry}</p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-[#6B7280]">Эффективность</p>
                <p className="mt-1 text-sm font-medium text-[#1F2937]">{selectedSupplier.performance}%</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1F2937]">
                {canCreateQuickRequest ? "Доступные товары для заявки" : "Доступные товары"}
              </h3>
              <ul className="mt-3 space-y-2">
                {selectedSupplierProducts.map((product) => (
                  <li
                    key={product.id}
                    className="flex flex-col gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1F2937]">{product.name}</p>
                      <p className="text-xs text-[#6B7280]">
                        Остаток: {product.availableQuantity} шт. · {formatCurrency(product.price)}
                      </p>
                    </div>
                    {canCreateQuickRequest ? (
                      <Button
                        onClick={() => handleQuickOrderOpen(product, selectedSupplier.name)}
                        size="sm"
                        variant="primary"
                      >
                        Быстрая заявка
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={quickOrderState !== null}
        onClose={() => setQuickOrderState(null)}
        title="Карточка быстрого заказа"
        footer={
          <>
            <Button onClick={() => setQuickOrderState(null)} variant="secondary">
              Отмена
            </Button>
            <Button disabled={isSubmitting} form="quick-order-form" type="submit">
              {isSubmitting ? "Сохраняем..." : "Создать заявку"}
            </Button>
          </>
        }
      >
        {quickOrderState ? (
          <form className="space-y-4" id="quick-order-form" onSubmit={(event) => void handleQuickOrderSubmit(event)}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="quick-order-company">
                Компания
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm text-[#1F2937]"
                id="quick-order-company"
                readOnly
                type="text"
                value={quickOrderState.supplierName}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="quick-order-product">
                Товар
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm text-[#1F2937]"
                id="quick-order-product"
                readOnly
                type="text"
                value={quickOrderState.productName}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="quick-order-quantity">
                Количество
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="quick-order-quantity"
                max={quickOrderState.maxQuantity}
                min={1}
                onChange={(event) => setQuantity(Number(event.target.value) || 1)}
                required
                type="number"
                value={safeQuantity}
              />
              <p className="text-xs text-[#6B7280]">Максимально доступно: {quickOrderState.maxQuantity} шт.</p>
              <p className="text-xs text-[#6B7280]">
                Итоговая сумма: {formatCurrency(quickOrderState.unitPrice * safeQuantity)}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="quick-order-comment">
                Комментарий
              </label>
              <textarea
                className="min-h-20 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="quick-order-comment"
                onChange={(event) => setComment(event.target.value)}
                placeholder="Укажите детали поставки"
                value={comment}
              />
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
