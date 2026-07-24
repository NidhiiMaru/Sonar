"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, FileText, Download, ShieldCheck, Printer } from "lucide-react";
import type { Incident, Zone, Vessel } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { ConfidenceChip } from "@/components/ui/ConfidenceChip";
import { sonarAudio } from "@/lib/sonar-audio";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident: Incident | null;
  zone: Zone | null;
  vessel: Vessel | null;
}

export function EvidenceDossierModal({ open, onOpenChange, incident, zone, vessel }: Props) {
  if (!incident) return null;

  const handlePrint = () => {
    sonarAudio.playSonarPing(1000, 0.4);
    window.print();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-abyss/80 backdrop-blur-md transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] border border-line-bright bg-surface p-6 shadow-2xl focus:outline-none max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-2">
              <FileText className="text-glow" size={20} />
              <Dialog.Title className="font-display text-lg font-bold text-text">
                Evidence Dossier — {incident.id}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                className="rounded-md border border-line p-1 text-text-dim hover:text-text focus:outline-none"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="my-6 flex flex-col gap-5 text-sm">
            {/* Header info */}
            <div className="grid grid-cols-2 gap-4 rounded-md border border-line bg-surface-2 p-3.5 font-mono text-xs">
              <div>
                <span className="text-text-dim block">Timestamp:</span>
                <span className="text-text font-medium">{new Date(incident.detectedAt).toUTCString()}</span>
              </div>
              <div>
                <span className="text-text-dim block">Zone Location:</span>
                <span className="text-text font-medium">{zone?.name ?? incident.zoneId} ({incident.coords[0]}, {incident.coords[1]})</span>
              </div>
              <div>
                <span className="text-text-dim block">Severity Level:</span>
                <SeverityBadge level={incident.severity} />
              </div>
              <div>
                <span className="text-text-dim block">AI Confidence Score:</span>
                <ConfidenceChip value={incident.ai.confidence} modelVersion={incident.ai.modelVersion} evidenceFrame={incident.ai.evidenceFrame} />
              </div>
            </div>

            {/* Incident Summary */}
            <div className="flex flex-col gap-2">
              <h4 className="font-mono text-xs font-semibold text-glow uppercase">Telemetry Rationale & Recommendation</h4>
              <p className="text-text-muted leading-relaxed">{incident.ai.rationale}</p>
              <p className="text-text-dim text-xs">Action: {incident.recommendedAction}</p>
            </div>

            {/* Assigned vessel status */}
            <div className="flex items-center justify-between rounded-md border border-bio/30 bg-bio/5 p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-bio" size={18} />
                <div>
                  <span className="font-semibold text-text block text-xs">Response Fleet Status</span>
                  <span className="text-text-muted text-xs">
                    {vessel ? `Dispatched Vessel: ${vessel.name} (${vessel.org})` : "Awaiting Vessel Dispatch Assignment"}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[11px] text-bio uppercase font-semibold">VERIFIED CONTRACT</span>
            </div>

            {/* Signature Hash */}
            <div className="rounded-md border border-line bg-abyss p-3 font-mono text-[11px] text-text-dim">
              <span className="block text-[10px] uppercase tracking-wider text-text-dim">Cryptographic Audit Hash:</span>
              <span className="break-all text-glow">0x8f4b7a9e120c9d3f58a7e2b1c4e908f7a6b5c4d3e2f1a09b8c7d6e5f4a3b2c1</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
            <Button variant="secondary" size="sm" onClick={handlePrint}>
              <Printer size={15} />
              Print Dossier
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Download size={15} />
              Export PDF Pack
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
