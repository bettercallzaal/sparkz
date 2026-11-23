import type { NextConfig } from "next";

// Stub the optional @x402/* payment modules that @coinbase/cdp-sdk lazy-imports
// (reached transitively via Reown's wagmi adapter -> @wagmi/connectors baseAccount
// -> @base-org/account -> @coinbase/cdp-sdk). They are optional and never used by
// Sparkz; aliasing them to an empty module stops Turbopack failing on the
// unresolved specifiers during the Vercel build. Alias value is relative to the
// project root (Turbopack resolves it there).
const x402Stub = "./src/lib/x402-stub.ts";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@x402/core/client": x402Stub,
      "@x402/evm": x402Stub,
      "@x402/evm/exact/client": x402Stub,
      "@x402/evm/upto/client": x402Stub,
      "@x402/svm/exact/client": x402Stub,
    },
  },
  // Baseline security headers (backend review, 2026-11-19). frame-ancestors / X-Frame-Options
  // are left out on purpose: Farcaster clients embed Sparkz as a mini app in a frame, and
  // their exact origins have to be listed before framing can be restricted.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
