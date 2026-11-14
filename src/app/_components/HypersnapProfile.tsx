import { getProfile } from "@/lib/hypersnap";

// The owner's Farcaster profile as the Hypersnap node has it: pfp, display name, @name
// and the first line of the bio. Server component; renders nothing when the node has no
// profile or does not answer, so a Hearth page never waits on it for content it has.
export default async function HypersnapProfile({ fid }: { fid: number }) {
  const p = await getProfile(fid);
  if (!p) return null;
  const name = p.display || (p.username ? `@${p.username}` : `fid ${p.fid}`);
  const bio = (p.bio ?? "").split(/\r?\n/)[0].trim();
  return (
    <a
      href={p.username ? `https://farcaster.xyz/${p.username}` : `https://farcaster.xyz/~/profiles/${p.fid}`}
      target="_blank"
      rel="noreferrer"
      className="mt-3 flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2 hover:border-accent"
      title="Read from the Hypersnap node"
    >
      {p.pfp ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.pfp} alt={name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm text-accent">
          {name.replace(/^@/, "").charAt(0).toUpperCase()}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{name}</span>
        <span className="block truncate text-xs text-muted">
          {p.username ? `@${p.username}` : ""}
          {p.username && bio ? " · " : ""}
          {bio}
        </span>
      </span>
    </a>
  );
}
