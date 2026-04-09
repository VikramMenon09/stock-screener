'use client'

import { cn } from '@/lib/utils'
import type { TechnicalIndicators, FundamentalMetrics } from '@/lib/types'
import {
  Activity,
  TrendingUp,
  BarChart3,
  DollarSign,
  Percent,
  Scale,
  Gauge,
} from 'lucide-react'

interface MetricsGridProps {
  technicals: TechnicalIndicators
  fundamentals: FundamentalMetrics
}

interface MetricCardProps {
  label: string
  value: string | number | null
  format?: 'number' | 'percent' | 'currency' | 'ratio'
  sentiment?: 'bullish' | 'bearish' | 'neutral'
  icon: React.ReactNode
  description?: string
}

function MetricCard({
  label,
  value,
  format = 'number',
  sentiment = 'neutral',
  icon,
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

  const sentimentColors = {
    bullish: 'text-signal-long',
    bearish: 'text-signal-short',
    neutral: 'text-foreground',
  }

  return (
    <div className="glass-subtle rounded-xl p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-muted-foreground">{icon}</div>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className={cn('text-xl font-bold font-mono', sentimentColors[sentiment])}>
        {formatValue()}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
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
    <div className="space-y-6">
      {/* Technical Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Technical Indicators
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="RSI (14)"
            value={technicals.rsi14}
            icon={<Gauge className="h-4 w-4" />}
            sentiment={getRsiSentiment(technicals.rsi14)}
            description={
              technicals.rsi14 < 30
                ? 'Oversold'
                : technicals.rsi14 > 70
                ? 'Overbought'
                : 'Neutral zone'
            }
          />
          <MetricCard
            label="SMA 20"
            value={technicals.sma20}
            format="currency"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <MetricCard
            label="SMA 50"
            value={technicals.sma50}
            format="currency"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <MetricCard
            label="SMA 200"
            value={technicals.sma200}
            format="currency"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <MetricCard
            label="MACD"
            value={technicals.macd}
            icon={<BarChart3 className="h-4 w-4" />}
            sentiment={technicals.macd > 0 ? 'bullish' : 'bearish'}
          />
          <MetricCard
            label="MACD Signal"
            value={technicals.macdSignal}
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <MetricCard
            label="BB Upper"
            value={technicals.bollingerUpper}
            format="currency"
            icon={<Activity className="h-4 w-4" />}
          />
          <MetricCard
            label="BB Lower"
            value={technicals.bollingerLower}
            format="currency"
            icon={<Activity className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Fundamental Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Fundamental Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="P/E Ratio"
            value={fundamentals.peRatio}
            format="ratio"
            icon={<Scale className="h-4 w-4" />}
            sentiment={getPeSentiment(fundamentals.peRatio)}
          />
          <MetricCard
            label="P/B Ratio"
            value={fundamentals.pbRatio}
            format="ratio"
            icon={<Scale className="h-4 w-4" />}
          />
          <MetricCard
            label="ROE"
            value={fundamentals.roe}
            format="percent"
            icon={<Percent className="h-4 w-4" />}
            sentiment={getRoeSentiment(fundamentals.roe)}
          />
          <MetricCard
            label="ROA"
            value={fundamentals.roa}
            format="percent"
            icon={<Percent className="h-4 w-4" />}
          />
          <MetricCard
            label="Debt/Equity"
            value={fundamentals.debtToEquity}
            format="ratio"
            icon={<Scale className="h-4 w-4" />}
            sentiment={getDebtSentiment(fundamentals.debtToEquity)}
          />
          <MetricCard
            label="Current Ratio"
            value={fundamentals.currentRatio}
            format="ratio"
            icon={<Scale className="h-4 w-4" />}
          />
          <MetricCard
            label="Revenue Growth"
            value={fundamentals.revenueGrowth}
            format="percent"
            icon={<TrendingUp className="h-4 w-4" />}
            sentiment={getGrowthSentiment(fundamentals.revenueGrowth)}
          />
          <MetricCard
            label="Net Margin"
            value={fundamentals.netMargin}
            format="percent"
            icon={<Percent className="h-4 w-4" />}
            sentiment={getMarginSentiment(fundamentals.netMargin)}
          />
        </div>
      </div>
    </div>
  )
}
