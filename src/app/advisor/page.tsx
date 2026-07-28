"use client";

import type { Metadata } from "next";
import { useState } from "react";
import Link from "next/link";
import Flame from "@/app/_components/Flame";
import type { AdvisorAnswers, AdvisorRecommendation } from "@/lib/advisor";

// Metadata is in layout.tsx for this client page; see the export below.

const SITUATIONS = [
  {
    v: "solo" as const,
    label: "Solo artist / creator",
    sub: "One main creator, maybe a few producers or collaborators",
  },
  {
    v: "collab" as const,
    label: "Collab / joint release",
    sub: "Two or more artists with equal skin in the game",
  },
  {
    v: "crowdfund" as const,
    label: "Group crowdfund",
    sub: "Community backs the project — backers are the project",
  },
];

const TOKEN_TIMINGS = [
  { v: "now" as const, label: "Launch a token now", sub: "Community momentum is ready" },
  {
    v: "later" as const,
    label: "Start tokenless, token later",
    sub: "Build the leaderboard first, then decide",
  },
  { v: "never" as const, label: "No token ever", sub: "Card-backed tiers, no coin required" },
];

const FEE_MODELS = [
  {
    v: "low" as const,
    label: "Early / low volume",
    sub: "$1k–10k/day trading volume expected",
  },
  {
    v: "medium" as const,
    label: "Medium traction",
    sub: "$10k–100k/day once the community is active",
  },
  {
    v: "high" as const,
    label: "High volume",
    sub: "$100k+/day — the split becomes significant",
  },
];

function OptionButton<T extends string>({
  selected,
  value,
  label,
  sub,
  onClick,
}: {
  selected: T | null;
  value: T;
  label: string;
  sub: string;
  onClick: (v: T) => void;
}) {
  const on = selected === value;
  return (
    <button
      onClick={() => onClick(value)}
      className={`w-full rounded-lg border p-4 text-left transition-colors ${
        on
          ? "border-accent bg-accent/10 text-foreground"
          : "border-border bg-card text-muted hover:border-accent/50 hover:text-foreground"
      }`}
    >
      <div className="font-medium">{label}</div>
      <div className="mt-0.5 text-xs text-muted">{sub}</div>
    </button>
  );
}

function SplitBar({ community, creator, treasury }: { community: number; creator: number; treasury: number }) {
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full">
      <div className="bg-accent transition-all" style={{ width: `${community}%` }} title={`Community ${community}%`} />
      <div className="bg-accent-3 transition-all" style={{ width: `${creator}%` }} title={`Creator ${creator}%`} />
      <div className="bg-accent-2 transition-all" style={{ width: `${treasury}%` }} title={`Treasury ${treasury}%`} />
    </div>
  );
}

