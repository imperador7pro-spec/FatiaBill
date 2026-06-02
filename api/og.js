import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

// Dynamic OG image for social previews (WhatsApp, Twitter, LinkedIn, etc.)
// Free on Vercel Edge — accept query params ?title= and ?subtitle= to vary the card
// per landing/blog page later.
//
// Default usage: <meta property="og:image" content="https://fatiabill.ch/api/og" />

export default function handler(req) {
  const url = new URL(req.url);
  const title = (url.searchParams.get('title') || 'Le copilote de vos finances').slice(0, 100);
  const subtitle = (url.searchParams.get('subtitle')
    || 'Budget, fiscalité cantonale, coach IA — pour particuliers et indépendants en Suisse.').slice(0, 200);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #f0fdfa 100%)',
          padding: '64px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top: logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 'auto' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 36,
              fontWeight: 900,
              fontStyle: 'italic',
            }}
          >
            F
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            FatiaBill
          </div>
        </div>

        {/* Center: headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 'auto', marginTop: 'auto' }}>
          <div
            style={{
              fontSize: 70,
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 26, color: '#475569', lineHeight: 1.4, maxWidth: 880 }}>
            {subtitle}
          </div>
        </div>

        {/* Bottom: badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 'auto' }}>
          <div
            style={{
              padding: '10px 18px',
              background: '#10b981',
              color: 'white',
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            Conçu en Suisse 🇨🇭
          </div>
          <div
            style={{
              padding: '10px 18px',
              background: '#ffffff',
              border: '2px solid #d1d5db',
              color: '#0f172a',
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            14 jours gratuits · sans CB
          </div>
          <div
            style={{
              marginLeft: 'auto',
              fontSize: 18,
              color: '#64748b',
              fontWeight: 600,
            }}
          >
            fatiabill.ch
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  );
}
