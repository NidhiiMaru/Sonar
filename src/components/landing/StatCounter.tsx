"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * A single "stakes" stat. Counts up from 0 to `value` once it scrolls into
 * view (IntersectionObserver). Under prefers-reduced-motion it shows the final
 * value immediately — no animation. The number is `tabular` so it never jitters.
 */
export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  label,
  caption,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  caption: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const node = ref.current;
    if (!node) return;

    let raf = 0;
    let started = false;

    const run = () => {
      const duration = 1400;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(Math.round(value * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            run();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, reduce]);

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <div className="flex items-baseline gap-0.5">
        <span className="tabular font-display text-display font-bold leading-none text-glow">
          {prefix}
          {display}
        </span>
        {suffix && (
          <span className="font-display text-h2 font-bold text-text">{suffix}</span>
        )}
      </div>
      <p className="text-text-muted">{label}</p>
      <p className="text-xs text-text-dim">{caption}</p>
    </div>
  );
}
