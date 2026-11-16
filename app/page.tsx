'use client'

import { useState, useCallback } from 'react'
import { StockSearch } from '@/components/stock-search'
import { SignalCard } from '@/components/signal-card'
import { RiskFlags } from '@/components/risk-flags'
import { PriceChart } from '@/components/price-chart'
import { MetricsGrid } from '@/components/metrics-grid'
import { CatalystsList } from '@/components/catalysts-list'
import { ReasoningBreakdown } from '@/components/reasoning-breakdown'
import { TopGainersScanner } from '@/components/top-gainers-scanner'
import { AnalysisSkeleton } from '@/components/analysis-skeleton'
import { ArrowLeft } from 'lucide-react'
import type { AnalysisResult } from '@/lib/types'

const EXAMPLE_TICKERS = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN']

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <rect width="18" height="18" rx="3" className="fill-foreground" />
        <rect x="4" y="9" width="2" height="5" fill="white" />
        <rect x="8" y="6" width="2" height="8" fill="white" />
        <rect x="12" y="4" width="2" height="10" fill="white" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        Stock Screener
      </span>
    </span>
  )
}

function Methodology() {
  const factors = [
    { name: 'Technical', weight: '40%', detail: 'RSI, moving-average position and crossovers, MACD, Bollinger Bands' },
    { name: 'Fundamental', weight: '40%', detail: 'P/E, ROE, debt to equity, revenue growth, net margin, current ratio' },
    { name: 'Momentum', weight: '20%', detail: 'Daily change, relative volume, 52-week range, 5-day to 3-month returns' },
  ]

  return (
    <section aria-labelledby="method-heading">
      <h2 id="method-heading" className="label-caps pb-3 border-b border-border">
        How the call is made
      </h2>

      <dl className="divide-y divide-border">
        {factors.map((f) => (
          <div key={f.name} className="py-3">
            <div className="flex items-baseline justify-between">
              <dt className="font-medium text-foreground">{f.name}</dt>
              <dd className="text-muted-foreground">{f.weight}</dd>
            </div>
            <dd className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{f.detail}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <p className="text-[13px] leading-5 text-muted-foreground">
          The weighted composite score (0 to 100) sets the call. Confidence is the distance from the neutral band.
        </p>
        <div className="mt-3">
          <div className="flex h-1.5 overflow-hidden rounded-full">
            <div className="bg-signal-short" style={{ width: '35%' }} />
            <div className="bg-border-strong" style={{ width: '30%' }} />
            <div className="bg-signal-long" style={{ width: '35%' }} />
          </div>
          <div className="relative mt-1.5 h-4 text-[11px] text-muted-foreground">
            <span className="absolute left-0">0</span>
            <span className="absolute -translate-x-1/2" style={{ left: '35%' }}>35</span>
            <span className="absolute -translate-x-1/2" style={{ left: '65%' }}>65</span>
            <span className="absolute right-0">100</span>
          </div>
          <div className="mt-1 grid grid-cols-[35%_30%_35%] text-[12px] font-medium">
            <span className="text-signal-short">Short</span>
            <span className="text-center text-muted-foreground">Neutral</span>
            <span className="text-right text-signal-long">Long</span>
          </div>
        </div>
      </div>

      <p className="mt-6 pt-4 border-t border-border text-[12px] leading-5 text-muted-foreground">
        Quotes and fundamentals come from Financial Modeling Prep and Alpha Vantage. Without API keys the app runs on
        simulated data and labels it as such.
      </p>
    </section>
  )
}

export default function StockScreenerDashboard() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeStock = useCallback(async (symbol: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/analyze?symbol=${encodeURIComponent(symbol)}`)

      if (!response.ok) {
        throw new Error('Failed to analyze stock')
      }

      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Failed to analyze stock. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleReset = () => {
    setAnalysis(null)
    setError(null)
  }

  const isHome = !analysis && !isLoading

  const errorBox = error && (
    <div
      role="alert"
      className="mt-4 border-l-2 border-signal-short bg-signal-short/5 px-3 py-2 text-[13px] text-signal-short"
    >
      {error}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-[2px]">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-6 px-6 lg:px-8">
          <button
            onClick={handleReset}
            className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
            aria-label="Stock Screener home"
          >
            <Wordmark />
          </button>

          {!isHome && (
            <div className="flex flex-1 items-center gap-4">
              <div className="w-full max-w-[380px]">
                <StockSearch onSelect={analyzeStock} isLoading={isLoading} size="sm" />
              </div>
              <button
                onClick={handleReset}
                className="hidden sm:flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                New search
              </button>
            </div>
          )}

          <p className="ml-auto hidden md:block text-[12px] text-muted-foreground">
            For research only. Not investment advice.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1320px] flex-1 px-6 lg:px-8">
        {isHome ? (
          // Home / search
          <div className="grid grid-cols-1 gap-x-14 gap-y-12 pt-14 pb-16 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground">
                Analyze a stock
              </h1>
              <p className="mt-2 max-w-[560px] text-[15px] leading-6 text-muted-foreground">
                Enter a ticker or company name to get a long, short or neutral call with its confidence, the signals
                behind it, and a six-month price chart.
              </p>

              <div className="mt-7 max-w-[640px]">
                <StockSearch onSelect={analyzeStock} isLoading={isLoading} size="lg" />
                <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-1 text-[13px]">
                  <span className="mr-1 text-muted-foreground">Examples</span>
                  {EXAMPLE_TICKERS.map((t) => (
                    <button
                      key={t}
                      onClick={() => analyzeStock(t)}
                      className="rounded-sm px-1.5 py-0.5 font-medium text-primary hover:bg-primary/8 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {errorBox}
              </div>

              <div className="mt-16">
                <TopGainersScanner onSelectStock={analyzeStock} variant="table" />
              </div>
            </div>

            <aside className="lg:col-span-4 lg:pt-1">
              <Methodology />
            </aside>
          </div>
        ) : (
          // Analysis results
          <div className="grid grid-cols-1 gap-x-12 gap-y-10 pt-8 pb-16 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-9">
              {isLoading ? (
                <AnalysisSkeleton />
              ) : analysis ? (
                <div className="space-y-12">
                  <div>
                    <SignalCard
                      symbol={analysis.symbol}
                      name={analysis.name}
                      signal={analysis.signal}
                      confidence={analysis.confidence}
                      confidenceLabel={analysis.confidenceLabel}
                      score={analysis.score}
                      quote={analysis.quote}
                      riskFlags={analysis.riskFlags}
                    />

                    {/* Risk notes (the "Simulated data" flag is shown beside the ticker) */}
                    {analysis.riskFlags?.length > 0 && (
                      <RiskFlags riskFlags={analysis.riskFlags} />
                    )}
                  </div>

                  <PriceChart
                    priceHistory={analysis.priceHistory}
                    technicals={analysis.technicals}
                    signal={analysis.signal}
                    symbol={analysis.symbol}
                  />

                  <ReasoningBreakdown reasoning={analysis.reasoning} />

                  <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-3">
                    <CatalystsList catalysts={analysis.catalysts} />
                    <MetricsGrid
                      technicals={analysis.technicals}
                      fundamentals={analysis.fundamentals}
                    />
                  </div>

                  <p className="border-t border-border pt-4 text-[12px] text-muted-foreground">
                    Analysis generated {new Date(analysis.timestamp).toLocaleString()}
                  </p>
                </div>
              ) : null}

              {errorBox}
            </div>

            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-[88px]">
                <TopGainersScanner onSelectStock={analyzeStock} variant="rail" />
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 px-6 py-5 text-[12px] text-muted-foreground sm:flex-row sm:justify-between lg:px-8">
          <p>&copy; {new Date().getFullYear()} Stock Screener. For informational purposes only, not financial advice.</p>
          <p>Data from Financial Modeling Prep and Alpha Vantage</p>
        </div>
      </footer>
    </div>
  )
}
