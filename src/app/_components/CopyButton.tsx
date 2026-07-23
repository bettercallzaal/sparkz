"use client";

import { useToast } from "./toast";

// Copy-to-clipboard button (the Etherscan/wallet pattern). Small, inline; confirms
// with a toast.
export default function CopyButton({
  value,
  label = "Copied to clipboard",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const toast = useToast();
  return (
    <button
      type="button"
      aria-label="Copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast(label);
        } catch {
          toast("Could not copy", "error");
        }
      }}
      className={`inline-flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted hover:text-foreground ${className}`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
      </svg>
    </button>
  );
}
