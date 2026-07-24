"use client";

import { useEffect, useState } from "react";
import { Activity, ShieldAlert, Radio, Waves, Cpu } from "lucide-react";

const TELEMETRY_FEED = [
  { icon: Radio, text: "ARGO-BUOY-4821: Water Temp 3.4°C · Salinity 35.1 PSU · Depth 1,200m" },
  { icon: ShieldAlert, text: "AUV-DEEP-3: Microplastic cluster detected @ Challenger Deep North" },
  { icon: Activity, text: "SONAR-ARRAY-9: Acoustic anomaly flagged in Mariana Trench Zone" },
  { icon: Waves, text: "COPERNICUS-S3: SST thermal surge anomaly +1.8°C in Coral Triangle" },
  { icon: Cpu, text: "AI-MODEL-v2.1: Verdict queue auto-sorted · 18 incidents high confidence" },
];

export function ConsoleTelemetryTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TELEMETRY_FEED.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = TELEMETRY_FEED[index];
  const Icon = current.icon;

  return (
    <div className="mb-4 flex items-center justify-between rounded-[var(--radius-sm)] border border-line bg-surface/80 px-3.5 py-2 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-glow/10 text-glow">
          <Icon size={13} className="animate-pulse" />
        </span>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono font-semibold uppercase text-glow">Live Feed</span>
          <span className="text-text-dim">|</span>
          <span className="font-mono text-text-muted transition-all duration-300">
            {current.text}
          </span>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-text-dim">
        <span className="h-1.5 w-1.5 rounded-full bg-bio animate-ping" />
        <span>STREAM ACTIVE</span>
      </div>
    </div>
  );
}
