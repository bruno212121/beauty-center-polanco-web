"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  cloneElement,
  isValidElement,
} from "react";
import { cn } from "@/lib/utils";

/* ─── Context ─── */

interface DropdownCtxType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownCtx = createContext<DropdownCtxType | null>(null);

/* ─── Root ─── */

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <DropdownCtx.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block">
        {children}
      </div>
    </DropdownCtx.Provider>
  );
}

/* ─── Trigger ─── */

export function DropdownMenuTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const { open, setOpen } = useContext(DropdownCtx)!;

  if (asChild && isValidElement(children)) {
    return cloneElement(
      children as React.ReactElement<{ onClick?: React.MouseEventHandler }>,
      {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          const existing = (
            children as React.ReactElement<{ onClick?: React.MouseEventHandler }>
          ).props.onClick;
          existing?.(e);
          setOpen(!open);
        },
      },
    );
  }

  return (
    <button type="button" onClick={() => setOpen(!open)}>
      {children}
    </button>
  );
}

/* ─── Content ─── */

export function DropdownMenuContent({
  children,
  align = "start",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const { open } = useContext(DropdownCtx)!;
  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute top-full z-50 mt-1 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-card p-1 shadow-md",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ─── Item ─── */

export function DropdownMenuItem({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const { setOpen } = useContext(DropdownCtx)!;

  return (
    <div
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      className={cn(
        "flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ─── Separator ─── */

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-border", className)} />;
}
