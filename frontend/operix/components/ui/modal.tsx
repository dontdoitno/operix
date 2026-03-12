"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_50px_rgba(31,41,55,0.20)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1F2937]">{title}</h2>
          <button
            aria-label="Close modal"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-[#F9FAFB]"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="text-sm text-[#6B7280]">{children}</div>

        {footer ? <div className={cn("mt-6 flex justify-end gap-3")}>{footer}</div> : null}
      </div>
    </div>
  );
}
