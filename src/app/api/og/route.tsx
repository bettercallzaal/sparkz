import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Sparkz'
  const sub = searchParams.get('sub') ?? 'Start with a spark, not a token.'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0a0a14',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(245,158,11,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        {/* Wordmark */}
        <div
          style={{
            fontSize: '96px',
            fontWeight: 900,
            letterSpacing: '-4px',
            display: 'flex',
          }}
        >
          <span style={{ color: '#f59e0b' }}>SPAR</span>
          <span style={{ color: '#ffffff' }}>KZ</span>
        </div>
        {/* Title */}
        <div
          style={{
            fontSize: title.length > 30 ? '32px' : '42px',
            fontWeight: 700,
            color: '#ffffff',
            marginTop: '16px',
            maxWidth: '900px',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        {/* Sub */}
        <div
          style={{
            fontSize: '22px',
            color: '#94a3b8',
            marginTop: '16px',
            maxWidth: '700px',
            textAlign: 'center',
          }}
        >
          {sub}
        </div>
        {/* Badge */}
        <div
          style={{
            marginTop: '40px',
            padding: '8px 20px',
            border: '1px solid rgba(245,158,11,0.4)',
            borderRadius: '999px',
            color: '#f59e0b',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          ✦ No token required to get started
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
