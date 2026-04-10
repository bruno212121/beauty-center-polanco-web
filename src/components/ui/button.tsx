import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
}

export function Button({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-primary text-white hover:bg-primary-dark",
        variant === "outline" &&
          "border border-border bg-transparent text-foreground hover:bg-accent",
        variant === "ghost" && "text-foreground hover:bg-accent",
        size === "default" && "h-9 px-4",
        size === "sm" && "h-8 px-3 text-xs",
        size === "icon" && "h-9 w-9",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
