'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice, formatVolume, signed } from '@/lib/format'
import type { TopGainer } from '@/lib/types'

interface TopGainersScannerProps {
  onSelectStock: (symbol: string) => void
  /** "table" = full-width table on the home page, "rail" = compact sidebar list */
  variant?: 'table' | 'rail'
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center justify-end gap-2.5">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-border" aria-hidden="true">
        <div
          className={cn('h-full rounded-full', score >= 70 ? 'bg-signal-short' : 'bg-foreground/45')}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
      <span className={cn('w-6 text-right font-medium', score >= 70 ? 'text-signal-short' : 'text-foreground')}>
        {score}
      </span>
    </div>
  )
}

export function TopGainersScanner({ onSelectStock, variant = 'rail' }: TopGainersScannerProps) {
  const [gainers, setGainers] = useState<TopGainer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchGainers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/top-gainers')
      const data = await response.json()
      setGainers(data.gainers || [])
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch top gainers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGainers()
    // Refresh every 5 minutes
    const interval = setInterval(fetchGainers, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const isTable = variant === 'table'

  const header = (
    <div className={cn('flex items-end justify-between gap-4 border-b border-border', isTable ? 'pb-3' : 'pb-2.5')}>
      <div>
        <h2 className={cn('font-semibold text-foreground', isTable ? 'text-[15px]' : 'text-[14px]')}>
          Short candidates
        </h2>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          {isTable ? "Today's top gainers, ranked by short score" : 'Top gainers by short score'}
        </p>
      </div>
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        {lastUpdated && isTable && <span>Updated {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>}
        <button
          type="button"
          onClick={fetchGainers}
          disabled={isLoading}
          aria-label="Refresh short candidates"
          className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
        </button>
      </div>
    </div>
  )

  if (isTable) {
    const cols = 'grid grid-cols-[28px_72px_minmax(0,1fr)_96px_80px_72px_120px] items-center gap-x-3'
    return (
      <section aria-label="Short candidates">
        {header}
        <div className={cn(cols, 'label-caps h-9 border-b border-border')}>
          <span>#</span>
          <span>Symbol</span>
          <span>Company</span>
          <span className="text-right">Last</span>
          <span className="text-right">Change</span>
          <span className="text-right">Volume</span>
          <span className="text-right">Short score</span>
        </div>
        <div className="divide-y divide-border border-b border-border">
          {isLoading && gainers.length === 0
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={cn(cols, 'h-10 animate-pulse')}>
                  <div className="h-3 w-3 rounded-sm bg-secondary" />
                  <div className="h-3 w-12 rounded-sm bg-secondary" />
                  <div className="h-3 w-40 rounded-sm bg-secondary" />
                  <div className="ml-auto h-3 w-14 rounded-sm bg-secondary" />
                  <div className="ml-auto h-3 w-12 rounded-sm bg-secondary" />
                  <div className="ml-auto h-3 w-10 rounded-sm bg-secondary" />
                  <div className="ml-auto h-3 w-20 rounded-sm bg-secondary" />
                </div>
              ))
            : gainers.map((g, index) => (
                <button
                  key={g.symbol}
                  type="button"
                  onClick={() => onSelectStock(g.symbol)}
                  className={cn(cols, 'h-10 w-full text-left text-[13px] transition-colors hover:bg-secondary/70 focus-visible:bg-secondary focus-visible:outline-none')}
                >
                  <span className="text-muted-foreground">{index + 1}</span>
                  <span className="font-semibold text-foreground">{g.symbol}</span>
                  <span className="truncate text-muted-foreground">{g.name}</span>
                  <span className="text-right text-foreground">{formatPrice(g.price)}</span>
                  <span className="text-right font-medium text-signal-long">{signed(g.changePercent)}%</span>
                  <span className="text-right text-muted-foreground">{formatVolume(g.volume)}</span>
                  <ScoreBar score={g.shortScore} />
                </button>
              ))}
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">
          Short score rates how extended each move is, from the day's gain, trading volume and price level. Select a row to analyze it.
        </p>
      </section>
    )
  }

  return (
    <section aria-label="Short candidates">
      {header}
      <div className="label-caps grid grid-cols-[minmax(0,1fr)_auto_44px] gap-x-3 py-2">
        <span>Symbol</span>
        <span className="text-right">Last</span>
        <span className="text-right">Score</span>
      </div>
      <div className="divide-y divide-border border-y border-border">
        {isLoading && gainers.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex h-[52px] animate-pulse items-center justify-between">
                <div className="space-y-1.5">
                  <div className="h-3 w-12 rounded-sm bg-secondary" />
                  <div className="h-2.5 w-24 rounded-sm bg-secondary" />
                </div>
                <div className="h-3 w-16 rounded-sm bg-secondary" />
              </div>
            ))
          : gainers.map((g) => (
              <button
                key={g.symbol}
                type="button"
                onClick={() => onSelectStock(g.symbol)}
                className="grid h-[52px] w-full grid-cols-[minmax(0,1fr)_auto_44px] items-center gap-x-3 text-left text-[13px] transition-colors hover:bg-secondary/70 focus-visible:bg-secondary focus-visible:outline-none"
              >
                <span className="min-w-0">
                  <span className="block font-semibold leading-5 text-foreground">{g.symbol}</span>
                  <span className="block truncate text-[12px] leading-4 text-muted-foreground">{g.name}</span>
                </span>
                <span className="text-right">
                  <span className="block leading-5 text-foreground">{formatPrice(g.price)}</span>
                  <span className="block text-[12px] leading-4 text-signal-long">{signed(g.changePercent)}%</span>
                </span>
                <span
                  className={cn(
                    'text-right font-medium',
                    g.shortScore >= 70 ? 'text-signal-short' : 'text-foreground'
                  )}
                >
                  {g.shortScore}
                </span>
              </button>
            ))}
      </div>
      <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
        {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}. ` : ''}
        Select a row to analyze it.
      </p>
    </section>
  )
}
