'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle, CandlestickSeries, LineSeries } from 'lightweight-charts'
import { cn } from '@/lib/utils'
import type { PriceData, TechnicalIndicators, Signal } from '@/lib/types'

interface PriceChartProps {
  priceHistory: PriceData[]
  technicals: TechnicalIndicators
  signal: Signal
  symbol: string
}

type TimeRange = '1M' | '3M' | '6M'

export function PriceChart({ priceHistory, technicals, signal, symbol }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const sma20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const sma50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('6M')
  const [showMA, setShowMA] = useState({ sma20: true, sma50: true })

  const signalColors = {
    LONG: { line: '#22c55e', area: 'rgba(34, 197, 94, 0.1)' },
    SHORT: { line: '#ef4444', area: 'rgba(239, 68, 68, 0.1)' },
    NEUTRAL: { line: '#eab308', area: 'rgba(234, 179, 8, 0.1)' },
  }

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1,
          style: LineStyle.Dashed,
        },
      },
    })

    chartRef.current = chart

    // Candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })
    candlestickSeriesRef.current = candlestickSeries

    // SMA 20 series
    const sma20Series = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      title: 'SMA 20',
    })
    sma20SeriesRef.current = sma20Series

    // SMA 50 series
    const sma50Series = chart.addSeries(LineSeries, {
      color: '#8b5cf6',
      lineWidth: 2,
      title: 'SMA 50',
    })
    sma50SeriesRef.current = sma50Series

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  // Update data when priceHistory or timeRange changes
  useEffect(() => {
    if (!candlestickSeriesRef.current || !sma20SeriesRef.current || !sma50SeriesRef.current) return

    // Filter data based on time range
    const now = new Date()
    let startDate: Date
    switch (timeRange) {
      case '1M':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case '3M':
        startDate = new Date(now.setMonth(now.getMonth() - 3))
        break
      case '6M':
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 6))
        break
    }

    const filteredData = priceHistory.filter(
      (d) => new Date(d.date) >= startDate
    )

    // Format data for chart
    const candleData = filteredData.map((d) => ({
      time: d.date,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }))

    candlestickSeriesRef.current.setData(candleData)

    // Calculate and set SMA data
    const calculateSMA = (data: PriceData[], period: number) => {
      const smaData: { time: string; value: number }[] = []
      for (let i = period - 1; i < data.length; i++) {
        let sum = 0
        for (let j = 0; j < period; j++) {
          sum += data[i - j].close
        }
        smaData.push({
          time: data[i].date,
          value: sum / period,
        })
      }
      return smaData
    }

    const sma20Data = calculateSMA(filteredData, 20)
    const sma50Data = calculateSMA(filteredData, 50)

    sma20SeriesRef.current.setData(showMA.sma20 ? sma20Data : [])
    sma50SeriesRef.current.setData(showMA.sma50 ? sma50Data : [])

    // Fit content
    chartRef.current?.timeScale().fitContent()
  }, [priceHistory, timeRange, showMA])

  return (
    <div className="glass rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-foreground">{symbol} Price Chart</h3>
          <div className="flex items-center gap-2">
            {(['1M', '3M', '6M'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  'px-3 py-1 text-sm rounded-lg transition-colors',
                  timeRange === range
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showMA.sma20}
              onChange={(e) => setShowMA((prev) => ({ ...prev, sma20: e.target.checked }))}
              className="rounded border-border"
            />
            <span className="text-blue-500">SMA 20</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showMA.sma50}
              onChange={(e) => setShowMA((prev) => ({ ...prev, sma50: e.target.checked }))}
              className="rounded border-border"
            />
            <span className="text-purple-500">SMA 50</span>
          </label>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="w-full" />

      {/* Current Price Indicator */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-signal-long" />
            <span className="text-muted-foreground">Bullish Candle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-signal-short" />
            <span className="text-muted-foreground">Bearish Candle</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>SMA 20: ${technicals.sma20.toFixed(2)}</span>
          <span>SMA 50: ${technicals.sma50.toFixed(2)}</span>
          <span>SMA 200: ${technicals.sma200.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
