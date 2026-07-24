/**
 * Marine-snow texture for the hero — a faint, static scatter of suspended specks.
 * Deliberately NOT animated: a continuously-moving particle field never lets the
 * frame settle and inflates Lighthouse Speed Index (the plan's rule: cut the
 * delight if it costs perf). Static keeps the deep-water texture at zero cost,
 * and needs no reduced-motion handling. Positions are derived from the index so
 * server and client render identically.
 */

const COUNT = 40;

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function MarineSnow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: COUNT }, (_, i) => {
        const left = rand(i + 1) * 100;
        const top = rand(i + 6) * 100;
        const size = 1 + rand(i + 2) * 3; // 1–4px
        const opacity = 0.12 + rand(i + 5) * 0.32; // 0.12–0.44
        return (
          <span
            key={i}
            className="absolute rounded-full bg-glow"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size}px`,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
}
