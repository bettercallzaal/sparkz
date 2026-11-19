import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base, optimism } from "@reown/appkit/networks";

// Reown AppKit + wagmi config for the empire launcher. WalletConnect + injected +
// Coinbase, so it works on mobile browsers (not just wallet in-app browsers) - the
// core fix from the connecting-wallets skill. projectId is public (free, from
// reown.com) and safe as a NEXT_PUBLIC var.
// Fallback: the Sparkz project on cloud.reown.com (team ZAO). Public by design; the
// Reown allowlist (trysparkz.com) is what stops other sites using it.
export const SPARKZ_REOWN_PROJECT_ID = "1a2125cb32e5d6d09c56f354cac7fcfe";
export const projectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || SPARKZ_REOWN_PROJECT_ID;

export const networks = [base, optimism] as const;

export const wagmiAdapter = new WagmiAdapter({
  networks: [base, optimism],
  projectId,
  ssr: true,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
