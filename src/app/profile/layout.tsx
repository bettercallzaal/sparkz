import FarcasterAuthProviders from "./providers";

// SIWF/AuthKit initializes client-side; don't statically prerender.
export const dynamic = "force-dynamic";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FarcasterAuthProviders>{children}</FarcasterAuthProviders>;
}
