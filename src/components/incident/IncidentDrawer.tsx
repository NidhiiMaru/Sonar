"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Anchor, MapPin, Clock, Radar, CheckCircle2, Printer, Send } from "lucide-react";
import type { Incident, Vessel, Zone } from "@/lib/types";
import { SOURCE_LABEL } from "@/lib/types";
import { INCIDENT_TYPE_META } from "@/lib/ui-meta";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { ConfidenceChip } from "@/components/ui/ConfidenceChip";
import { Button } from "@/components/ui/Button";
import { getImage } from "@/lib/images";
import { formatCoords, formatDateTime, haversineKm, timeAgo, cn } from "@/lib/utils";
import { useDispatchStore, effectiveStatus } from "@/lib/store/dispatch";
import { EvidencePrint } from "./EvidencePrint";

/** Shared incident drawer — used by /map and /alerts. Radix Dialog: focus-trap,
 *  Esc, restore focus all come free (that is why Radix is in the stack). */
export function IncidentDrawer({
  incident,
  zone,
  vessels,
  open,
  onOpenChange,
}: {
  incident: Incident | null;
  zone?: Zone;
  vessels: Vessel[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const overrides = useDispatchStore((s) => s.overrides);
  const dispatch = useDispatchStore((s) => s.dispatch);
  const resolve = useDispatchStore((s) => s.resolve);
  const [toast, setToast] = useState<string | null>(null);

  const override = incident ? overrides[incident.id] : undefined;
  const status = incident ? effectiveStatus(incident.status, override) : "new";

  const nearest = useMemo(() => {
    if (!incident) return null;
    const available = vessels.filter((v) => v.status === "available");
    const pool = available.length ? available : vessels;
    return pool
      .map((v) => ({ v, km: haversineKm(incident.coords, v.coords) }))
      .sort((a, b) => a.km - b.km)[0];
  }, [incident, vessels]);

  const assignedVessel = useMemo(() => {
    const id = override?.vesselId ?? incident?.assignedTo;
    return vessels.find((v) => v.id === id);
  }, [override, incident, vessels]);

  if (!incident) return null;
  const img = getImage(incident.imageKey);
  const type = INCIDENT_TYPE_META[incident.type];

  function handleDispatch() {
    if (!incident || !nearest) return;
    dispatch(incident.id, nearest.v.id);
    setToast(`${nearest.v.name} dispatched · ETA ~${Math.max(20, Math.round(nearest.km / 3))} min`);
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="no-print fixed inset-0 z-50 bg-abyss/70 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "no-print fixed z-50 flex flex-col gap-0 border-line bg-surface shadow-[0_24px_48px_-12px_rgb(0_0_0/0.7)]",
            "inset-x-0 bottom-0 max-h-[88vh] rounded-t-[var(--radius-lg)] border-t",
            "sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[440px] sm:max-w-[92vw] sm:max-h-none sm:rounded-none sm:border-l sm:border-t-0",
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-line p-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="tabular text-xs text-text-dim">{incident.id}</span>
                <SeverityBadge level={incident.severity} />
              </div>
              <Dialog.Title className="font-display text-lg font-semibold text-text">
                {type.label}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-line text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-abyss">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 100vw, 440px"
                className="object-cover"
              />
              <span className="absolute bottom-2 right-2 rounded-full bg-abyss/80 px-2 py-0.5 text-[10px] text-text-dim">
                {incident.ai.evidenceFrame}
              </span>
            </div>

            <div className="flex flex-col gap-4 p-4">
              {/* AI verdict */}
              <div className="rounded-[var(--radius-md)] border border-plum/30 bg-plum/5 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-plum">
                    AI verdict
                  </span>
                  <ConfidenceChip
                    value={incident.ai.confidence}
                    modelVersion={incident.ai.modelVersion}
                    evidenceFrame={incident.ai.evidenceFrame}
                  />
                </div>
                <p className="text-sm text-text">{incident.ai.rationale}</p>
                <p className="mt-2 text-xs text-text-dim">
                  model <span className="tabular text-plum">{incident.ai.modelVersion}</span> ·
                  inferred {timeAgo(incident.ai.inferredAt)}
                </p>
              </div>

              {/* meta grid */}
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Meta icon={<Clock size={14} />} label="Detected" value={formatDateTime(incident.detectedAt)} />
                <Meta icon={<Radar size={14} />} label="Source" value={SOURCE_LABEL[incident.source]} />
                <Meta icon={<MapPin size={14} />} label="Zone" value={zone ? `${zone.name}` : incident.zoneId} />
                <Meta icon={<MapPin size={14} />} label="Coordinates" value={formatCoords(incident.coords)} />
              </dl>

              {/* recommended action */}
              <div className="rounded-[var(--radius-md)] border border-line bg-surface-2 p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Recommended action
                </span>
                <p className="mt-1 text-sm text-text">{incident.recommendedAction}</p>
              </div>

              {/* status / assignment */}
              {status !== "new" && (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-[var(--radius-md)] border p-3 text-sm",
                    status === "resolved"
                      ? "border-bio/30 bg-bio/5 text-bio"
                      : "border-glow/30 bg-glow/5 text-glow",
                  )}
                >
                  {status === "resolved" ? <CheckCircle2 size={16} /> : <Anchor size={16} />}
                  <span className="text-text">
                    {status === "resolved" ? "Resolved" : "Assigned"}
                    {assignedVessel && status !== "resolved" && (
                      <>
                        {" "}
                        to <span className="font-medium">{assignedVessel.name}</span>
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* actions */}
          <div className="flex flex-col gap-2 border-t border-line p-4">
            {toast && (
              <div className="rounded-[var(--radius-sm)] border border-glow/40 bg-glow/10 px-3 py-2 text-xs text-glow">
                {toast}
              </div>
            )}
            <div className="flex gap-2">
              {status === "new" && (
                <Button variant="primary" className="flex-1" onClick={handleDispatch}>
                  <Send size={15} /> Dispatch {nearest ? nearest.v.name : "vessel"}
                </Button>
              )}
              {status === "assigned" && (
                <Button variant="secondary" className="flex-1" onClick={() => resolve(incident.id)}>
                  <CheckCircle2 size={15} /> Mark resolved
                </Button>
              )}
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer size={15} /> Evidence pack
              </Button>
            </div>
            {nearest && status === "new" && (
              <p className="text-center text-xs text-text-dim tabular">
                Nearest available: {nearest.v.name} · {nearest.km} km · {nearest.v.org}
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      <EvidencePrint incident={incident} zone={zone} vessel={assignedVessel} />
    </Dialog.Root>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="flex items-center gap-1 text-xs text-text-dim">
        {icon} {label}
      </dt>
      <dd className="tabular text-sm text-text">{value}</dd>
    </div>
  );
}
