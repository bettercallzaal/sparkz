import Link from "next/link";
import { previewMetadata } from "./_scene/robots";

export const metadata = previewMetadata;

// Index of the hero directions. Not linked from anywhere in the app.
export default function LoreIndex() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-10 pb-16">
      <p className="text-xs uppercase tracking-wide text-muted">Preview, not linked</p>
      <h1 className="mt-3 text-2xl font-bold">Hearth lore: hero directions</h1>
      <ul className="mt-6 space-y-3 text-sm">
        <li>
          <Link className="underline" href="/lore/a">Direction A: the Ring</Link>
        </li>
        <li>
          <Link className="underline" href="/lore/b">Direction B: the Stack</Link>
        </li>
      </ul>
    </main>
  );
}
