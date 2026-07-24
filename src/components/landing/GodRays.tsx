/**
 * GodRays — shafts of light descending through the water column. Three angled,
 * blurred gradient beams that shimmer slowly. Purely decorative (aria-hidden);
 * motion is killed under prefers-reduced-motion. No JS, no layout cost.
 */

const RAYS = [
  { left: "12%", width: "8vw", delay: "0s", tilt: "8deg", opacity: 0.5 },
  { left: "34%", width: "5vw", delay: "-3s", tilt: "12deg", opacity: 0.35 },
  { left: "68%", width: "10vw", delay: "-5s", tilt: "6deg", opacity: 0.45 },
] as const;

export function GodRays() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {RAYS.map((r, i) => (
        <div
          key={i}
          className="animate-god-rays absolute -top-1/4 h-[150%] origin-top blur-2xl"
          style={{
            left: r.left,
            width: r.width,
            transform: `rotate(${r.tilt})`,
            opacity: r.opacity,
            animationDelay: r.delay,
            background:
              "linear-gradient(to bottom, color-mix(in srgb, var(--color-glow) 22%, transparent), transparent 78%)",
          }}
        />
      ))}
    </div>
  );
}
