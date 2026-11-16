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
import { LineChart, BarChart3, Database, ArrowLeft } from 'lucide-react'
import type { AnalysisResult } from '@/lib/types'

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

  return (
    <div className="min-h-screen bg-background">
      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border bg-background sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
              >
                <LineChart className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold text-foreground">Stock Screener</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!analysis && !isLoading ? (
            // Landing / Search State
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Search section */}
              <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 text-balance">
                    Long, short or neutral on any stock
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto text-pretty">
                    Search a ticker or company name to get a signal with a confidence score and the technical, fundamental and momentum reasoning behind it.
                  </p>
                </div>

                <StockSearch onSelect={analyzeStock} isLoading={isLoading} />

                {error && (
                  <div role="alert" className="mt-4 p-4 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                    {error}
                  </div>
                )}

                {/* Feature highlights */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
                  {[
                    { Icon: LineChart, title: 'Signal and confidence', body: 'A long, short or neutral call with a confidence score.' },
                    { Icon: BarChart3, title: 'Scored breakdown', body: 'Technical, fundamental and momentum factors shown line by line.' },
                    { Icon: Database, title: 'Quotes and history', body: 'Current quote, price chart and key metrics for the symbol.' },
                  ].map(({ Icon, title, body }) => (
                    <div key={title} className="glass-subtle rounded-xl p-4">
                      <Icon className="h-4 w-4 text-primary mb-2" />
                      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground">{body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Gainers Scanner */}
              <div className="w-full lg:w-80">
                <TopGainersScanner onSelectStock={analyzeStock} />
              </div>
            </div>
          ) : (
            // Analysis Results State
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main analysis content */}
              <div className="flex-1 space-y-6">
                {/* Back button & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    onClick={handleReset}
                    className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>New Search</span>
                  </button>
                  <div className="flex-1 w-full">
                    <StockSearch onSelect={analyzeStock} isLoading={isLoading} />
                  </div>
                </div>

                {isLoading ? (
                  <AnalysisSkeleton />
                ) : analysis ? (
                  <>
                    {/* Signal Card */}
                    <SignalCard
                      symbol={analysis.symbol}
                      name={analysis.name}
                      signal={analysis.signal}
                      confidence={analysis.confidence}
                      confidenceLabel={analysis.confidenceLabel}
                      score={analysis.score}
                      quote={analysis.quote}
                    />

                    {/* Risk Flags */}
                    {analysis.riskFlags?.length > 0 && (
                      <RiskFlags riskFlags={analysis.riskFlags} />
                    )}

                    {/* Price Chart */}
                    <PriceChart
                      priceHistory={analysis.priceHistory}
                      technicals={analysis.technicals}
                      signal={analysis.signal}
                      symbol={analysis.symbol}
                    />

                    {/* Two-column layout for metrics and catalysts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <CatalystsList catalysts={analysis.catalysts} />
                      </div>
                      <div>
                        <ReasoningBreakdown reasoning={analysis.reasoning} />
                      </div>
                    </div>

                    {/* Detailed Metrics */}
                    <MetricsGrid
                      technicals={analysis.technicals}
                      fundamentals={analysis.fundamentals}
                    />

                    {/* Timestamp */}
                    <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
                      Analysis generated at {new Date(analysis.timestamp).toLocaleString()}
                    </div>
                  </>
                ) : null}

                {error && (
                  <div role="alert" className="p-4 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Top Gainers Sidebar */}
              <div className="w-full lg:w-80 order-first lg:order-last">
                <div className="lg:sticky lg:top-24">
                  <TopGainersScanner onSelectStock={analyzeStock} />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>
                &copy; {new Date().getFullYear()} Stock Screener. For informational purposes only, not financial advice.
              </p>
              <p>
                Data from Financial Modeling Prep and Alpha Vantage
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
