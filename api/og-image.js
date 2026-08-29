/**
 * VPA-branded social share card for voting links.
 * /api/og-image?show=...&category=...&sponsor=...
 * CommonJS on purpose: @vercel/og's node build only loads cleanly via require().
 */
const { ImageResponse } = require("@vercel/og");

const el = (type, style, children) => ({ type, props: { style, children } });

module.exports = async (req, res) => {
  const show = String(req.query.show || "Veteran Podcast Awards").slice(0, 80);
  const category = String(req.query.category || "").slice(0, 60);
  const sponsor = String(req.query.sponsor || "").slice(0, 60);

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

  try {
    const image = new ImageResponse(tree, { width: 1200, height: 630 });
    const buf = Buffer.from(await image.arrayBuffer());
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).send(buf);
  } catch (e) {
    res.status(500).send(`og-image failed: ${e && e.message}`);
  }
};
