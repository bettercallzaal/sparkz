'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type SituationType = 'crowdfund' | 'collab' | 'solo'
type TokenTiming = 'now' | 'later' | 'never'
type FeeModel = 'low' | 'medium' | 'high'

type Answers = {
  situation: SituationType | null
  tokenTiming: TokenTiming | null
  feeModel: FeeModel | null
}

type Recommendation = {
  communityPool: number
  creatorPool: number
  treasury: number
  zaoStake: number
  headline: string
  rationale: string
  tokenAdvice: string
  feeAdvice: string
  splitWizardHint: string
}

function getRecommendation(answers: Answers): Recommendation | null {
  if (!answers.situation || !answers.tokenTiming || !answers.feeModel) return null

  const base: Record<SituationType, Pick<Recommendation, 'communityPool' | 'creatorPool' | 'treasury' | 'headline' | 'rationale'>> = {
    crowdfund: {
      communityPool: 60,
      creatorPool: 15,
      treasury: 25,
      headline: 'Community-first: 60% to the people who showed up',
      rationale:
        'In a group crowdfund, the backers ARE the project. A 60% community pool signals that clearly — the treasury becomes a shared war chest for proposals and votes. The creator pool covers operations.',
    },
    collab: {
      communityPool: 50,
      creatorPool: 30,
      treasury: 20,
      headline: 'Balanced collab: 50% community, 30% creators',
      rationale:
        'Two or more artists each have skin in the game. The creator pool splits among collaborators by role (configured in the split wizard). A 20% treasury gives the community something to govern together.',
    },
    solo: {
      communityPool: 40,
      creatorPool: 35,
      treasury: 25,
      headline: 'Solo artist: 40% community, 35% creator',
      rationale:
        'You built this. A higher creator share (35%) sustains your work long-term. The community pool (40%) is still meaningful enough to attract and retain your most loyal supporters.',
    },
  }

  const tokenAdvice: Record<TokenTiming, string> = {
    now: 'Launch with a token immediately — your community momentum and split config are ready. Deploy the 0xSplits contract first, then Clanker with that address as the fee recipient.',
    later:
      'Hold on the token and start tokenless: build your leaderboard, prove the boost engine, collect a few dozen real supporters. When you launch, the token backs existing momentum — not speculation.',
    never:
      'No token needed. Use the patronage tier system ($5/$25/$100 recurring) with Stripe instead. Revenue goes directly to your 0xSplits recipients without any token mechanics.',
  }

  const feeAdvice: Record<FeeModel, string> = {
    low: 'At low volume ($1k–10k/day): community pool generates $35–350/week. This is early stages — the value is community signal and fee transparency, not dollar amounts.',
    medium:
      'At medium volume ($10k–100k/day): community pool generates $350–3,500/week. Enough that top contributors feel it. Weekly receipts build the compounding trust loop.',
    high: 'At high volume ($100k+/day): community pool generates $3,500+/week. At this scale, the split contract becomes a significant on-chain revenue mechanism. ZAO stake starts mattering financially.',
  }

  const splitWizardHint: Record<SituationType, string> = {
    crowdfund: 'In the split wizard: choose "Group crowdfund" → add all backer wallets → set roles as "Backer"',
    collab: 'In the split wizard: choose "Collab / joint release" → add each artist + producer with their roles and %',
    solo: 'In the split wizard: choose "Solo artist" → one entry for you, one for your community pool wallet',
  }

  const cfg = base[answers.situation]

  return {
    ...cfg,
    zaoStake: 5,
    tokenAdvice: tokenAdvice[answers.tokenTiming],
    feeAdvice: feeAdvice[answers.feeModel],
    splitWizardHint: splitWizardHint[answers.situation],
  }
}

const SITUATIONS: { value: SituationType; label: string; description: string }[] = [
  {
    value: 'crowdfund',
    label: 'Group crowdfund',
    description: 'A community backs a shared project (album, event, collab). Backers share the pool.',
  },
  {
    value: 'collab',
    label: 'Artist collab or joint release',
    description: 'Two or more artists releasing together. Producers, engineers, features all have stakes.',
  },
  {
    value: 'solo',
    label: 'Solo artist with producers',
    description: 'Primarily your project. You want to reward your community + pay collaborators fairly.',
  },
]

const TOKEN_TIMINGS: { value: TokenTiming; label: string; description: string }[] = [
  {
    value: 'now',
    label: 'Launch a token now',
    description: 'The community is ready. Deploy 0xSplits + Clanker together.',
  },
  {
    value: 'later',
    label: 'Build first, token later',
    description: 'Start with a leaderboard and backing proof. Tokenize when momentum is proven.',
  },
  {
    value: 'never',
    label: 'No token — patronage only',
    description: 'Card-based recurring tiers ($5/$25/$100). Revenue splits via 0xSplits without a coin.',
  },
]

const FEE_MODELS: { value: FeeModel; label: string; description: string }[] = [
  {
    value: 'low',
    label: 'Early stage ($1k–10k/day)',
    description: 'Community pool: $35–350/week. Prove the model before scaling.',
  },
  {
    value: 'medium',
    label: 'Growing ($10k–100k/day)',
    description: 'Community pool: $350–3,500/week. Contributors start feeling it.',
  },
  {
    value: 'high',
    label: 'At scale ($100k+/day)',
    description: 'Community pool: $3,500+/week. The split becomes a real revenue mechanism.',
  },
]

