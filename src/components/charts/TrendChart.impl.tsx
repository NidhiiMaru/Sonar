"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/derive";
import { INCIDENT_TYPE_META } from "@/lib/ui-meta";
import type { IncidentType } from "@/lib/types";
import { AXIS, GRID, TOOLTIP_BG, TYPE_COLOR } from "./chart-colors";

const ORDER: IncidentType[] = ["ghost_net", "dumping", "bleaching", "plastic", "species_alert"];

export default function TrendChartImpl({ data, height = 260 }: { data: TrendPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {ORDER.map((t) => (
            <linearGradient key={t} id={`g-${t}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={TYPE_COLOR[t]} stopOpacity={0.5} />
              <stop offset="100%" stopColor={TYPE_COLOR[t]} stopOpacity={0.04} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          stroke={AXIS}
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <Tooltip
          contentStyle={{
            background: TOOLTIP_BG,
            border: "1px solid #2F4767",
            borderRadius: 8,
            fontSize: 12,
            color: "#EAF2FF",
          }}
          labelStyle={{ color: "#A8BCD6" }}
          formatter={(value, name) => [value, INCIDENT_TYPE_META[name as IncidentType]?.short ?? name]}
        />
        <Legend
          iconType="circle"
          formatter={(value) => (
            <span style={{ color: "#A8BCD6", fontSize: 12 }}>
              {INCIDENT_TYPE_META[value as IncidentType]?.short ?? value}
            </span>
          )}
        />
        {ORDER.map((t) => (
          <Area
            key={t}
            type="monotone"
            dataKey={t}
            name={t}
            stackId="1"
            stroke={TYPE_COLOR[t]}
            strokeWidth={1.5}
            fill={`url(#g-${t})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
