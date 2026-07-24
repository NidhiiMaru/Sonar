"use client";

import dynamic from "next/dynamic";
import type { ForecastPoint } from "@/lib/types";
import { ChartSkeleton } from "./ChartSkeleton";

const Impl = dynamic(() => import("./ForecastChart.impl"), {
  ssr: false,
  loading: () => <ChartSkeleton height={300} />,
});

export function ForecastChart({ points, height }: { points: ForecastPoint[]; height?: number }) {
  return <Impl points={points} height={height} />;
}