function OptionButton<T extends string>({
  option,
  selected,
  onSelect,
}: {
  option: { value: T; label: string; description: string }
  selected: boolean
  onSelect: (v: T) => void
}) {
  return (
    <button
      onClick={() => onSelect(option.value)}
      className={`w-full text-left card-dark p-4 transition-colors hover:border-gold-500/30 ${
        selected ? 'border-gold-500/60 bg-gold-500/5' : ''
      }`}
    >
      <div className="font-semibold text-white">{option.label}</div>
      <div className="text-sm text-slate-400 mt-1">{option.description}</div>
    </button>
  )
}

export default function AdvisorFlow() {
  const searchParams = useSearchParams()

  const [answers, setAnswers] = useState<Answers>({
    situation: null,
    tokenTiming: null,
    feeModel: null,
  })

  // Pre-fill from URL params (e.g. from /examples/[slug] deep-link)
  useEffect(() => {
    const situation = searchParams.get('situation') as SituationType | null
    const tokenTiming = searchParams.get('token') as TokenTiming | null
    const feeModel = searchParams.get('fee') as FeeModel | null
    if (situation || tokenTiming || feeModel) {
      setAnswers((a) => ({
        situation: situation ?? a.situation,
        tokenTiming: tokenTiming ?? a.tokenTiming,
        feeModel: feeModel ?? a.feeModel,
      }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const recommendation = getRecommendation(answers)
  const allAnswered = answers.situation && answers.tokenTiming && answers.feeModel

  return (
    <div className="space-y-8">
      {/* Q1 */}
      <div>
        <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-3">
          Question 1 of 3
        </div>
        <h2 className="text-lg font-bold text-white mb-4">What kind of project is this?</h2>
        <div className="space-y-3">
          {SITUATIONS.map((opt) => (
            <OptionButton
              key={opt.value}
              option={opt}
              selected={answers.situation === opt.value}
              onSelect={(v) => setAnswers((a) => ({ ...a, situation: v }))}
            />
          ))}
        </div>
      </div>

      {/* Q2 */}
      <div className={answers.situation ? '' : 'opacity-40 pointer-events-none'}>
        <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-3">
          Question 2 of 3
        </div>
        <h2 className="text-lg font-bold text-white mb-4">Token now, later, or never?</h2>
        <div className="space-y-3">
          {TOKEN_TIMINGS.map((opt) => (
            <OptionButton
              key={opt.value}
              option={opt}
              selected={answers.tokenTiming === opt.value}
              onSelect={(v) => setAnswers((a) => ({ ...a, tokenTiming: v }))}
            />
          ))}
        </div>
      </div>

      {/* Q3 */}
      <div className={answers.tokenTiming ? '' : 'opacity-40 pointer-events-none'}>
        <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-3">
          Question 3 of 3
        </div>
        <h2 className="text-lg font-bold text-white mb-4">
          What volume range are you expecting?
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Honest answer here. The fee model should be sustainable at your current stage, not
          optimized for a future that isn&rsquo;t here yet.
        </p>
        <div className="space-y-3">
          {FEE_MODELS.map((opt) => (
            <OptionButton
              key={opt.value}
              option={opt}
              selected={answers.feeModel === opt.value}
              onSelect={(v) => setAnswers((a) => ({ ...a, feeModel: v }))}
            />
          ))}
        </div>
      </div>

      {/* Recommendation */}
      {allAnswered && recommendation && (
        <div className="card-dark p-6 border-gold-500/30 space-y-5">
          <div>
            <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-2">
              Your recommended split
            </div>
            <h3 className="text-xl font-black text-white">{recommendation.headline}</h3>
          </div>

          {/* Split bars */}
          <div className="space-y-3">
            {[
              { label: 'Community pool', pct: recommendation.communityPool, color: 'bg-gold-500' },
              { label: 'Creator pool', pct: recommendation.creatorPool, color: 'bg-zao-violet' },
              { label: 'Treasury', pct: recommendation.treasury, color: 'bg-slate-600' },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-bold text-white tabular-nums">{pct}%</span>
                </div>
                <div className="h-2 bg-zao-dark rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
            <div className="text-xs text-slate-600 pt-1">
              ZAO stake: {recommendation.zaoStake}% of token supply (not a fee slice)
            </div>
          </div>

          {/* Rationale */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Why</div>
            <p className="text-sm text-slate-400 leading-relaxed">{recommendation.rationale}</p>
          </div>

          {/* Token advice */}
          <div className="p-4 rounded-lg bg-zao-dark border border-zao-border">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              On the token timing
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{recommendation.tokenAdvice}</p>
          </div>

          {/* Fee advice */}
          <div className="p-4 rounded-lg bg-zao-dark border border-zao-border">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Fee economics at your stage
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{recommendation.feeAdvice}</p>
          </div>

          {/* Next step */}
          <div className="p-4 rounded-lg bg-gold-500/5 border border-gold-500/20">
            <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-2">
              Next: set up your split sheet
            </div>
            <p className="text-sm text-slate-400 mb-3">{recommendation.splitWizardHint}</p>
            <Link
              href={`/split-wizard?communityPool=${recommendation.communityPool}&creatorPool=${recommendation.creatorPool}&treasury=${recommendation.treasury}&type=${answers.situation ?? 'solo'}`}
              className="btn-gold inline-block text-sm py-2 px-4"
            >
              Open split wizard →
            </Link>
          </div>

          <p className="text-xs text-slate-600">
            This is a starting point, not a locked config. Adjust in the split wizard. The actual
            deploy is always a human decision — the advisor prepares, never deploys.
          </p>
        </div>
      )}
    </div>
  )
}
