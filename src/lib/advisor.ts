export type SituationType = 'crowdfund' | 'collab' | 'solo'
export type TokenTiming = 'now' | 'later' | 'never'
export type FeeModel = 'low' | 'medium' | 'high'

export type AdvisorAnswers = {
  situation: SituationType
  tokenTiming: TokenTiming
  feeModel: FeeModel
}

export type AdvisorRecommendation = {
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

const BASE_CONFIGS: Record<
  SituationType,
  Pick<AdvisorRecommendation, 'communityPool' | 'creatorPool' | 'treasury' | 'headline' | 'rationale'>
> = {
  crowdfund: {
    communityPool: 60,
    creatorPool: 15,
    treasury: 25,
    headline: 'Community-first: 60% to the people who showed up',
    rationale:
      'In a group crowdfund, the backers ARE the project. A 60% community pool signals that clearly — the treasury is a shared war chest for the project (proposals and votes are a v2 governance layer). The creator pool covers operations.',
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
    communityPool: 1,
    creatorPool: 97,
    treasury: 2,
    headline: 'Creator-first: you keep 97% — grow the community share as they show up',
    rationale:
      "The default is creator-first. You keep 97% of every fee; 1% is a floor for your community pool (leaderboard, boost program, or NFT holders — whoever shows up); 2% goes to treasury (1% community governance + 1% ZOL compute upkeep — bring your own key and the compute 1% folds back into your treasury). When real supporters start showing up consistently, move the community pool up from 1% to wherever it earns their loyalty. Don't give away share before the community exists.",
  },
}

const TOKEN_ADVICE: Record<TokenTiming, string> = {
  now: 'Launch with a token immediately — your community momentum and split config are ready. Deploy the 0xSplits contract first, then Clanker with that address as the fee recipient.',
  later:
    'Hold on the token and start tokenless: build your leaderboard, prove the boost engine, collect a few dozen real supporters. When you launch, the token backs existing momentum — not speculation.',
  never:
    'No token needed. Use the patronage tier system ($5/$25/$100 recurring) with Stripe. Patronage revenue flows through Stripe — set up 0xSplits separately if you want to split payouts between collaborators.',
}

const FEE_ADVICE_TEMPLATE: Record<FeeModel, (poolMin: string, poolMax: string | null) => string> = {
  low: (min, max) =>
    `At low volume ($1k–10k/day): community pool projected at ${min}${max ? `–${max}` : '+'}/week. Early stages — the value is community signal and fee transparency, not dollar amounts.`,
  medium: (min, max) =>
    `At medium volume ($10k–100k/day): community pool projected at ${min}${max ? `–${max}` : '+'}/week. Enough that top contributors start feeling it. Weekly receipts build the compounding trust loop.`,
  high: (min) =>
    `At high volume ($100k+/day): community pool projected at ${min}+/week. At this scale, the split contract becomes a significant on-chain revenue mechanism. ZAO stake starts mattering financially.`,
}

function getFeeAdvice(feeModel: FeeModel, communityPoolPct: number): string {
  const pct = communityPoolPct / 100
  const feeRate = 0.01
  const days = 7
  const ranges: Record<FeeModel, [number, number | null]> = {
    low: [1_000, 10_000],
    medium: [10_000, 100_000],
    high: [100_000, null],
  }
  const [minVol, maxVol] = ranges[feeModel]
  const fmt = (n: number) => n < 1 ? `$${n.toFixed(2)}` : `$${Math.round(n).toLocaleString()}`
  const poolMin = fmt(minVol * feeRate * pct * days)
  const poolMax = maxVol ? fmt(maxVol * feeRate * pct * days) : null
  return FEE_ADVICE_TEMPLATE[feeModel](poolMin, poolMax)
}

const SPLIT_WIZARD_HINTS: Record<SituationType, string> = {
  crowdfund: 'In the split wizard: choose "Group crowdfund" → add all backer wallets → set roles as "Backer"',
  collab: 'In the split wizard: choose "Collab / joint release" → add each artist + producer with their roles and %',
  solo: 'In the split wizard: choose "Solo artist" → one entry for you, one for your community pool wallet',
}

export function getAdvisorRecommendation(answers: AdvisorAnswers): AdvisorRecommendation {
  const base = BASE_CONFIGS[answers.situation]
  return {
    ...base,
    zaoStake: 5,
    tokenAdvice: TOKEN_ADVICE[answers.tokenTiming],
    feeAdvice: getFeeAdvice(answers.feeModel, base.communityPool),
    splitWizardHint: SPLIT_WIZARD_HINTS[answers.situation],
  }
}

export const SITUATION_VALUES: SituationType[] = ['crowdfund', 'collab', 'solo']
export const TOKEN_TIMING_VALUES: TokenTiming[] = ['now', 'later', 'never']
export const FEE_MODEL_VALUES: FeeModel[] = ['low', 'medium', 'high']

export function isValidAnswers(body: unknown): body is AdvisorAnswers {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    SITUATION_VALUES.includes(b.situation as SituationType) &&
    TOKEN_TIMING_VALUES.includes(b.tokenTiming as TokenTiming) &&
    FEE_MODEL_VALUES.includes(b.feeModel as FeeModel)
  )
}
