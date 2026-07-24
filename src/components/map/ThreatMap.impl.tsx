"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Polygon, Polyline, TileLayer, useMap, Marker } from "react-leaflet";
import type { Incident, Zone } from "@/lib/types";
import { SEVERITY_META } from "@/lib/ui-meta";

const SEV_HEX: Record<string, string> = { low: "#34D399", medium: "#FBBF24", high: "#FB7185" };

function shapeSvg(shape: string, color: string, selected: boolean) {
  const s = selected ? 20 : 14;
  const ring = selected
    ? `<circle cx="12" cy="12" r="11" fill="none" stroke="${color}" stroke-opacity="0.5" stroke-width="2"/>`
    : "";
  let mark = "";
  if (shape === "circle") mark = `<circle cx="12" cy="12" r="6" fill="${color}" stroke="#04070E" stroke-width="1.5"/>`;
  if (shape === "square") mark = `<rect x="6" y="6" width="12" height="12" rx="2" fill="${color}" stroke="#04070E" stroke-width="1.5"/>`;
  if (shape === "triangle") mark = `<path d="M12 5 L19 18 L5 18 Z" fill="${color}" stroke="#04070E" stroke-width="1.5"/>`;
  return `<svg width="${s * 1.7}" height="${s * 1.7}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${ring}${mark}</svg>`;
}

function pinIcon(inc: Incident, selected: boolean) {
  const meta = SEVERITY_META[inc.severity];
  const size = selected ? 34 : 24;
  return L.divIcon({
    html: shapeSvg(meta.shape, SEV_HEX[inc.severity], selected),
    className: "dsg-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitBounds({ incidents, zones }: { incidents: Incident[]; zones: Zone[] }) {
  const map = useMap();
  useEffect(() => {
    const pts: [number, number][] = [
      ...incidents.map((i) => i.coords),
      ...zones.flatMap((z) => z.polygon),
    ];
    if (pts.length) {
      map.fitBounds(L.latLngBounds(pts).pad(0.15), { animate: false });
    }
  }, [map, incidents, zones]);
  return null;
}

export default function ThreatMapImpl({
  incidents,
  zones,
  tracks = [],
  selectedId,
  onSelect,
  interactive = true,
}: {
  incidents: Incident[];
  zones: Zone[];
  tracks?: [number, number][][];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  interactive?: boolean;
}) {
  return (
    <MapContainer
      center={[2, 122]}
      zoom={4}
      className="h-full w-full bg-abyss"
      zoomControl={interactive}
      dragging={interactive}
      scrollWheelZoom={false}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      keyboard={interactive}
      attributionControl
      worldCopyJump
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />

      {zones.map((z) => {
        const hex =
          z.riskScore >= 67 ? "#FB7185" : z.riskScore >= 34 ? "#FBBF24" : "#34D399";
        return (
          <Polygon
            key={z.id}
            positions={z.polygon}
            pathOptions={{
              color: hex,
              weight: 1,
              fillColor: hex,
              fillOpacity: 0.08 + (z.riskScore / 100) * 0.14,
            }}
          />
        );
      })}

      {tracks.map((t, i) => (
        <Polyline
          key={`track-${i}`}
          positions={t}
          pathOptions={{ color: "#22D3EE", weight: 1.5, dashArray: "6 8", opacity: 0.7 }}
        />
      ))}

      {incidents.map((inc) => (
        <Marker
          key={inc.id}
          position={inc.coords}
          icon={pinIcon(inc, inc.id === selectedId)}
          eventHandlers={{ click: () => onSelect?.(inc.id) }}
          keyboard={false}
        />
      ))}

      <FitBounds incidents={incidents} zones={zones} />
    </MapContainer>
  );
}
