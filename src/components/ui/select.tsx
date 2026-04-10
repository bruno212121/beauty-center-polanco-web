"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Context ─── */

interface SelectCtxType {
  value: string;
  handleChange: (value: string, label: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  currentLabel: string;
  disabled: boolean;
}

const SelectCtx = createContext<SelectCtxType | null>(null);

function useSelectCtx() {
  const ctx = useContext(SelectCtx);
  if (!ctx) throw new Error("Select subcomponent used outside <Select>");
  return ctx;
}

/* ─── Select root ─── */

export function Select({
  children,
  value,
  onValueChange,
  defaultValue = "",
  disabled = false,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalLabel, setInternalLabel] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentValue = value !== undefined ? value : internalValue;

  // Reset label when controlled value is cleared from outside
  useEffect(() => {
    if (value === "") setInternalLabel("");
  }, [value]);

  const handleChange = useCallback(
    (v: string, label: string) => {
      if (value === undefined) setInternalValue(v);
      setInternalLabel(label);
      onValueChange?.(v);
      setOpen(false);
    },
    [value, onValueChange],
  );

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
    <SelectCtx.Provider
      value={{ value: currentValue, handleChange, open, setOpen, currentLabel: internalLabel, disabled }}
    >
      <div ref={containerRef} className="relative">
        {children}
      </div>
    </SelectCtx.Provider>
  );
}

/* ─── Trigger ─── */

export function SelectTrigger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { open, setOpen, disabled } = useSelectCtx();
  return (
    <button
      type="button"
      onClick={() => !disabled && setOpen(!open)}
      disabled={disabled}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-lg border border-border bg-card px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0",
          open && "rotate-180",
        )}
      />
    </button>
  );
}

/* ─── Value ─── */

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { currentLabel } = useSelectCtx();
  return (
    <span className={cn(currentLabel ? "text-foreground" : "text-muted-foreground")}>
      {currentLabel || placeholder}
    </span>
  );
}

/* ─── Content ─── */

export function SelectContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = useSelectCtx();
  if (!open) return null;
  return (
    <div
      className={cn(
        "absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-card shadow-md",
        className,
      )}
    >
      <div className="p-1">{children}</div>
    </div>
  );
}

/* ─── Item ─── */

export function SelectItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: currentValue, handleChange } = useSelectCtx();
  const isSelected = currentValue === value;
  const label = typeof children === "string" ? children : String(children);

  return (
    <div
      onClick={() => handleChange(value, label)}
      className={cn(
        "flex items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer transition-colors",
        isSelected
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground hover:bg-accent",
        className,
      )}
    >
      {children}
      {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
    </div>
  );
}
