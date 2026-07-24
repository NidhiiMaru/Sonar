/** First focusable element on every page — jumps keyboard users to <main>. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-[100] rounded-[var(--radius-sm)] bg-glow px-4 py-2 text-sm font-semibold text-abyss focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
    >
      Skip to content
    </a>
  );
}
