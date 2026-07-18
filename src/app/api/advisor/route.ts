import { NextRequest, NextResponse } from 'next/server'
import { isValidAnswers, getAdvisorRecommendation, type AdvisorAnswers, type AdvisorRecommendation } from '@/lib/advisor'

async function callClaudeAdvisor(apiKey: string, answers: AdvisorAnswers): Promise<AdvisorRecommendation | null> {
  const situationMap = {
    crowdfund: 'Group crowdfund — a community backs a shared project (album, event, collab)',
    collab: 'Artist collaboration or joint release — two or more artists with shared stakes',
    solo: 'Solo artist with producers — primarily your project, rewarding community + collaborators',
  }
  const tokenMap = {
    now: 'Launch a token now — community momentum and split config are ready',
    later: 'Build first, token later — prove the leaderboard and backing before tokenizing',
    never: 'No token — patronage-only ($5/$25/$100 recurring tiers via Stripe + 0xSplits)',
  }
  const feeMap = {
    low: 'Early stage ($1k–10k/day trading volume)',
    medium: 'Growing ($10k–100k/day trading volume)',
    high: 'At scale ($100k+/day trading volume)',
  }

  const prompt = `You are the Sparkz split advisor. A creator answered 3 questions about their project:

1. Situation: ${situationMap[answers.situation]}
2. Token timing: ${tokenMap[answers.tokenTiming]}
3. Volume stage: ${feeMap[answers.feeModel]}

Sparkz uses 0xSplits (fee split contract) wired to a Clanker token (1% fee tier). ZAO takes a 5% locked token STAKE — not a fee slice.

Default splits by situation:
- solo: communityPool=1, creatorPool=97, treasury=2
- collab: communityPool=50, creatorPool=30, treasury=20
- crowdfund: communityPool=60, creatorPool=15, treasury=25

Respond with ONLY a JSON object (no markdown, no explanation outside the JSON) matching this exact shape:
{
  "communityPool": <number 0-100>,
  "creatorPool": <number 0-100>,
  "treasury": <number 0-100>,
  "zaoStake": 5,
  "headline": "<one sentence, specific to their situation>",
  "rationale": "<2-3 sentences explaining the split choice — concrete, not generic>",
  "tokenAdvice": "<1-2 sentences on their specific token timing choice>",
  "feeAdvice": "<1-2 sentences on expected earnings at their volume stage — use actual $ ranges>",
  "splitWizardHint": "<one sentence: what to choose/add first in the split wizard>"
}

Rules:
- communityPool + creatorPool + treasury must equal 100 exactly
- Be specific to their situation, not generic
- Legal-safe: no investment promises, no guaranteed earnings, use "projected" or "estimated"
- Framing: "back the work", not "buy a coin"; "fee share", not "passive income"`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    const text = data?.content?.[0]?.text
    if (!text) return null

    const parsed = JSON.parse(text)
    if (
      typeof parsed.communityPool === 'number' &&
      typeof parsed.creatorPool === 'number' &&
      typeof parsed.treasury === 'number' &&
      parsed.communityPool + parsed.creatorPool + parsed.treasury === 100 &&
      typeof parsed.headline === 'string' &&
      typeof parsed.rationale === 'string'
    ) {
      return { ...parsed, zaoStake: 5 } as AdvisorRecommendation
    }
  } catch {
    // Fall through to deterministic
  }
  return null
}

export async function POST(req: NextRequest) {
  const relayKey = process.env.VINIAPP_RELAY_KEY
  if (relayKey) {
    const authHeader = req.headers.get('x-relay-key')
    if (authHeader !== relayKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!isValidAnswers(body)) {
    return NextResponse.json(
      {
        error: 'Invalid answers',
        expected: {
          situation: ['crowdfund', 'collab', 'solo'],
          tokenTiming: ['now', 'later', 'never'],
          feeModel: ['low', 'medium', 'high'],
        },
      },
      { status: 400 },
    )
  }

  const anthropicKey = req.headers.get('x-anthropic-key')
  if (anthropicKey && anthropicKey.startsWith('sk-ant-')) {
    const llmRec = await callClaudeAdvisor(anthropicKey, body)
    if (llmRec) {
      return NextResponse.json({ recommendation: llmRec, source: 'llm' })
    }
  }

  const recommendation = getAdvisorRecommendation(body)
  return NextResponse.json({ recommendation, source: 'deterministic' })
}
