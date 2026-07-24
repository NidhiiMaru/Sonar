"use client";

import {
  Area,
  ComposedChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ForecastPoint } from "@/lib/types";

const AXIS = "#6E86A3";
const GRID = "#22344F";

export default function ForecastChartImpl({
  points,
  height = 300,
}: {
  points: ForecastPoint[];
  height?: number;
}) {
  const data = points.map((p) => ({
    t: p.t.slice(5), // MM-DD
    risk: p.risk,
    band: [p.lower, p.upper] as [number, number],
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="riskLine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#FB7185" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="t"
          stroke={AXIS}
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          minTickGap={28}
        />
        <YAxis
          stroke={AXIS}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: "#1B2A45",
            border: "1px solid #2F4767",
            borderRadius: 8,
            fontSize: 12,
            color: "#EAF2FF",
          }}
          labelStyle={{ color: "#A8BCD6" }}
          formatter={(value, name) => {
            if (name === "band" && Array.isArray(value)) {
              return [`${value[0]}–${value[1]}`, "Confidence band"];
            }
            return [value as number, "Risk score"];
          }}
        />
        {/* Confidence-interval band (widens with horizon) */}
        <Area
          dataKey="band"
          stroke="none"
          fill="#22D3EE"
          fillOpacity={0.14}
          isAnimationActive={false}
          activeDot={false}
        />
        {/* Central risk estimate */}
        <Line
          dataKey="risk"
          stroke="#22D3EE"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, fill: "#22D3EE" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
