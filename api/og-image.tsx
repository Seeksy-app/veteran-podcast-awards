import { ImageResponse } from "@vercel/og";

/**
 * VPA-branded social share card for voting links.
 * /api/og-image?show=...&category=...&sponsor=...
 */
export default function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const show = searchParams.get("show") || "Veteran Podcast Awards";
  const category = searchParams.get("category") || "";
  const sponsor = searchParams.get("sponsor") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f0f10 0%, #1c1917 60%, #292018 100%)",
          padding: "64px 72px",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 8,
              color: "#d3a747",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            2026 Veteran Podcast Awards
          </div>
          {category ? (
            <div style={{ fontSize: 30, color: "#a8a29e", marginTop: 18 }}>Nominated · {category}</div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: show.length > 34 ? 58 : 76,
              fontWeight: 800,
              color: "#fafaf9",
              lineHeight: 1.1,
            }}
          >
            {show}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 34,
            }}
          >
            <div
              style={{
                display: "flex",
                background: "linear-gradient(90deg, #d3a747, #b8860b)",
                color: "#1c1917",
                fontSize: 30,
                fontWeight: 800,
                padding: "16px 40px",
                borderRadius: 12,
              }}
            >
              CAST YOUR VOTE →
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #44403c",
            paddingTop: 28,
          }}
        >
          <div style={{ fontSize: 24, color: "#a8a29e" }}>
            Voting open Oct 5 – Nov · Ceremony Nov 11, Veterans Day
          </div>
          {sponsor ? (
            <div style={{ display: "flex", fontSize: 24, color: "#d3a747", fontWeight: 700 }}>
              Presented by {sponsor}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
