'use client'

import type { TechnicalIndicators, FundamentalMetrics } from '@/lib/types'
import { SentimentMark } from './sentiment-mark'

interface MetricsGridProps {
  technicals: TechnicalIndicators
  fundamentals: FundamentalMetrics
}

interface MetricCardProps {
  label: string
  value: string | number | null
  format?: 'number' | 'percent' | 'currency' | 'ratio'
  sentiment?: 'bullish' | 'bearish' | 'neutral'
  description?: string
}

function MetricCard({
  label,
  value,
  format = 'number',
  sentiment = 'neutral',
  description,
}: MetricCardProps) {
  const formatValue = () => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'string') return value
    
    switch (format) {
      case 'percent':
        return `${value.toFixed(1)}%`
      case 'currency':
        return `$${value.toFixed(2)}`
      case 'ratio':
        return `${value.toFixed(2)}x`
      default:
        return value.toFixed(2)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2 text-[13px]">
      <dt className="flex min-w-0 items-center gap-2 text-muted-foreground">
        <span className="truncate">{label}</span>
        {description && <span className="text-[12px] text-muted-foreground/80">· {description}</span>}
      </dt>
      <dd className="flex shrink-0 items-center gap-2 font-medium text-foreground">
        {formatValue()}
        {sentiment === 'neutral' ? (
          <span className="w-2" aria-hidden="true" />
        ) : (
          <SentimentMark sentiment={sentiment} />
        )}
      </dd>
    </div>
  )
}

export function MetricsGrid({ technicals, fundamentals }: MetricsGridProps) {
  // Determine sentiments based on values
  const getRsiSentiment = (rsi: number) => {
    if (rsi < 30) return 'bullish'
    if (rsi > 70) return 'bearish'
    return 'neutral'
  }

  const getPeSentiment = (pe: number | null) => {
    if (pe === null) return 'neutral'
    if (pe < 15) return 'bullish'
    if (pe > 30) return 'bearish'
    return 'neutral'
  }

  const getRoeSentiment = (roe: number | null) => {
    if (roe === null) return 'neutral'
    if (roe > 20) return 'bullish'
    if (roe < 10) return 'bearish'
    return 'neutral'
  }

  const getDebtSentiment = (de: number | null) => {
    if (de === null) return 'neutral'
    if (de < 0.5) return 'bullish'
    if (de > 2) return 'bearish'
    return 'neutral'
  }

  const getGrowthSentiment = (growth: number | null) => {
    if (growth === null) return 'neutral'
    if (growth > 15) return 'bullish'
    if (growth < 0) return 'bearish'
    return 'neutral'
  }

  const getMarginSentiment = (margin: number | null) => {
    if (margin === null) return 'neutral'
    if (margin > 15) return 'bullish'
    if (margin < 5) return 'bearish'
    return 'neutral'
  }

  return (
    <>
      <section aria-labelledby="technicals-heading">
        <h2
          id="technicals-heading"
          className="border-b border-border-strong pb-2 text-[13px] font-semibold text-foreground"
        >
          Technical indicators
        </h2>
        <dl className="divide-y divide-border">
          <MetricCard
            label="RSI (14)"
            value={technicals.rsi14}
            sentiment={getRsiSentiment(technicals.rsi14)}
            description={
              technicals.rsi14 < 30
                ? 'Oversold'
                : technicals.rsi14 > 70
                ? 'Overbought'
                : 'Neutral zone'
            }
          />
          <MetricCard label="SMA 20" value={technicals.sma20} format="currency" />
          <MetricCard label="SMA 50" value={technicals.sma50} format="currency" />
          <MetricCard label="SMA 200" value={technicals.sma200} format="currency" />
          <MetricCard
            label="MACD"
            value={technicals.macd}
            sentiment={technicals.macd > 0 ? 'bullish' : 'bearish'}
          />
          <MetricCard label="MACD signal" value={technicals.macdSignal} />
          <MetricCard label="Bollinger upper" value={technicals.bollingerUpper} format="currency" />
          <MetricCard label="Bollinger lower" value={technicals.bollingerLower} format="currency" />
        </dl>
      </section>

      <section aria-labelledby="fundamentals-heading">
        <h2
          id="fundamentals-heading"
          className="border-b border-border-strong pb-2 text-[13px] font-semibold text-foreground"
        >
          Fundamentals
        </h2>
        <dl className="divide-y divide-border">
          <MetricCard
            label="P/E ratio"
            value={fundamentals.peRatio}
            format="ratio"
            sentiment={getPeSentiment(fundamentals.peRatio)}
          />
          <MetricCard label="P/B ratio" value={fundamentals.pbRatio} format="ratio" />
          <MetricCard
            label="Return on equity"
            value={fundamentals.roe}
            format="percent"
            sentiment={getRoeSentiment(fundamentals.roe)}
          />
          <MetricCard label="Return on assets" value={fundamentals.roa} format="percent" />
          <MetricCard
            label="Debt to equity"
            value={fundamentals.debtToEquity}
            format="ratio"
            sentiment={getDebtSentiment(fundamentals.debtToEquity)}
          />
          <MetricCard label="Current ratio" value={fundamentals.currentRatio} format="ratio" />
          <MetricCard
            label="Revenue growth"
            value={fundamentals.revenueGrowth}
            format="percent"
            sentiment={getGrowthSentiment(fundamentals.revenueGrowth)}
          />
          <MetricCard
            label="Net margin"
            value={fundamentals.netMargin}
            format="percent"
            sentiment={getMarginSentiment(fundamentals.netMargin)}
          />
        </dl>
      </section>
    </>
  )
}
