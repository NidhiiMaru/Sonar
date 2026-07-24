"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Incident, Vessel, Zone } from "@/lib/types";
import { INCIDENT_TYPE_META, SEVERITY_META } from "@/lib/ui-meta";
import { SOURCE_LABEL } from "@/lib/types";
import { formatCoords, formatDateTime, pct } from "@/lib/utils";
import { getImage } from "@/lib/images";

/**
 * A clean, white, printable evidence pack. Hidden on screen; on window.print()
 * the page chrome (.print-hide) collapses and only this sheet renders.
 */
export function EvidencePrint({
  incident,
  zone,
  vessel,
}: {
  incident: Incident | null;
  zone?: Zone;
  vessel?: Vessel;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !incident) return null;

  const img = getImage(incident.imageKey);
  const type = INCIDENT_TYPE_META[incident.type];
  const sev = SEVERITY_META[incident.severity];

  return createPortal(
    <div className="print-only fixed inset-0 z-[999] bg-white p-10 text-black" role="document">
      <div style={{ maxWidth: 760, margin: "0 auto", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #111", paddingBottom: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Sonar — Evidence Pack</div>
            <div style={{ color: "#444" }}>{incident.id}</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: "#444" }}>
            Generated {formatDateTime(new Date().toISOString())}
            <br />
            Simulated detection layer
          </div>
        </div>

        <h1 style={{ fontSize: 24, margin: "16px 0 4px" }}>
          {type.label} — {sev.label} severity
        </h1>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.src}
          alt={img.alt}
          style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 6, margin: "12px 0" }}
        />

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <tbody>
            {[
              ["AI verdict", `${incident.ai.label} — ${pct(incident.ai.confidence)} confidence`],
              ["Model version", incident.ai.modelVersion],
              ["Rationale", incident.ai.rationale],
              ["Evidence frame", incident.ai.evidenceFrame],
              ["Detected at", formatDateTime(incident.detectedAt)],
              ["Source", SOURCE_LABEL[incident.source]],
              ["Zone", zone ? `${zone.name} (${zone.id})` : incident.zoneId],
              ["Coordinates", formatCoords(incident.coords)],
              ["Recommended action", incident.recommendedAction],
              ["Assigned vessel", vessel ? `${vessel.name} — ${vessel.org}` : "Unassigned"],
            ].map(([k, v]) => (
              <tr key={k} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px 12px 8px 0", fontWeight: 600, verticalAlign: "top", width: 170 }}>{k}</td>
                <td style={{ padding: "8px 0" }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ fontSize: 11, color: "#666", marginTop: 16 }}>
          This evidence pack is generated from Sonar&apos;s simulated detection
          layer for demonstration. Confidence and model version reflect the AI verdict at
          detection time. Imagery courtesy of NOAA (public domain) and Pexels.
        </p>
      </div>
    </div>,
    document.body,
  );
}
