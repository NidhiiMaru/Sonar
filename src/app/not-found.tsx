import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      {/* Sonar ping motif — concentric sweep, no raw hex (currentColor). */}
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        aria-hidden="true"
        className="text-glow"
      >
        <circle cx="48" cy="48" r="6" fill="currentColor" />
        <circle cx="48" cy="48" r="18" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        <circle cx="48" cy="48" r="30" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
      </svg>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-glow">
        404 — off the charts
      </p>
      <h1 className="mt-3 font-display text-h1 font-bold text-text">
        No signal from this coordinate.
      </h1>
      <p className="mt-4 max-w-[48ch] text-text-muted">
        The sonar swept this depth and found nothing here — the page you are
        looking for has drifted, moved, or never existed.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <ButtonLink href="/" variant="primary">
          Return to surface
        </ButtonLink>
        <Link
          href="/dashboard"
          className="rounded-[var(--radius-sm)] text-sm font-medium text-text-muted underline decoration-line-bright underline-offset-4 transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow focus-visible:ring-offset-2 focus-visible:ring-offset-trench"
        >
          Go to the console
        </Link>
      </div>
    </div>
  );
}
