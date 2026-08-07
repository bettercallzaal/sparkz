import type { Metadata } from "next";
import { canonicalOrigin } from "@/lib/origin";

const image = `${canonicalOrigin()}/api/og?title=Split%20Advisor&subtitle=3%20questions%20%E2%86%92%20recommended%20split%20%2B%20token%20timing`;

export const metadata: Metadata = {
  title: "Split advisor",
  description:
    "3 questions. Sparkz recommends a fee split, token timing, and earnings estimate - tailored to your creator shape. No token required to start.",
  openGraph: {
    title: "Sparkz split advisor",
    description: "3 questions → recommended split + token timing. No wallet needed.",
    images: [{ url: image, width: 1200, height: 800 }],
  },
  twitter: { card: "summary_large_image", images: [image] },
};

export default function AdvisorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
