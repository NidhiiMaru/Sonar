import { cn } from "@/lib/utils";

/** Sonar mark — concentric ping arcs + a contact blip. Inline SVG, currentColor. */
export function Logo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
        <path d="M16 4 a12 12 0 0 1 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-glow" />
        <path d="M16 9 a7 7 0 0 1 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-glow" />
        <circle cx="16" cy="16" r="2.5" className="fill-glow" />
      </svg>
      {withWordmark && (
        <span className="font-display text-[0.95rem] font-bold tracking-tight text-text">
          <span className="text-glow">Sonar</span>
        </span>
      )}
    </span>
  );
}
