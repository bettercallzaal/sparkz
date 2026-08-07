import { type NextRequest, NextResponse } from 'next/server'
import { isValidAnswers, getAdvisorRecommendation } from '@/lib/advisor'

// POST /api/advisor
//
// 3-question split advisor for Sparkz. Used by Viniapp and other AI agent
// integrations. Optional VINIAPP_RELAY_KEY env var gates relay access.
//
// Body: { situation: 'solo'|'collab'|'crowdfund', tokenTiming: 'now'|'later'|'never', feeModel: 'low'|'medium'|'high' }
// Returns: { recommendation: AdvisorRecommendation }
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
          situation: ['solo', 'collab', 'crowdfund'],
          tokenTiming: ['now', 'later', 'never'],
          feeModel: ['low', 'medium', 'high'],
        },
      },
      { status: 400 },
    )
  }

  const recommendation = getAdvisorRecommendation(body)
  return NextResponse.json({ recommendation })
}
