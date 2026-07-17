import { NextRequest, NextResponse } from 'next/server'
import { isValidAnswers, getAdvisorRecommendation } from '@/lib/advisor'

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

  const recommendation = getAdvisorRecommendation(body)
  return NextResponse.json({ recommendation })
}
