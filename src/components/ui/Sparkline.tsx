import { cn } from "@/lib/utils";

/** Inline SVG sparkline, no library. Inherits currentColor. 60x20 by default. */
export function Sparkline({
  data,
  width = 60,
  height = 20,
  className,
  strokeWidth = 1.5,
  area = false,
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  strokeWidth?: number;
  area?: boolean;
}) {
  if (!data || data.length < 2) {
    return <span className={cn("inline-block", className)} style={{ width, height }} aria-hidden="true" />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pad = strokeWidth;
  const y = (v: number) => pad + (1 - (v - min) / range) * (height - pad * 2);
  const pts = data.map((v, i) => [i * stepX, y(v)] as const);
  const line = pts.map(([x, yy], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${yy.toFixed(1)}`).join(" ");
  const fill = `${line} L${width} ${height} L0 ${height} Z`;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={cn("overflow-visible", className)}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {area && <path d={fill} fill="currentColor" opacity={0.12} />}
      <path
        d={line}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
