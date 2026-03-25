"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { createPurchaseRequest } from "@/lib/procurement-api";

interface CreateRequestModalProps {
  triggerLabel?: string;
  onCreated?: () => Promise<void> | void;
}

export function CreateRequestModal({
  triggerLabel = "Новая заявка",
  onCreated,
}: CreateRequestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(100);
  const [description, setDescription] = useState("");
  const [successText, setSuccessText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setAmount(100);
    setDescription("");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorText("");
    setIsSubmitting(true);

    try {
      await createPurchaseRequest({
        title,
        description,
        amount,
        currency: "USD",
      });

      setSuccessText("Заявка отправлена и сохранена в базе данных.");
      setIsOpen(false);
      resetForm();

      if (onCreated) {
        await onCreated();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось создать заявку.";
      setErrorText(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Button onClick={() => setIsOpen(true)} size="md" variant="primary">
          {triggerLabel}
        </Button>
        {successText ? <p className="text-xs font-medium text-[#166534]">{successText}</p> : null}
        {errorText ? <p className="text-xs font-medium text-[#B91C1C]">{errorText}</p> : null}
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
              {isSubmitting ? "Сохраняем..." : "Отправить заявку"}
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
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="amount">
              Сумма
            </label>
            <input
              className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="amount"
              min={1}
              onChange={(event) => setAmount(Number(event.target.value) || 1)}
              required
              type="number"
              value={amount}
            />
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
