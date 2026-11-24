import Link from "next/link";

// The line that makes Terms of Use something people agree to (App Store guideline 1.2):
// shown where someone signs in, opens a Hearth or lights a Spark.
export default function TermsNote({ action, className }: { action: string; className?: string }) {
  return (
    <p className={className ?? "mt-3 text-xs text-muted"}>
      By {action} you agree to the{" "}
      <Link href="/terms" className="text-accent underline">
        Terms of Use
      </Link>
      . Sparkz has zero tolerance for objectionable content.
    </p>
  );
}
