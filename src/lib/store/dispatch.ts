"use client";

import { create } from "zustand";
import type { IncidentStatus } from "@/lib/types";

/**
 * Client-only dispatch state. No backend: assigning a vessel
 * or resolving an incident updates this store optimistically and resets on
 * reload. This is disclosed honestly on /about — an honest fake beats a silent one.
 */

export interface Override {
  status: IncidentStatus;
  vesselId?: string;
  at: number;
}

interface DispatchState {
  overrides: Record<string, Override>;
  dispatch: (incidentId: string, vesselId: string) => void;
  resolve: (incidentId: string) => void;
  reopen: (incidentId: string) => void;
  reset: () => void;
}

export const useDispatchStore = create<DispatchState>((set) => ({
  overrides: {},
  dispatch: (incidentId, vesselId) =>
    set((s) => ({
      overrides: {
        ...s.overrides,
        [incidentId]: { status: "assigned", vesselId, at: Date.now() },
      },
    })),
  resolve: (incidentId) =>
    set((s) => ({
      overrides: {
        ...s.overrides,
        [incidentId]: { status: "resolved", vesselId: s.overrides[incidentId]?.vesselId, at: Date.now() },
      },
    })),
  reopen: (incidentId) =>
    set((s) => {
      const next = { ...s.overrides };
      delete next[incidentId];
      return { overrides: next };
    }),
  reset: () => set({ overrides: {} }),
}));

/** Merge a base incident status with any client override. */
export function effectiveStatus(base: IncidentStatus, override?: Override): IncidentStatus {
  return override?.status ?? base;
}
