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
  // Clean URL for the static interactive architecture page (public/architecture.html).
  async rewrites() {
    return [{ source: "/architecture", destination: "/architecture.html" }];
  },
};

export default nextConfig;
