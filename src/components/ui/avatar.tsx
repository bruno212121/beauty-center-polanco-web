import { cn } from "@/lib/utils";

export function Avatar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AvatarFallback({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full text-sm select-none",
        className,
      )}
    >
      {children}
    </span>
  );
}
