import { ImageResponse } from 'next/og'

export const alt = 'Stock Screener'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Light research palette from app/globals.css (OKLCH tokens converted to hex,
// since next/og can't read CSS variables or load next/font).
const colors = {
  background: '#fafaf9',
  foreground: '#181b1e',
  muted: '#66696e',
  border: '#e2e1de',
  borderStrong: '#cbcac7',
  long: '#007748',
  short: '#ba362e',
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: colors.background,
          color: colors.foreground,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
          <svg width="40" height="40" viewBox="0 0 18 18">
            <rect width="18" height="18" rx="3" fill={colors.foreground} />
            <rect x="4" y="9" width="2" height="5" fill="#ffffff" />
            <rect x="8" y="6" width="2" height="8" fill="#ffffff" />
            <rect x="12" y="4" width="2" height="10" fill="#ffffff" />
          </svg>
          Stock Screener
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 68, fontWeight: 600, lineHeight: 1.1, letterSpacing: -1.5 }}>
            Long, short or neutral on any stock
          </div>
          <div style={{ fontSize: 30, color: colors.muted, marginTop: 24 }}>
            Signal, confidence score and the analysis behind it.
          </div>
        </div>

        {/* Short / neutral / long band, as on the methodology panel */}
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${colors.border}`, paddingTop: 28 }}>
          <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ width: '35%', background: colors.short }} />
            <div style={{ width: '30%', background: colors.borderStrong }} />
            <div style={{ width: '35%', background: colors.long }} />
          </div>
          <div style={{ display: 'flex', marginTop: 14, fontSize: 22, fontWeight: 600 }}>
            <div style={{ width: '35%', color: colors.short }}>Short</div>
            <div style={{ width: '30%', color: colors.muted, justifyContent: 'center', display: 'flex' }}>Neutral</div>
            <div style={{ width: '35%', color: colors.long, justifyContent: 'flex-end', display: 'flex' }}>Long</div>
          </div>
        </div>
      </div>
    ),
    size
  )
}
