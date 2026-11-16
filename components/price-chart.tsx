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

// Hex mirrors of the CSS tokens in app/globals.css (the chart canvas needs literal colors)
const CHART_COLORS = {
  up: '#1f8a5b',
  down: '#c6453a',
  sma20: '#2d5ba8',
  sma50: '#9c968c',
  ink: '#2a2d33',
  grid: '#efeee9',
  axisLine: '#e3e2dc',
  axisText: '#7a7d83',
  crosshair: '#b9b8b1',
}

export function PriceChart({ priceHistory, technicals, signal, symbol }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const sma20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const sma50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('6M')
  const [showMA, setShowMA] = useState({ sma20: true, sma50: true })

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Use the page's UI font so axis labels match the rest of the interface
    const fontFamily =
      typeof window !== 'undefined'
        ? getComputedStyle(document.body).fontFamily
        : 'system-ui, sans-serif'

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: CHART_COLORS.axisText,
        fontFamily,
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: CHART_COLORS.grid },
      },
      width: chartContainerRef.current.clientWidth,
      height: 420,
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.08 },
      },
      timeScale: {
        borderColor: CHART_COLORS.axisLine,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: CHART_COLORS.crosshair,
          width: 1,
          style: LineStyle.Solid,
          labelBackgroundColor: CHART_COLORS.ink,
        },
        horzLine: {
          color: CHART_COLORS.crosshair,
          width: 1,
          style: LineStyle.Solid,
          labelBackgroundColor: CHART_COLORS.ink,
        },
      },
    })

    chartRef.current = chart

    // Candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: CHART_COLORS.up,
      downColor: CHART_COLORS.down,
      borderUpColor: CHART_COLORS.up,
      borderDownColor: CHART_COLORS.down,
      wickUpColor: CHART_COLORS.up,
      wickDownColor: CHART_COLORS.down,
      priceLineStyle: LineStyle.Dotted,
      priceLineColor: CHART_COLORS.crosshair,
    })
    candlestickSeriesRef.current = candlestickSeries

    // SMA 20 series
    const sma20Series = chart.addSeries(LineSeries, {
      color: CHART_COLORS.sma20,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })
    sma20SeriesRef.current = sma20Series

    // SMA 50 series
    const sma50Series = chart.addSeries(LineSeries, {
      color: CHART_COLORS.sma50,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
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

  const ranges: TimeRange[] = ['1M', '3M', '6M']

  return (
    <section aria-label={`${symbol} price chart`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-[15px] font-semibold text-foreground">Price</h2>
          <span className="text-[12px] text-muted-foreground">Daily candles</span>
        </div>

        <div className="flex items-center gap-5">
          {/* Moving-average toggles double as the legend */}
          <div className="flex items-center gap-1">
            {([
              { key: 'sma20', label: 'SMA 20', color: CHART_COLORS.sma20 },
              { key: 'sma50', label: 'SMA 50', color: CHART_COLORS.sma50 },
            ] as const).map(({ key, label, color }) => (
              <button
                key={key}
                type="button"
                aria-pressed={showMA[key]}
                onClick={() => setShowMA((prev) => ({ ...prev, [key]: !prev[key] }))}
                className={cn(
                  'flex items-center gap-1.5 rounded-sm px-2 py-1 text-[12px] transition-colors',
                  showMA[key] ? 'text-foreground' : 'text-muted-foreground/70 line-through decoration-muted-foreground/50'
                )}
              >
                <span
                  className="h-[2px] w-3.5 rounded-full"
                  style={{ backgroundColor: color, opacity: showMA[key] ? 1 : 0.35 }}
                  aria-hidden="true"
                />
                {label}
              </button>
            ))}
          </div>

          <div className="flex rounded-md border border-border-strong p-0.5" role="group" aria-label="Time range">
            {ranges.map((range) => (
              <button
                key={range}
                type="button"
                aria-pressed={timeRange === range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  'min-w-[38px] rounded-[4px] px-2 py-0.5 text-[12px] font-medium transition-colors',
                  timeRange === range
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="border-t border-border pt-2">
        <div ref={chartContainerRef} className="w-full" />
      </div>

      {/* Moving-average values */}
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[12px]">
        {[
          { label: 'SMA 20', value: technicals.sma20 },
          { label: 'SMA 50', value: technicals.sma50 },
          { label: 'SMA 200', value: technicals.sma200 },
        ].map((m) => (
          <div key={m.label} className="flex gap-1.5">
            <dt className="text-muted-foreground">{m.label}</dt>
            <dd className="font-medium text-foreground">${m.value.toFixed(2)}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
