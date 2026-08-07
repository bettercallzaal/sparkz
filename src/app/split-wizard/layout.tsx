import type { Metadata } from "next";
import { canonicalOrigin } from "@/lib/origin";

const BASE = canonicalOrigin();

export const metadata: Metadata = {
  title: "Split-sheet wizard - Sparkz",
  description:
    "Define collaborator roles and percentages before launch. IPFS-attestable. Exports JSON ready to wire directly to 0xSplits. The music-native way to kill revenue disputes before they start.",
  openGraph: {
    title: "Split-sheet wizard - Sparkz",
    description: "Roles + % + wallets set before launch. Exports 0xSplits JSON. IPFS-attestable.",
    url: `${BASE}/split-wizard`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Split-sheet wizard - Sparkz",
    description: "Roles + % + wallets. 0xSplits JSON export. IPFS-attestable.",
  },
};

export default function SplitWizardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
