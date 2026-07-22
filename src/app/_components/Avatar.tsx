// Capsule avatar - a real logo when the Capsule has one (metadata.image), otherwise
// a deterministic gradient tile with the first initial. Gives every Capsule and
// every /explore row a visual identity instead of text alone.

const GRADIENTS = [
  "linear-gradient(135deg,#c084fc,#fbbf24)",
  "linear-gradient(135deg,#f472b6,#c084fc)",
  "linear-gradient(135deg,#fbbf24,#f472b6)",
  "linear-gradient(135deg,#a855f7,#ec4899)",
  "linear-gradient(135deg,#ec4899,#fbbf24)",
  "linear-gradient(135deg,#8b5cf6,#f472b6)",
];

function pick(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export default function Avatar({
  name,
  image,
  className = "h-12 w-12 text-lg",
}: {
  name: string;
  image?: string | null;
  className?: string;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        className={`shrink-0 rounded-2xl object-cover ${className}`}
      />
    );
  }
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      aria-hidden
      style={{ backgroundImage: pick(name) }}
      className={`grid shrink-0 -rotate-3 place-items-center rounded-2xl font-bold text-black ${className}`}
    >
      {initial}
    </div>
  );
}
