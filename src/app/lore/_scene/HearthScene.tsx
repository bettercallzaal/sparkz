import Flame from "@/app/_components/Flame";

export type SceneSpark = { slug: string; name: string };

// Logs are drawn as illustration only. The number is art, not a count of anything.
const LOGS = 14;
const SPARK_SLOTS = 8;

// One Hearth in the centre, Sparks around it, logs added to the fire. Server-rendered
// SVG and CSS only. Positions are computed here so no client code is needed.
export default function HearthScene({
  sparks,
  variant,
}: {
  sparks: SceneSpark[];
  variant: "ring" | "stack";
}) {
  const shown = sparks.slice(0, SPARK_SLOTS);
  const n = Math.max(shown.length, 1);

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-sm"
      role="img"
      aria-label="Illustration: one Hearth in the centre, Sparks around it, and logs added to the fire"
    >
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(232,198,106,0.32), rgba(232,198,106,0.06) 60%, transparent 72%)",
        }}
      />
      <div aria-hidden className="absolute inset-[18%] rounded-full border border-accent/25" />

      {/* Logs: small gold bars laid around the fire. */}
      {Array.from({ length: LOGS }).map((_, i) => {
        const angle = variant === "ring" ? (i / LOGS) * 360 : -90 + ((i % 7) - 3) * 9;
        const radius = variant === "ring" ? 22 : 0;
        const offset = variant === "stack" ? (i % 5) * 4 - 8 : 0;
        const rad = (angle * Math.PI) / 180;
        const x = 50 + radius * Math.cos(rad) + (variant === "stack" ? offset : 0);
        const y = 58 + radius * Math.sin(rad) + (variant === "stack" ? (i % 3) * -3 : 0);
        return (
          <span
            aria-hidden
            key={`log-${i}`}
            className="absolute h-1.5 w-5 rounded-sm bg-gradient-to-r from-[#8a5a24] to-[#e8c66a]"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
              opacity: 0.55 + (i % 4) * 0.12,
            }}
          />
        );
      })}

      {/* The Hearth. */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2"
        style={{ filter: "drop-shadow(0 8px 28px rgba(232,198,106,0.45))" }}
      >
        <Flame className="h-24 w-24" />
      </div>

      {/* Sparks on an orbit, each a link-free label so nothing navigates from the preview. */}
      {shown.map((s, i) => {
        const rad = ((-90 + (i / n) * 360) * Math.PI) / 180;
        const r = variant === "ring" ? 42 : 40;
        const x = 50 + r * Math.cos(rad);
        const y = 50 + r * Math.sin(rad);
        return (
          <div
            key={s.slug}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span className="grid h-9 w-9 place-items-center rounded-full border border-accent/50 bg-background/80">
              <Flame className="h-4 w-4" />
            </span>
            <span className="max-w-[6.5rem] truncate text-[11px] text-muted">{s.name}</span>
          </div>
        );
      })}
    </div>
  );
}
