"use client";

import * as RT from "@radix-ui/react-tooltip";

/** One Radix Tooltip provider for the whole app. Without this, each tooltip
 *  instance spins up its own provider — dozens of them on the map/alerts tables,
 *  which is pure hydration cost (TBT). */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RT.Provider delayDuration={150} skipDelayDuration={300}>
      {children}
    </RT.Provider>
  );
}
