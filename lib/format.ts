// Display formatters shared by the UI components. Presentation only.

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPrice(value: number): string {
  return usd.format(value)
}

export function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`
  return `$${cap.toFixed(0)}`
}

export function formatVolume(volume: number): string {
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`
  return volume.toString()
}

/** Signed number with a true minus sign, e.g. "+2.69" / "−0.74". */
export function signed(value: number, digits = 2): string {
  const abs = Math.abs(value).toFixed(digits)
  return `${value >= 0 ? '+' : '−'}${abs}`
}
