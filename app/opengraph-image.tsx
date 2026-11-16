import { ImageResponse } from 'next/og'

export const alt = 'Stock Screener'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#0f1014', color: '#f2f2f2', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, color: '#2dd4a0', fontSize: 32 }}>
          <svg width="48" height="48" viewBox="0 0 64 64">
            <path d="M12 44l14-14 9 9 17-19" fill="none" stroke="#2dd4a0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Stock Screener
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, marginTop: 32, lineHeight: 1.1 }}>
          Long, short or neutral on any stock
        </div>
        <div style={{ fontSize: 30, color: '#a3a3a3', marginTop: 28 }}>
          Signal, confidence score and the analysis behind it.
        </div>
      </div>
    ),
    size
  )
}
