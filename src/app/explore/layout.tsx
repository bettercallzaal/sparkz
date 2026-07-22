import type { Metadata } from "next";

const image =
  "https://trysparkz.com/api/og?title=Explore%20Sparkz&subtitle=Every%20ZAO%20Spark%20-%20filter%20by%20anything.";

export const metadata: Metadata = {
  title: "Explore Sparkz",
  description: "Every ZAO Spark in one filterable directory - type, status, backing, integrations.",
  openGraph: {
    title: "Explore Sparkz",
    description: "Every ZAO Spark in one filterable directory.",
    images: [{ url: image, width: 1200, height: 800 }],
  },
  twitter: { card: "summary_large_image", images: [image] },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
