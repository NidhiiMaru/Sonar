"use client";

import dynamic from "next/dynamic";
import type { TrendPoint } from "@/lib/derive";
import { ChartSkeleton } from "./ChartSkeleton";

// Recharts is heavy — keep it out of the initial bundle. ssr:false + a
// box-reserving skeleton (charts must never hurt LCP/CLS).
const Impl = dynamic(() => import("./TrendChart.impl"), {
  ssr: false,
  loading: () => <ChartSkeleton height={260} />,
});

export function TrendChart({ data, height }: { data: TrendPoint[]; height?: number }) {
  return <Impl data={data} height={height} />;
}
