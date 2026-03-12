import { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[#F3F4F6] text-[#374151]",
  success: "bg-[#ECFDF3] text-[#027A48]",
  warning: "bg-[#FFFAEB] text-[#B54708]",
  danger: "bg-[#FEF3F2] text-[#B42318]",
  info: "bg-[#EEF4FF] text-[#3538CD]",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
