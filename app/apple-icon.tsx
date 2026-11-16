import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Same mark as the header wordmark: an ink square with three rising bars.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#181b1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="140" height="140" viewBox="0 0 64 64">
          <rect x="14" y="32" width="8" height="18" fill="#ffffff" />
          <rect x="28" y="21" width="8" height="29" fill="#ffffff" />
          <rect x="42" y="14" width="8" height="36" fill="#ffffff" />
        </svg>
      </div>
    ),
    size
  )
}
