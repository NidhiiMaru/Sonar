import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

/** Every list / table / map that can be empty renders one of these. */
export function EmptyState({
  icon,
  title,
  hint,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[var(--radius-md)] border border-dashed border-line bg-surface/40 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="text-text-dim">{icon ?? <SearchX size={28} aria-hidden="true" />}</div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-text">{title}</p>
        {hint && <p className="max-w-[40ch] text-xs text-text-muted">{hint}</p>}
      </div>
      {action}
    </div>
  );
}
