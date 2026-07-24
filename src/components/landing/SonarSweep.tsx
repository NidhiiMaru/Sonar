/**
 * SonarSweep — the hero's signature. A live sonar dish: concentric range rings,
 * a crosshair, a conic wedge that rakes around, and detection "contacts" that
 * flare as the beam passes. On-brand for the product name, cheap to run (one
 * rotating element), and fully decorative (aria-hidden). Reduced-motion users
 * get the static dish with steady contacts — no rotation.
 *
 * Contacts are placed from a fixed seed so server and client render identically.
 */

type Contact = {
  /** polar angle in degrees (0 = up), radius as a fraction of the dish */
  angle: number;
  radius: number;
  /** severity tint */
  tone: "alert" | "warn" | "glow";
  /** ping delay so blips don't flash in unison */
  delay: number;
};

const CONTACTS: Contact[] = [
  { angle: 38, radius: 0.34, tone: "alert", delay: 0 },
  { angle: 122, radius: 0.62, tone: "warn", delay: 1.1 },
  { angle: 205, radius: 0.28, tone: "glow", delay: 2.0 },
  { angle: 268, radius: 0.7, tone: "warn", delay: 0.6 },
  { angle: 315, radius: 0.48, tone: "alert", delay: 3.2 },
  { angle: 168, radius: 0.82, tone: "glow", delay: 2.6 },
];

const TONE: Record<Contact["tone"], string> = {
  alert: "var(--color-alert)",
  warn: "var(--color-warn)",
  glow: "var(--color-glow)",
};

/** polar → cartesian, in percent, 0deg pointing up */
function pos(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    left: `${50 + Math.cos(rad) * radius * 50}%`,
    top: `${50 + Math.sin(rad) * radius * 50}%`,
  };
}

export function SonarSweep({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative aspect-square w-full ${className}`}
    >
      {/* Range rings */}
      {[1, 0.72, 0.44, 0.18].map((r) => (
        <div
          key={r}
          className="absolute rounded-full border border-glow/20"
          style={{
            inset: `${(1 - r) * 50}%`,
            boxShadow: r === 1 ? "0 0 60px -10px color-mix(in srgb, var(--color-glow) 40%, transparent) inset" : undefined,
          }}
        />
      ))}

      {/* Crosshair */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-glow/12" />
      <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-glow/12" />

      {/* Rotating sweep wedge */}
      <div
        className="animate-sonar-rotate absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 296deg, color-mix(in srgb, var(--color-glow) 8%, transparent) 326deg, color-mix(in srgb, var(--color-glow) 42%, transparent) 356deg, color-mix(in srgb, var(--color-glow) 60%, transparent) 360deg)",
          maskImage: "radial-gradient(circle, #000 99%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(circle, #000 99%, transparent 100%)",
        }}
      />

      {/* Detection contacts */}
      {CONTACTS.map((c, i) => {
        const p = pos(c.angle, c.radius);
        const color = TONE[c.tone];
        return (
          <div key={i} className="absolute" style={{ left: p.left, top: p.top }}>
            {/* expanding ping ring */}
            <span
              className="absolute rounded-full"
              style={{
                width: 26,
                height: 26,
                marginLeft: -13,
                marginTop: -13,
                border: `1px solid ${color}`,
                animation: `sonar-ping 5s var(--ease-descent) ${c.delay}s infinite`,
              }}
            />
            {/* steady contact dot */}
            <span
              className="absolute rounded-full"
              style={{
                width: 6,
                height: 6,
                marginLeft: -3,
                marginTop: -3,
                background: color,
                boxShadow: `0 0 10px 1px ${color}`,
                animation: `sonar-contact 2.4s ease-in-out ${c.delay}s infinite`,
              }}
            />
          </div>
        );
      })}

      {/* Center hub */}
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow shadow-[0_0_12px_2px_var(--color-glow)]" />
    </div>
  );
}
