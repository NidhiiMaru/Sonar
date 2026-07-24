"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Globe as GlobeIcon } from "lucide-react";

// Three.js is heavy — this chunk is code-split and only requested once the
// section scrolls near the viewport, so it never affects the landing's initial
// load or LCP. ssr:false because three touches window/WebGL.
const ZoneGlobe = dynamic(() => import("./ZoneGlobe"), {
  ssr: false,
  loading: () => <GlobeFallback />,
});

function GlobeFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-text-dim">
        <GlobeIcon size={40} className="animate-pulse text-line-bright" aria-hidden="true" />
        <span className="text-xs">Rendering globe…</span>
      </div>
    </div>
  );
}

export function LazyGlobe() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative h-[380px] w-full overflow-hidden rounded-[var(--radius-lg)] border border-line bg-abyss sm:h-[460px]"
    >
      {inView ? <ZoneGlobe animate={!reduce} /> : <GlobeFallback />}
    </div>
  );
}
