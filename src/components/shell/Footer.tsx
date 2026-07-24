import Link from "next/link";
import { Logo } from "./Logo";
import { GithubMark } from "@/components/ui/GithubMark";
import { SITE, DATA_SOURCES } from "@/lib/site";
import { NAV_ITEMS } from "./nav-items";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-abyss">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-[40ch] text-sm text-text-muted">
            An operations console for deep-ocean health. Most entries show the ocean&apos;s
            data — this one ranks the ocean&apos;s decisions.
          </p>
          <a
            href={SITE.repo}
            className="inline-flex w-fit items-center gap-2 rounded-[var(--radius-sm)] text-sm text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
          >
            <GithubMark size={15} /> Source on GitHub
          </a>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">
            Explore
          </span>
          {NAV_ITEMS.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="w-fit text-sm text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">
            Data sources
          </span>
          <ul className="flex flex-col gap-1.5">
            {DATA_SOURCES.map((s) => (
              <li key={s.name} className="text-sm text-text-muted">
                <a
                  href={s.href}
                  className="font-medium text-text hover:text-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
                >
                  {s.name}
                </a>{" "}
                — {s.use}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-text-dim sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Imagery courtesy of NOAA (public domain) & Pexels. AI detection layer is{" "}
            <Link href="/about" className="text-text-muted underline hover:text-text">
              simulated from fixtures
            </Link>
            .
          </p>
          <p>
            MIT licence · Built by {SITE.team}.
          </p>
        </div>
      </div>
    </footer>
  );
}
