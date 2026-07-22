import WalletProviders from "./providers";

// Wallet stack must not statically prerender (AppKit initializes client-side).
export const dynamic = "force-dynamic";

// Scope the wallet stack (wagmi + Reown AppKit) to the empire launcher only, so the
// public landing pages stay light.
export default function EmpireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WalletProviders>{children}</WalletProviders>;
}
