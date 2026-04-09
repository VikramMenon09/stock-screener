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
import { Sparkles, BarChart3, Clock, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
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
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-bold text-foreground">Stock Screener</span>
              </button>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Stock Intelligence</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Real-time Analysis</span>
                </div>
              </div>
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
                  <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
                    Instant Stock Intelligence
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto text-pretty">
                    Get presentation-ready long/short/neutral recommendations with confidence scores and supporting analysis in seconds.
                  </p>
                </div>

                <StockSearch onSelect={analyzeStock} isLoading={isLoading} />

                {error && (
                  <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                    {error}
                  </div>
                )}

                {/* Feature highlights */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
                  <div className="glass-subtle rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-lg bg-signal-long/10 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="h-5 w-5 text-signal-long" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Smart Signals</h3>
                    <p className="text-sm text-muted-foreground">
                      AI-powered long/short/neutral recommendations
                    </p>
                  </div>
                  <div className="glass-subtle rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="h-5 w-5 text-chart-4" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Full Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Technical, fundamental & momentum scoring
                    </p>
                  </div>
                  <div className="glass-subtle rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-lg bg-signal-neutral/10 flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-5 w-5 text-signal-neutral" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Real-time Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Live quotes and historical charts
                    </p>
                  </div>
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
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>New Search</span>
                  </button>
                  <div className="flex-1">
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
                    <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/50">
                      Analysis generated at {new Date(analysis.timestamp).toLocaleString()}
                    </div>
                  </>
                ) : null}

                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
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
        <footer className="border-t border-border/50 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>
                Stock Screener provides analysis for informational purposes only. Not financial advice.
              </p>
              <p>
                Data from Financial Modeling Prep & Alpha Vantage
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
