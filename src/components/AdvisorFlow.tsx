'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  type SituationType,
  type TokenTiming,
  type FeeModel,
  type AdvisorRecommendation,
  getAdvisorRecommendation,
} from '@/lib/advisor'

const RELATED_EXAMPLES: Record<string, { slug: string; emoji: string; title: string; tagline: string }[]> = {
  solo: [
    { slug: 'leaderboard-boost', emoji: '🏆', title: 'Community leaderboard', tagline: 'Your superfans earn fee share just by showing up.' },
    { slug: 'pfp-nft-community', emoji: '🎨', title: 'PFP / NFT community', tagline: 'Holders earn fee share. The NFT becomes the membership card.' },
  ],
  collab: [
    { slug: 'music-collab', emoji: '🎵', title: 'Music collab', tagline: 'Two artists, one split. Both incentivized to share.' },
    { slug: 'dao-staking', emoji: '🏛', title: 'Light DAO', tagline: 'Stake to vote, earn while staked.' },
  ],
  crowdfund: [
    { slug: 'group-crowdfund', emoji: '🌐', title: 'Group crowdfund', tagline: 'A community backs a shared project. Backers share the pool.' },
    { slug: 'dao-staking', emoji: '🏛', title: 'Light DAO', tagline: 'Stake to vote, earn while staked.' },
  ],
}

type Answers = {
  situation: SituationType | null
  tokenTiming: TokenTiming | null
  feeModel: FeeModel | null
}

type Recommendation = AdvisorRecommendation

function getRecommendation(answers: Answers): Recommendation | null {
  if (!answers.situation || !answers.tokenTiming || !answers.feeModel) return null
  return getAdvisorRecommendation({
    situation: answers.situation,
    tokenTiming: answers.tokenTiming,
    feeModel: answers.feeModel,
  })
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
  const router = useRouter()

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

  // Sync answers to URL so recommendations are bookmarkable/shareable
  const updateAnswer = useCallback(<K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value }
      const params = new URLSearchParams()
      if (next.situation) params.set('situation', next.situation)
      if (next.tokenTiming) params.set('token', next.tokenTiming)
      if (next.feeModel) params.set('fee', next.feeModel)
      router.replace(`/advisor?${params.toString()}`, { scroll: false })
      return next
    })
  }, [router])

  const recommendation = getRecommendation(answers)
  const allAnswered = answers.situation && answers.tokenTiming && answers.feeModel

  const castText = recommendation
    ? [
        `just set up my creator split on Sparkz ⚡`,
        ``,
        `creator: ${recommendation.creatorPool}% · community pool: ${recommendation.communityPool}% · treasury: ${recommendation.treasury}%`,
        `ZAO stake: ${recommendation.zaoStake}% locked supply — not a fee slice`,
        ``,
        answers.tokenTiming === 'now'
          ? `launching with a token now`
          : answers.tokenTiming === 'never'
            ? `patronage-only — no token, ever`
            : `building first. token later, if ever.`,
        ``,
        `configure yours → sparkz.xyz/advisor?situation=${answers.situation}&token=${answers.tokenTiming}&fee=${answers.feeModel}`,
      ].join('\n')
    : ''

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
              onSelect={(v) => updateAnswer('situation', v)}
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
              onSelect={(v) => updateAnswer('tokenTiming', v)}
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
              onSelect={(v) => updateAnswer('feeModel', v)}
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
            <div className="text-xs text-slate-600 pt-1 space-y-0.5">
              <div>ZAO stake: {recommendation.zaoStake}% of token supply (not a fee slice)</div>
              {answers.situation === 'solo' && (
                <div className="text-slate-700">
                  Treasury = 1% community governance + 1% ZOL compute upkeep.{' '}
                  <a href="/settings" className="text-slate-500 hover:text-slate-400 underline transition-colors">
                    Bring your own key (BYOK)
                  </a>{' '}
                  <span className="text-slate-600">and the compute 1% folds back into your treasury.</span>
                </div>
              )}
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
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/split-wizard?communityPool=${recommendation.communityPool}&creatorPool=${recommendation.creatorPool}&treasury=${recommendation.treasury}&type=${answers.situation ?? 'solo'}`}
                className="btn-gold inline-block text-sm py-2 px-4"
              >
                Open split wizard →
              </Link>
              <Link
                href="/vetted"
                className="inline-block text-sm py-2 px-4 rounded-lg border border-zao-border text-slate-400 hover:text-gold-400 hover:border-gold-500/30 transition-colors"
              >
                🏅 Apply for ZAO vetting
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-slate-600">
              Starting point, not locked. Adjust in the split wizard. Deploy is always human.
            </p>
            {answers.situation && answers.tokenTiming && answers.feeModel && (
              <a
                href={`https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zao-violet hover:text-purple-300 transition-colors font-semibold flex-shrink-0"
              >
                Cast this result ↗
              </a>
            )}
          </div>

          {/* Related spark examples */}
          {answers.situation && RELATED_EXAMPLES[answers.situation] && (
            <div className="border-t border-zao-border pt-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                See it in action
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {RELATED_EXAMPLES[answers.situation].map((ex) => (
                  <Link
                    key={ex.slug}
                    href={`/examples/${ex.slug}`}
                    className="card-dark p-4 hover:border-gold-500/30 transition-colors block"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{ex.emoji}</span>
                      <span className="text-sm font-bold text-white">{ex.title}</span>
                    </div>
                    <p className="text-xs text-slate-500">{ex.tagline}</p>
                    <span className="text-xs text-gold-400 mt-2 inline-block">See example →</span>
                  </Link>
                ))}
              </div>
              <Link href="/examples" className="text-xs text-slate-600 hover:text-slate-400 transition-colors mt-3 inline-block">
                All spark templates →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
