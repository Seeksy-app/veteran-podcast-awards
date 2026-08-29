import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

/**
 * VPA-branded social share card for voting links.
 * /api/og-image?show=...&category=...&sponsor=...
 * Satori object syntax (no JSX).
 */
type El = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown): El => ({
  type,
  props: { style, children },
});

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const show = (searchParams.get("show") || "Veteran Podcast Awards").slice(0, 80);
  const category = (searchParams.get("category") || "").slice(0, 60);
  const sponsor = (searchParams.get("sponsor") || "").slice(0, 60);

  const tree = el(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      background: "linear-gradient(135deg, #0f0f10 0%, #1c1917 60%, #292018 100%)",
      padding: "64px 72px",
    },
    [
      el("div", { display: "flex", flexDirection: "column" }, [
        el(
          "div",
          { fontSize: 26, letterSpacing: 8, color: "#d3a747", textTransform: "uppercase", fontWeight: 700 },
          "2026 Veteran Podcast Awards"
        ),
        ...(category
          ? [el("div", { fontSize: 30, color: "#a8a29e", marginTop: 18 }, `Nominated · ${category}`)]
          : []),
      ]),
      el("div", { display: "flex", flexDirection: "column" }, [
        el(
          "div",
          { fontSize: show.length > 34 ? 58 : 76, fontWeight: 800, color: "#fafaf9", lineHeight: 1.1 },
          show
        ),
        el("div", { display: "flex", alignItems: "center", marginTop: 34 }, [
          el(
            "div",
            {
              display: "flex",
              background: "linear-gradient(90deg, #d3a747, #b8860b)",
              color: "#1c1917",
              fontSize: 30,
              fontWeight: 800,
              padding: "16px 40px",
              borderRadius: 12,
            },
            "CAST YOUR VOTE →"
          ),
        ]),
      ]),
      el(
        "div",
        {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #44403c",
          paddingTop: 28,
        },
        [
          el("div", { fontSize: 24, color: "#a8a29e" }, "Voting open Oct 5 – Nov · Ceremony Nov 11, Veterans Day"),
          ...(sponsor
            ? [el("div", { display: "flex", fontSize: 24, color: "#d3a747", fontWeight: 700 }, `Presented by ${sponsor}`)]
            : []),
        ]
      ),
    ]
  );

  return new ImageResponse(tree as never, { width: 1200, height: 630 });
}
