'use client'

import { useEffect, useState } from 'react'
import { TrendingDown, RefreshCw, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TopGainer } from '@/lib/types'

interface TopGainersScannerProps {
  onSelectStock: (symbol: string) => void
}

export function TopGainersScanner({ onSelectStock }: TopGainersScannerProps) {
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`
    return volume.toString()
  }

  return (
    <div className="glass rounded-2xl p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-signal-short" />
          <h3 className="text-lg font-semibold text-foreground">Short Candidates</h3>
        </div>
        <button
          onClick={fetchGainers}
          disabled={isLoading}
          className={cn(
            'p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors',
            isLoading && 'animate-spin'
          )}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <p className="text-xs text-muted-foreground mb-3">
          Updated {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* Gainers list */}
      <div className="flex-1 overflow-auto space-y-2">
        {isLoading ? (
          // Skeleton loading
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="glass-subtle rounded-lg p-3 flex items-center gap-3">
                <div className="w-12 h-5 bg-secondary rounded" />
                <div className="flex-1">
                  <div className="w-24 h-4 bg-secondary rounded mb-1" />
                  <div className="w-16 h-3 bg-secondary rounded" />
                </div>
                <div className="w-16 h-5 bg-secondary rounded" />
              </div>
            </div>
          ))
        ) : (
          gainers.map((gainer, index) => (
            <button
              key={gainer.symbol}
              onClick={() => onSelectStock(gainer.symbol)}
              className="w-full glass-subtle rounded-lg p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors text-left group"
            >
              {/* Rank */}
              <span className="text-xs font-mono text-muted-foreground w-5">
                {index + 1}
              </span>

              {/* Symbol & Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-foreground">
                    {gainer.symbol}
                  </span>
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {gainer.name}
                </p>
              </div>

              {/* Price & Change */}
              <div className="text-right">
                <p className="font-mono text-sm text-foreground">
                  {formatPrice(gainer.price)}
                </p>
                <p className="text-xs font-semibold text-signal-long">
                  +{gainer.changePercent.toFixed(2)}%
                </p>
              </div>

              {/* Short Score */}
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Short</p>
                <p
                  className={cn(
                    'text-xs font-bold font-mono',
                    gainer.shortScore >= 70
                      ? 'text-signal-short'
                      : gainer.shortScore >= 50
                      ? 'text-yellow-400'
                      : 'text-muted-foreground'
                  )}
                >
                  {gainer.shortScore}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <p className="text-xs text-center text-muted-foreground">
          Ranked by short score · click to analyze
        </p>
      </div>
    </div>
  )
}
