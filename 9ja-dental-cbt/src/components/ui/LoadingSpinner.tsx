"use client";

import { cn } from "@/lib/utils";

type SpinnerSize = "sm" | "md" | "lg" | "xl";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string | null;
}

export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading…",
}: LoadingSpinnerProps) {
  const sizeStyles: Record<SpinnerSize, { container: string; border: string }> =
    {
      sm: { container: "h-4 w-4", border: "border-2" },
      md: { container: "h-6 w-6", border: "border-2" },
      lg: { container: "h-8 w-8", border: "border-[3px]" },
      xl: { container: "h-12 w-12", border: "border-4" },
    };

  const { container, border } = sizeStyles[size];

  type AccessibilityProps =
    | { "aria-hidden": "true" }
    | { role: "status"; "aria-label": string };

  const accessibilityProps: AccessibilityProps =
    label === null
      ? { "aria-hidden": "true" }
      : { role: "status", "aria-label": label };

  return (
    <span
      {...accessibilityProps}
      className={cn(
        "inline-flex items-center justify-center text-current",
        container,
        className
      )}
    >
      <span
        className={cn(
          "h-full w-full rounded-full border-solid border-transparent border-t-current animate-spin",
          border
        )}
      />
    </span>
  );
}