export default function AdvisorPage() {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [situation, setSituation] = useState<AdvisorAnswers["situation"] | null>(null);
  const [tokenTiming, setTokenTiming] = useState<AdvisorAnswers["tokenTiming"] | null>(null);
  const [feeModel, setFeeModel] = useState<AdvisorAnswers["feeModel"] | null>(null);
  const [result, setResult] = useState<AdvisorRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!situation || !tokenTiming || !feeModel) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, tokenTiming, feeModel }),
      });
      const json = await res.json();
      if (json.recommendation) {
        setResult(json.recommendation);
        setStep(3);
      } else {
        setError(json.error ?? "Something went wrong — try again.");
      }
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setSituation(null);
    setTokenTiming(null);
    setFeeModel(null);
    setResult(null);
    setError("");
  };

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Flame className="h-8 w-8 flame-live" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Split advisor</h1>
          <p className="text-sm text-muted">3 questions → recommended split + token timing</p>
        </div>
      </div>

      {step < 3 && (
        <div className="mb-6">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-accent" : "bg-border"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Step {step + 1} of 3</p>
        </div>
      )}

      {step === 0 && (
        <div className="glass p-6">
          <h2 className="mb-4 text-base font-semibold">What kind of project is this?</h2>
          <div className="space-y-2">
            {SITUATIONS.map((s) => (
              <OptionButton
                key={s.v}
                selected={situation}
                value={s.v}
                label={s.label}
                sub={s.sub}
                onClick={(v) => setSituation(v)}
              />
            ))}
          </div>
          <button
            disabled={!situation}
            onClick={() => setStep(1)}
            className="btn-spark mt-5 w-full rounded-md py-2.5 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="glass p-6">
          <h2 className="mb-4 text-base font-semibold">When do you want to launch a token?</h2>
          <div className="space-y-2">
            {TOKEN_TIMINGS.map((t) => (
              <OptionButton
                key={t.v}
                selected={tokenTiming}
                value={t.v}
                label={t.label}
                sub={t.sub}
                onClick={(v) => setTokenTiming(v)}
              />
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <button onClick={() => setStep(0)} className="rounded-md border border-border px-4 py-2.5 text-sm text-muted hover:text-foreground">
              ← Back
            </button>
            <button
              disabled={!tokenTiming}
              onClick={() => setStep(2)}
              className="btn-spark flex-1 rounded-md py-2.5 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="glass p-6">
          <h2 className="mb-4 text-base font-semibold">What trading volume do you expect?</h2>
          <p className="mb-4 text-xs text-muted">
            This sizes the weekly earnings estimate for your community pool.
          </p>
          <div className="space-y-2">
            {FEE_MODELS.map((f) => (
              <OptionButton
                key={f.v}
                selected={feeModel}
                value={f.v}
                label={f.label}
                sub={f.sub}
                onClick={(v) => setFeeModel(v)}
              />
            ))}
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          <div className="mt-5 flex gap-2">
            <button onClick={() => setStep(1)} className="rounded-md border border-border px-4 py-2.5 text-sm text-muted hover:text-foreground">
              ← Back
            </button>
            <button
              disabled={!feeModel || loading}
              onClick={submit}
              className="btn-spark flex-1 rounded-md py-2.5 disabled:opacity-40"
            >
              {loading ? "Thinking…" : "Get recommendation →"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && result && (
        <div className="space-y-4">
          <div className="glass p-6">
            <div className="mb-4 text-xs font-medium uppercase tracking-wide text-accent">
              Your recommendation
            </div>
            <h2 className="mb-4 text-lg font-semibold leading-tight">{result.headline}</h2>
            <p className="text-sm leading-relaxed text-muted">{result.rationale}</p>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs text-muted">
                <span>Split allocation</span>
                <span className="flex gap-3">
                  <span><span className="inline-block h-2 w-2 rounded-full bg-accent align-middle" /> Community {result.communityPool}%</span>
                  <span><span className="inline-block h-2 w-2 rounded-full bg-accent-3 align-middle" /> Creator {result.creatorPool}%</span>
                  <span><span className="inline-block h-2 w-2 rounded-full bg-accent-2 align-middle" /> Treasury {result.treasury}%</span>
                </span>
              </div>
              <SplitBar community={result.communityPool} creator={result.creatorPool} treasury={result.treasury} />
            </div>
          </div>

          <div className="glass p-5">
            <h3 className="mb-2 text-sm font-medium">Token advice</h3>
            <p className="text-sm leading-relaxed text-muted">{result.tokenAdvice}</p>
          </div>

          <div className="glass p-5">
            <h3 className="mb-2 text-sm font-medium">Fee model</h3>
            <p className="text-sm leading-relaxed text-muted">{result.feeAdvice}</p>
          </div>

          <div className="glass p-5">
            <h3 className="mb-2 text-sm font-medium">Split wizard hint</h3>
            <p className="text-sm leading-relaxed text-muted">{result.splitWizardHint}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button onClick={reset} className="flex-1 rounded-md border border-border px-4 py-2.5 text-sm text-muted hover:text-foreground">
              Start over
            </button>
            <Link href="/start" className="btn-spark flex-1 rounded-md py-2.5 text-center text-sm">
              Light your spark →
            </Link>
          </div>

          <p className="text-center text-xs text-muted">
            ZAO stake: {result.zaoStake}% locked (alignment, not a skim).{" "}
            <Link href="/demo" className="text-accent hover:underline">How it works →</Link>
          </p>
        </div>
      )}
    </main>
  );
}
