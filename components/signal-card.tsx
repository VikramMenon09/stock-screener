'use client'

import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Signal, StockQuote } from '@/lib/types'
import { ConfidenceGauge } from './confidence-gauge'

interface SignalCardProps {
  symbol: string
  name: string
  signal: Signal
  confidence: number
  confidenceLabel: 'Low' | 'Medium' | 'High'
  score: number
  quote: StockQuote
}

export function SignalCard({
  symbol,
  name,
  signal,
  confidence,
  confidenceLabel,
  score,
  quote,
}: SignalCardProps) {
  const signalConfig = {
    LONG: {
      label: 'LONG',
      color: 'text-signal-long',
      bgColor: 'bg-signal-long/10',
      borderColor: 'border-signal-long/30',
      glowClass: 'glow-long',
      Icon: TrendingUp,
    },
    SHORT: {
      label: 'SHORT',
      color: 'text-signal-short',
      bgColor: 'bg-signal-short/10',
      borderColor: 'border-signal-short/30',
      glowClass: 'glow-short',
      Icon: TrendingDown,
    },
    NEUTRAL: {
      label: 'NEUTRAL',
      color: 'text-signal-neutral',
      bgColor: 'bg-signal-neutral/10',
      borderColor: 'border-signal-neutral/30',
      glowClass: 'glow-neutral',
      Icon: Minus,
    },
  }

  const config = signalConfig[signal]
  const isPositive = quote.changePercent >= 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`
    return `$${cap.toFixed(0)}`
  }

  return (
    <div
      className={cn(
        'glass rounded-2xl p-6 border-2',
        config.borderColor,
        config.glowClass,
        'transition-all duration-500'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-foreground">{symbol}</h2>
            <div
              className={cn(
                'flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold',
                config.bgColor,
                config.color
              )}
            >
              <config.Icon className="h-4 w-4" />
              {config.label}
            </div>
          </div>
          <p className="text-muted-foreground text-sm">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground font-mono">
            {formatPrice(quote.price)}
          </p>
          <div
            className={cn(
              'flex items-center justify-end gap-1 text-sm font-medium',
              isPositive ? 'text-signal-long' : 'text-signal-short'
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {quote.changePercent.toFixed(2)}%
            </span>
            <span className="text-muted-foreground">
              ({isPositive ? '+' : ''}
              {formatPrice(quote.change)})
            </span>
          </div>
        </div>
      </div>

      {/* Confidence Gauge */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <ConfidenceGauge
          confidence={confidence}
          signal={signal}
          score={score}
        />
        <div
          className={cn(
            'px-3 py-0.5 rounded-full text-xs font-semibold border',
            confidenceLabel === 'High'
              ? 'bg-signal-long/10 border-signal-long/30 text-signal-long'
              : confidenceLabel === 'Medium'
              ? 'bg-signal-neutral/10 border-signal-neutral/30 text-signal-neutral'
              : 'bg-muted/50 border-border text-muted-foreground'
          )}
        >
          {confidenceLabel} Confidence
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
          <p className="text-sm font-semibold text-foreground">
            {formatMarketCap(quote.marketCap)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">P/E Ratio</p>
          <p className="text-sm font-semibold text-foreground">
            {quote.pe ? quote.pe.toFixed(1) : 'N/A'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">52W High</p>
          <p className="text-sm font-semibold text-foreground">
            {formatPrice(quote.high52Week)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">52W Low</p>
          <p className="text-sm font-semibold text-foreground">
            {formatPrice(quote.low52Week)}
          </p>
        </div>
      </div>
    </div>
  )
}
