import { cn } from '@/lib/utils'

type Sentiment = 'bullish' | 'bearish' | 'neutral'

const labels: Record<Sentiment, string> = {
  bullish: 'Bullish',
  bearish: 'Bearish',
  neutral: 'Neutral',
}

/** Small directional marker: up triangle (bullish), down triangle (bearish), dash (neutral). */
export function SentimentMark({ sentiment, className }: { sentiment: Sentiment; className?: string }) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      role="img"
      aria-label={labels[sentiment]}
      className={cn(
        'shrink-0',
        sentiment === 'bullish' && 'fill-signal-long',
        sentiment === 'bearish' && 'fill-signal-short',
        sentiment === 'neutral' && 'fill-muted-foreground/60',
        className
      )}
    >
      {sentiment === 'bullish' && <path d="M4 1 L7.5 7 L0.5 7 Z" />}
      {sentiment === 'bearish' && <path d="M0.5 1 L7.5 1 L4 7 Z" />}
      {sentiment === 'neutral' && <rect x="1" y="3.25" width="6" height="1.5" rx="0.75" />}
    </svg>
  )
}
