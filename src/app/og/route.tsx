import { ImageResponse } from "next/og";

export const dynamic = "force-static";

/** One shared OG template, dynamic title via ?title=. 1200x630. */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "Sonar").slice(0, 90);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #04070e 0%, #0b1830 55%, #0d2740 100%)",
          padding: 72,
          color: "#eaf2ff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#0d1524",
              border: "1px solid #22344f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                border: "3px solid #22d3ee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: 999, background: "#22d3ee" }} />
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
            Sonar
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontSize: title.length > 40 ? 60 : 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 26, color: "#a8bcd6" }}>
            AI-ranked deep-ocean pollution & biodiversity monitoring
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 22,
              color: "#22d3ee",
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 999, background: "#22d3ee" }} />
            Live console
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
