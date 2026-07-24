"use client";

import { useEffect, useRef } from "react";

export function SonarRadarSweep() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let angle = 0;
    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) / 2 - 4;

      ctx.clearRect(0, 0, w, h);

      // Outer radar ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(34, 211, 238, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Middle ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(34, 211, 238, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.strokeStyle = "rgba(34, 211, 238, 0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Sweep gradient sector
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle - 0.4, angle);
      ctx.closePath();
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, "rgba(34, 211, 238, 0.35)");
      grad.addColorStop(1, "rgba(34, 211, 238, 0.02)");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Sweep line
      const lx = cx + Math.cos(angle) * radius;
      const ly = cy + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(lx, ly);
      ctx.strokeStyle = "rgba(34, 211, 238, 0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();

      angle += 0.025;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-2 rounded-lg border border-line bg-surface/90 p-2 backdrop-blur-md shadow-xl">
      <canvas ref={canvasRef} width={64} height={64} className="h-16 w-16" />
      <div className="flex flex-col text-xs font-mono pr-2">
        <span className="font-semibold text-glow uppercase text-[10px]">Sonar Array</span>
        <span className="text-text-muted text-[11px]">ACTIVE SWEEP</span>
        <span className="text-text-dim text-[9px] tabular">360° R: 24 NM</span>
      </div>
    </div>
  );
}
