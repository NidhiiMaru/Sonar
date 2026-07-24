import { cn } from "@/lib/utils";
import { SEVERITY_META, type SeverityShape } from "@/lib/ui-meta";
import type { Severity } from "@/lib/types";

/** A colour-blind-safe severity mark: colour + distinct SHAPE. Never colour alone. */
export function SeverityDot({
  shape,
  className,
  size = 12,
}: {
  shape: SeverityShape;
  className?: string;
  size?: number;
}) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      {shape === "circle" && <circle cx="6" cy="6" r="5" />}
      {shape === "square" && <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" />}
      {shape === "triangle" && <path d="M6 1 L11 10.5 L1 10.5 Z" />}
    </svg>
  );
}

export function SeverityBadge({
  level,
  className,
  showLabel = true,
}: {
  level: Severity;
  className?: string;
  showLabel?: boolean;
}) {
  const m = SEVERITY_META[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        m.soft,
        m.border,
        m.text,
        className,
      )}
    >
      <SeverityDot shape={m.shape} className={m.dot} size={10} />
      {showLabel && <span>{m.label}</span>}
      <span className="sr-only">severity</span>
    </span>
  );
}
