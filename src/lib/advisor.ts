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
      "The default is creator-first. You keep 97% of every fee; 1% goes to the community treasury (yours to govern); 1% goes to ZOL compute upkeep (or bring your own AI key and that 1% stays in treasury too). When real supporters start showing up — a leaderboard, a boost program, NFT holders — move community pool up from 1% to wherever it earns their loyalty. Don't give away share before the community exists.",
  },
}

const TOKEN_ADVICE: Record<TokenTiming, string> = {
  now: 'Launch with a token immediately — your community momentum and split config are ready. Deploy the 0xSplits contract first, then Clanker with that address as the fee recipient.',
  later:
    'Hold on the token and start tokenless: build your leaderboard, prove the boost engine, collect a few dozen real supporters. When you launch, the token backs existing momentum — not speculation.',
  never:
    'No token needed. Use the patronage tier system ($5/$25/$100 recurring) with Stripe. Patronage revenue flows through Stripe — set up 0xSplits separately if you want to split payouts between collaborators.',
}

const FEE_ADVICE: Record<FeeModel, string> = {
  low: 'At low volume ($1k–10k/day): community pool generates $35–350/week. This is early stages — the value is community signal and fee transparency, not dollar amounts.',
  medium:
    'At medium volume ($10k–100k/day): community pool generates $350–3,500/week. Enough that top contributors feel it. Weekly receipts build the compounding trust loop.',
  high: 'At high volume ($100k+/day): community pool generates $3,500+/week. At this scale, the split contract becomes a significant on-chain revenue mechanism. ZAO stake starts mattering financially.',
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
    feeAdvice: FEE_ADVICE[answers.feeModel],
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
