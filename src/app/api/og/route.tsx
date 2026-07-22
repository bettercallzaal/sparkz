import { ImageResponse } from "next/og";
import { getServiceClient } from "@/lib/supabase/server";
import type { Capsule } from "@/lib/supabase/types";

// Branded 3:2 card - the Farcaster Mini App embed image + default OG/share image.
// Two modes:
//   ?slug=<capsule>       -> a live Capsule card (name, type, status, stats, fc)
//   ?title=..&subtitle=.. -> a generic card (landing, /explore, etc.)
export const dynamic = "force-dynamic";

const V = "#c084fc"; // violet
const A = "#fbbf24"; // amber

function Flame({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="f" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={A} />
          <stop offset="0.55" stopColor="#f472b6" />
          <stop offset="1" stopColor={V} />
        </linearGradient>
      </defs>
      <path
        fill="url(#f)"
        d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z"
      />
    </svg>
  );
}

function Card({
  eyebrow,
  title,
  subtitle,
  chips,
  stats,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  chips?: { label: string; color: string }[];
  stats?: { n: string | number; label: string }[];
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "radial-gradient(1200px 700px at 28% -10%, #2a0f3a 0%, #0a0a0b 62%)",
        color: "#f5f5f5",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
        <Flame size={84} />
        <div style={{ fontSize: 36, letterSpacing: "0.32em", color: V, textTransform: "uppercase" }}>
          {eyebrow ?? "Sparkz"}
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 88, fontWeight: 700, marginTop: 34, lineHeight: 1.02, maxWidth: 1000 }}>
        {title}
      </div>

      {chips && chips.length > 0 && (
        <div style={{ display: "flex", gap: "16px", marginTop: 30 }}>
          {chips.map((c) => (
            <div
              key={c.label}
              style={{
                display: "flex",
                fontSize: 26,
                padding: "8px 22px",
                borderRadius: 999,
                border: `2px solid ${c.color}`,
                color: c.color,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {c.label}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", fontSize: 36, color: "#a8a29e", marginTop: 28, maxWidth: 1000 }}>
        {subtitle}
      </div>

      {stats && stats.length > 0 && (
        <div style={{ display: "flex", gap: "64px", marginTop: 44 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 66, fontWeight: 700, color: A }}>{s.n}</div>
              <div style={{ display: "flex", fontSize: 26, color: "#78716c", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const size = { width: 1200, height: 800 } as const;

  if (slug) {
    try {
      const supabase = getServiceClient();
      const { data } = await supabase
        .from("capsules")
        .select("id, name, type, status, bio, metadata")
        .eq("slug", slug)
        .maybeSingle();

      if (data) {
        const c = data as Pick<Capsule, "id" | "name" | "type" | "status" | "bio" | "metadata">;
        const [{ count: backers }, { data: boostRows }, { count: receipts }] = await Promise.all([
          supabase.from("capsule_backers").select("id", { count: "exact", head: true }).eq("capsule_id", c.id),
          supabase.from("capsule_backers").select("id").eq("capsule_id", c.id).eq("kind", "boost"),
          supabase.from("meme_receipts").select("id", { count: "exact", head: true }).eq("capsule_id", c.id),
        ]);
        const meta = (c.metadata ?? {}) as Record<string, unknown>;
        const fc = meta.farcaster as { channel?: string; username?: string } | undefined;
        const fcLabel = fc?.channel ? `/${fc.channel}` : fc?.username ? `@${fc.username}` : null;

        return new ImageResponse(
          (
            <Card
              eyebrow="Sparkz Capsule"
              title={c.name}
              subtitle={c.bio ?? "Back the work, not a coin."}
              chips={[
                { label: c.type, color: V },
                { label: c.status, color: A },
                ...(fcLabel ? [{ label: fcLabel, color: "#f472b6" }] : []),
              ]}
              stats={[
                { n: backers ?? 0, label: "backers" },
                { n: boostRows?.length ?? 0, label: "boosts" },
                { n: receipts ?? 0, label: "receipts" },
              ]}
            />
          ),
          size,
        );
      }
    } catch {
      // fall through to generic
    }
  }

  const title = searchParams.get("title") ?? "Sparkz";
  const subtitle = searchParams.get("subtitle") ?? "Start with a spark, not a token.";
  return new ImageResponse(<Card title={title} subtitle={subtitle} />, size);
}
