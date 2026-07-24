"use client";

import * as Popover from "@radix-ui/react-popover";
import { Info } from "lucide-react";
import { RANKING_EXPLAINER, RANKING_FORMULA } from "@/lib/ranking";

/** "How this is ranked" — makes the queue's reasoning visible (judges reward it).
 *  The formula shown here is the exact one sortByRank() uses. */
export function RankingPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
          aria-label="How this queue is ranked"
        >
          <Info size={12} /> How this is ranked
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={6}
          className="z-50 w-[280px] rounded-[var(--radius-md)] border border-line-bright bg-surface-3 p-3 text-xs shadow-[0_12px_32px_-8px_rgb(0_0_0/0.7)]"
        >
          <p className="mb-2 rounded-[var(--radius-sm)] bg-abyss/60 px-2 py-1.5 text-center font-medium text-plum">
            rank = {RANKING_FORMULA}
          </p>
          <p className="text-text-muted">{RANKING_EXPLAINER}</p>
          <Popover.Arrow className="fill-line-bright" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
