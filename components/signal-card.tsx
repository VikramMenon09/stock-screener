'use client'

import { cn } from '@/lib/utils'
import { formatMarketCap, formatPrice, formatVolume, signed } from '@/lib/format'
import type { RiskFlag, Signal, StockQuote } from '@/lib/types'
import { ConfidenceGauge } from './confidence-gauge'

interface SignalCardProps {
  symbol: string
  name: string
  signal: Signal
  confidence: number
  confidenceLabel: 'Low' | 'Medium' | 'High'
  score: number
  quote: StockQuote
  riskFlags?: RiskFlag[]
}

function Stat({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('py-3 pr-4 lg:px-4 lg:first:pl-0 lg:last:pr-0', className)}>
      <div className="label-caps">{label}</div>
      <div className="mt-1 whitespace-nowrap text-[15px] font-medium text-foreground">{children}</div>
    </div>
  )
}

export function SignalCard({
  symbol,
  name,
  signal,
  confidence,
  confidenceLabel,
  score,
  quote,
  riskFlags,
}: SignalCardProps) {
  const isPositive = quote.changePercent >= 0
  const dataFlag = riskFlags?.find((f) => f.type === 'data')

  const rangeSpan = quote.high52Week - quote.low52Week
  const rangePos = rangeSpan > 0
    ? Math.max(0, Math.min(100, ((quote.price - quote.low52Week) / rangeSpan) * 100))
    : 50
  const relVolume = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : null

  return (
    <section aria-label={`${symbol} summary`}>
      <div className="flex flex-col gap-8 pb-7 md:flex-row md:items-start md:justify-between">
        {/* Identity and price */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-[30px] font-semibold leading-9 tracking-tight text-foreground">{symbol}</h1>
            <span className="truncate text-[15px] text-muted-foreground">{name}</span>
            {dataFlag && (
              <span
                title={dataFlag.description}
                className="inline-flex items-center gap-1.5 rounded-sm border border-border-strong bg-card px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground cursor-default"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" aria-hidden="true" />
                {dataFlag.label}
              </span>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[40px] font-medium leading-none tracking-tight text-foreground">
              {formatPrice(quote.price)}
            </span>
            <span
              className={cn(
                'text-[16px] font-medium',
                isPositive ? 'text-signal-long' : 'text-signal-short'
              )}
            >
              {signed(quote.change)} ({signed(quote.changePercent)}%)
            </span>
            <span className="text-[12px] text-muted-foreground">Today</span>
          </div>
        </div>

        {/* The call */}
        <div className="w-full md:max-w-[400px] md:border-l md:border-border md:pl-8">
          <ConfidenceGauge
            confidence={confidence}
            signal={signal}
            score={score}
            confidenceLabel={confidenceLabel}
          />
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 border-y border-border sm:grid-cols-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.7fr)_minmax(0,1.1fr)_minmax(0,1.35fr)_minmax(0,2fr)] lg:divide-x lg:divide-border">
        <Stat label="Market cap">{formatMarketCap(quote.marketCap)}</Stat>
        <Stat label="P/E ratio">{quote.pe ? quote.pe.toFixed(1) : 'N/A'}</Stat>
        <Stat label="Volume">
          {formatVolume(quote.volume)}
          {relVolume !== null && (
            <span className="ml-1.5 text-[12px] font-normal text-muted-foreground">{relVolume.toFixed(1)}x avg</span>
          )}
        </Stat>
        <Stat label="Day range">
          {formatPrice(quote.dayLow)} &ndash; {formatPrice(quote.dayHigh)}
        </Stat>
        <Stat label="52-week range" className="col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <span>{formatPrice(quote.low52Week)}</span>
            <div className="relative h-1 flex-1 rounded-full bg-border-strong/70" aria-hidden="true">
              <div
                className="absolute top-1/2 h-2.5 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
                style={{ left: `${rangePos}%` }}
              />
            </div>
            <span>{formatPrice(quote.high52Week)}</span>
          </div>
        </Stat>
      </div>
    </section>
  )
}
