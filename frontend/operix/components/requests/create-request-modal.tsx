"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function CreateRequestModal() {
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="md" variant="primary">
        Новая заявка
      </Button>

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
              placeholder="Например: Ноутбуки для команды"
              required
              type="text"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="department">
                Отдел
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="department"
                placeholder="Инженерия"
                required
                type="text"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="amount">
                Сумма (USD)
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="amount"
                min={100}
                placeholder="5000"
                required
                type="number"
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
              placeholder="Опишите детали заявки для согласующих"
              required
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
