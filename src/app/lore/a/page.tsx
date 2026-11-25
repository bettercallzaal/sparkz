import Link from "next/link";
import HearthScene from "../_scene/HearthScene";
import { loadScene } from "../_scene/load";
import { previewMetadata } from "../_scene/robots";

export const dynamic = "force-dynamic";
export const metadata = previewMetadata;

// Direction A: the Ring. One Hearth, the Sparks on an orbit, logs laid around the fire.
export default async function LoreA() {
  const { sparks, total } = await loadScene();
  return (
    <main className="mx-auto max-w-5xl px-4 pt-10 pb-16 sm:pt-14">
      <p className="text-xs uppercase tracking-wide text-muted">Preview, not linked</p>
      <h1 className="mt-3 max-w-2xl text-[clamp(2rem,6.5vw,3.4rem)] font-bold leading-[1.02] tracking-tight">
        Light a Hearth. <span className="spark-text">Keep it burning.</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
        A Hearth is a project&apos;s home: its story, its people, and a record of everyone who
        helped it burn.
      </p>
      <div className="mt-10">
        <HearthScene sparks={sparks} variant="ring" />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        {total > 0 ? `${total} Hearths are live. ` : ""}Each log is a backer, a boost or a piece
        of work added to the fire.
      </p>
      <div className="mt-8 flex justify-center">
        <Link href="/demo" className="rounded-lg border border-border px-5 py-2.5 text-sm hover:border-accent">
          How it works
        </Link>
      </div>
    </main>
  );
}
