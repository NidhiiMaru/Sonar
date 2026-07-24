"use client";

import { Sparkles, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { pct } from "@/lib/utils";
import { REVIEW_THRESHOLD } from "@/lib/ranking";
import { Tooltip } from "./Tooltip";

/**
 * The AI provenance chip. `plum` means "an AI said this" — reserved colour.
 * Renders 0.87 as "87% confidence"; below the review threshold it flips to a
 * warn "needs review" state. Tooltip carries model version + source frame.
 */
export function ConfidenceChip({
  value,
  modelVersion,
  evidenceFrame,
  className,
  compact = false,
}: {
  value: number;
  modelVersion?: string;
  evidenceFrame?: string;
  className?: string;
  compact?: boolean;
}) {
  const low = value < REVIEW_THRESHOLD;
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          <span className="font-medium text-text">
            {pct(value)} confidence{low ? " · needs human review" : ""}
          </span>
          {modelVersion && (
            <span className="text-text-muted">
              model <span className="tabular text-plum">{modelVersion}</span>
            </span>
          )}
          {evidenceFrame && <span className="text-text-dim">{evidenceFrame}</span>}
        </div>
      }
    >
      <span
        tabIndex={0}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium tabular",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow",
          low
            ? "border-warn/40 bg-warn/10 text-warn"
            : "border-plum/40 bg-plum/10 text-plum",
          className,
        )}
      >
        {low ? (
          <TriangleAlert size={11} aria-hidden="true" />
        ) : (
          <Sparkles size={11} aria-hidden="true" />
        )}
        <span>{pct(value)}</span>
        {!compact && <span className="text-text-muted">{low ? "review" : "confidence"}</span>}
      </span>
    </Tooltip>
  );
}
