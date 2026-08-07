import { ImageResponse } from 'next/og'

export const alt = 'OddsLoom — Find the edge before it moves'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          color: '#f1f2ed',
          background: '#0a0b0a',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 28, fontWeight: 800, letterSpacing: 3 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 38 }}>
            <div style={{ width: 9, height: 20, background: '#d8ff46' }} />
            <div style={{ width: 9, height: 38, background: '#d8ff46' }} />
            <div style={{ width: 9, height: 28, background: '#d8ff46' }} />
          </div>
          ODDSLOOM
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#d8ff46', fontSize: 18, letterSpacing: 4, marginBottom: 22 }}>
            DATA-BACKED PICKS. NO NOISE.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 86, lineHeight: .98, fontWeight: 800, letterSpacing: -5 }}>
            <div style={{ display: 'flex' }}>Find the edge</div>
            <div style={{ display: 'flex' }}>before it&nbsp;<span style={{ color: '#d8ff46' }}>moves.</span></div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8d9188', fontSize: 20 }}>
          <span>Sharp data. Clear decisions.</span>
          <span style={{ color: '#d8ff46' }}>ODDSLOOM.COM →</span>
        </div>
      </div>
    ),
    size,
  )
}
