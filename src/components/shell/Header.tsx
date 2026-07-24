"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { LiveDot } from "@/components/ui/LiveDot";
import { CommandPalette } from "@/components/command/CommandPalette";
import { SoundToggle } from "./SoundToggle";
import { NAV_ITEMS } from "./nav-items";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-trench/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
        >
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex min-h-[40px] items-center rounded-[var(--radius-sm)] px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow",
                  active
                    ? "font-semibold text-text"
                    : "font-medium text-text-muted hover:text-text",
                )}
              >
                {item.label}
                {/* active marker: underline + glow, not colour alone */}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-glow shadow-[0_0_8px_0_var(--color-glow)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <CommandPalette />
          <SoundToggle />
          <Link
            href="/dashboard"
            className="hidden rounded-full border border-line-bright bg-surface-2 px-3 py-1 lg:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
          >
            <LiveDot label="Live" />
          </Link>

          {/* Mobile menu */}
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-line text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow md:hidden"
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-abyss/70 backdrop-blur-sm data-[state=open]:animate-[live-pulse_0s] md:hidden" />
              <Dialog.Content
                className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col gap-1 border-l border-line bg-surface p-4 shadow-[0_24px_48px_-12px_rgb(0_0_0/0.7)] md:hidden"
                aria-label="Menu"
              >
                <div className="mb-2 flex items-center justify-between">
                  <Dialog.Title asChild>
                    <span className="sr-only">Navigation</span>
                  </Dialog.Title>
                  <Logo withWordmark={false} />
                  <Dialog.Close asChild>
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-line text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
                      aria-label="Close menu"
                    >
                      <X size={18} />
                    </button>
                  </Dialog.Close>
                </div>
                {NAV_ITEMS.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-[var(--radius-sm)] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow",
                        active
                          ? "bg-surface-2 font-semibold text-text"
                          : "font-medium text-text-muted hover:bg-surface-2 hover:text-text",
                      )}
                    >
                      {item.label}
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-glow" />}
                    </Link>
                  );
                })}
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
