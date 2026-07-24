"use client";

import { createAppKit } from "@reown/appkit/react";
import { base } from "@reown/appkit/networks";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiAdapter, projectId, wagmiConfig } from "@/lib/wallet/config";

const queryClient = new QueryClient();

// Init AppKit once. Always call it (so the useAppKit hook always has context, even
// before NEXT_PUBLIC_REOWN_PROJECT_ID is set); an empty projectId just means the
// WalletConnect relay is inert until the env var is provided.
createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  projectId: projectId || "sparkz-dev-placeholder",
  metadata: {
    name: "Sparkz",
    description: "Start with a spark, not a token.",
    url: "https://sparkz.lol",
    icons: ["https://sparkz.lol/icon.svg"],
  },
  features: { analytics: false, email: false, socials: [] },
});

export default function WalletProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
