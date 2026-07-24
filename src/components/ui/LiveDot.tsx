import { cn } from "@/lib/utils";

/** The live indicator. The 2s opacity pulse is one of the only two things
 *  allowed to pulse in the whole product. */
export function LiveDot({ className, label }: { className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="relative flex h-2 w-2">
        <span className="animate-live-pulse absolute inline-flex h-full w-full rounded-full bg-glow" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-glow" />
      </span>
      {label && (
        <span className="text-xs font-medium uppercase tracking-wide text-glow">{label}</span>
      )}
    </span>
  );
}
