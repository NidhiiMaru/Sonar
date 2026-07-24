import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./Sparkline";

/**
 * A KPI: uppercase label + tabular mono value + signed delta + optional
 * sparkline. `deltaGood` says whether "up" is good (so colour matches meaning,
 * not just direction) — e.g. rising latency is bad, rising species monitored is good.
 */
export function KpiTile({
  label,
  value,
  unit,
  delta,
  deltaGood = "up",
  spark,
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaGood?: "up" | "down";
  spark?: number[];
  className?: string;
}) {
  const dir = delta === undefined ? 0 : delta > 0 ? 1 : delta < 0 ? -1 : 0;
  const isGood = dir === 0 ? null : (dir > 0) === (deltaGood === "up");
  const deltaColor = isGood === null ? "text-text-dim" : isGood ? "text-bio" : "text-alert";
  const DeltaIcon = dir > 0 ? ArrowUpRight : dir < 0 ? ArrowDownRight : Minus;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-[var(--radius-md)] border border-line bg-surface p-4",
        className,
      )}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className="tabular font-display text-kpi font-semibold leading-none text-text">
            {value}
          </span>
          {unit && <span className="text-sm text-text-dim">{unit}</span>}
        </div>
        {spark && (
          <span className={cn("text-glow", dir < 0 && "text-alert")}>
            <Sparkline data={spark} width={64} height={22} area />
          </span>
        )}
      </div>
      {delta !== undefined && (
        <div className={cn("flex items-center gap-1 text-xs font-medium tabular", deltaColor)}>
          <DeltaIcon size={13} aria-hidden="true" />
          <span>
            {delta > 0 ? "+" : ""}
            {delta}
            {typeof value === "string" && value.includes("%") ? "" : ""} vs last week
          </span>
        </div>
      )}
    </div>
  );
}
