"use client";

import * as RT from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

/** Thin Radix tooltip wrapper styled to the design system. */
export function Tooltip({
  children,
  content,
  side = "top",
  className,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}) {
  return (
    <RT.Root>
      <RT.Trigger asChild>{children}</RT.Trigger>
      <RT.Portal>
        <RT.Content
          side={side}
          sideOffset={6}
          className={cn(
            "z-50 max-w-[260px] rounded-[var(--radius-sm)] border border-line-bright bg-surface-3 px-3 py-2 text-xs text-text shadow-[0_12px_32px_-8px_rgb(0_0_0/0.7)]",
            className,
          )}
        >
          {content}
          <RT.Arrow className="fill-line-bright" />
        </RT.Content>
      </RT.Portal>
    </RT.Root>
  );
}
