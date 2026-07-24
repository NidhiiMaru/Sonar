"use client";

import { useEffect, useState } from "react";
import { Waves, Compass } from "lucide-react";

const DEPTH_ZONES = [
  { maxDepth: 200, name: "Sunlight Zone", code: "EPIPELAGIC", color: "text-glow" },
  { maxDepth: 1000, name: "Twilight Zone", code: "MESOPELAGIC", color: "text-bio" },
  { maxDepth: 4000, name: "Midnight Zone", code: "BATHYPELAGIC", color: "text-plum" },
  { maxDepth: 6000, name: "Abyssal Zone", code: "ABYSSOPELAGIC", color: "text-warn" },
  { maxDepth: 11000, name: "Hadal Trench", code: "CHALLENGER DEEP", color: "text-alert" },
];

export function BathymetricDepthMeter() {
  const [depth, setDepth] = useState(0);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const currentScroll = window.scrollY;
      const pct = Math.min(Math.max(currentScroll / totalScroll, 0), 1);
      setScrollPercent(pct);
      setDepth(Math.round(pct * 11000)); // 0 -> 11,000 m
      setVisible(currentScroll > 150);
    };

    // Throttle to one update per animation frame so it tracks scroll in
    // real time (60fps) instead of easing in only once scrolling stops.
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const activeZone = DEPTH_ZONES.find((z) => depth <= z.maxDepth) || DEPTH_ZONES[DEPTH_ZONES.length - 1];

  if (!visible) return null;

  return (
    <aside
      aria-label="Bathymetric depth indicator"
      className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-2 lg:flex"
    >
      <div className="flex items-center gap-2 rounded-md border border-line bg-surface/90 px-2.5 py-1.5 backdrop-blur-md shadow-lg transition-all">
        <Compass size={14} className="animate-spin text-glow [animation-duration:8s]" />
        <div className="flex flex-col text-right">
          <span className="font-mono text-[10px] font-semibold tracking-wider text-text-dim uppercase">
            {activeZone.code}
          </span>
          <span className="tabular font-mono text-xs font-bold text-text">
            {depth.toLocaleString()} m
          </span>
        </div>
      </div>

      {/* Depth bar indicator */}
      <div className="relative h-48 w-2 rounded-full border border-line bg-abyss/80 backdrop-blur-sm p-0.5 shadow-inner">
        <div
          className="w-full rounded-full bg-gradient-to-b from-glow via-bio to-alert"
          style={{ height: `${Math.max(scrollPercent * 100, 4)}%` }}
        />
        {/* Glowing cursor ring */}
        <div
          className="absolute -left-1.5 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-glow bg-trench/90 shadow-[0_0_10px_var(--color-glow)] flex items-center justify-center"
          style={{ top: `${scrollPercent * 100}%` }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-glow animate-ping" />
        </div>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-text-dim">
        <Waves size={12} className="text-glow" />
        <span className="font-mono">11,000m</span>
      </div>
    </aside>
  );
}
