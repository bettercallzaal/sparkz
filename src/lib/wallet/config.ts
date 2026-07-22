import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base } from "@reown/appkit/networks";

// Reown AppKit + wagmi config for the empire launcher. WalletConnect + injected +
// Coinbase, so it works on mobile browsers (not just wallet in-app browsers) - the
// core fix from the connecting-wallets skill. projectId is public (free, from
// reown.com) and safe as a NEXT_PUBLIC var.
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "";

export const networks = [base] as const;

export const wagmiAdapter = new WagmiAdapter({
  networks: [base],
  projectId,
  ssr: true,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
