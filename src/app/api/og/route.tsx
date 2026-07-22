import { ImageResponse } from "next/og";

// Branded 3:2 card - used as the Farcaster Mini App embed image and the default
// OG/share image. Query: ?title=...&subtitle=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Sparkz";
  const subtitle =
    searchParams.get("subtitle") ?? "Start with a spark, not a token.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(1200px 600px at 50% -10%, #2a0f3a 0%, #0a0a0a 60%)",
          color: "#f5f5f5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <svg width="96" height="96" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="f" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#f97316" />
                <stop offset="0.55" stopColor="#ec4899" />
                <stop offset="1" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <path
              fill="url(#f)"
              d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z"
            />
          </svg>
          <div style={{ fontSize: 40, letterSpacing: "0.3em", color: "#c084fc", textTransform: "uppercase" }}>
            Sparkz
          </div>
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, marginTop: 40, lineHeight: 1.05, maxWidth: 900 }}>
          {title}
        </div>
        <div style={{ fontSize: 40, color: "#9a9aa2", marginTop: 24, maxWidth: 900 }}>
          {subtitle}
        </div>
      </div>
    ),
    { width: 1200, height: 800 },
  );
}
