import { ImageResponse } from "next/og";

// Render on-demand, never prerendered at build (ImageResponse can't prerender in
// the Vercel build sandbox - it fails the build).
export const dynamic = "force-dynamic";

// 1024x1024 app icon for the Farcaster Mini App manifest (iconUrl must be a
// 1024px PNG). Flame on a dark ground.
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(600px 600px at 50% 35%, #2a0f3a 0%, #0a0a0a 70%)",
        }}
      >
        <svg width="620" height="620" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="fi" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#f97316" />
              <stop offset="0.55" stopColor="#ec4899" />
              <stop offset="1" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <path
            fill="url(#fi)"
            d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z"
          />
        </svg>
      </div>
    ),
    { width: 1024, height: 1024 },
  );
}
