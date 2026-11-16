'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Signal } from '@/lib/types'

interface ConfidenceGaugeProps {
  confidence: number
  signal: Signal
  score: number
  confidenceLabel?: 'Low' | 'Medium' | 'High'
}

// Mirrors LONG_THRESHOLD / SHORT_THRESHOLD in lib/analysis-engine.ts (display only).
const SHORT_EDGE = 35
const LONG_EDGE = 65

const signalText: Record<Signal, string> = {
  LONG: 'text-signal-long',
  SHORT: 'text-signal-short',
  NEUTRAL: 'text-foreground',
}

const signalWord: Record<Signal, string> = {
  LONG: 'Long',
  SHORT: 'Short',
  NEUTRAL: 'Neutral',
}

/**
 * The call, its confidence, and where the composite score sits on the
 * 0-100 scale relative to the short / neutral / long bands.
 */
export function ConfidenceGauge({ confidence, signal, score, confidenceLabel }: ConfidenceGaugeProps) {
  const [position, setPosition] = useState(50)

  useEffect(() => {
    const timer = setTimeout(() => setPosition(Math.max(0, Math.min(100, score))), 60)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="label-caps">Signal</div>
          <div className={cn('mt-0.5 text-[26px] font-semibold leading-8 tracking-tight', signalText[signal])}>
            {signalWord[signal]}
          </div>
        </div>
        <div className="text-right">
          <div className="label-caps">Confidence</div>
          <div className="mt-0.5 text-[26px] font-medium leading-8 tracking-tight text-foreground">
            {Math.round(confidence)}%
            {confidenceLabel && (
              <span className="ml-2 align-middle text-[13px] font-normal tracking-normal text-muted-foreground">
                {confidenceLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Composite score on the band scale */}
      <div className="mt-5" aria-label={`Composite score ${score} out of 100`}>
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="text-muted-foreground">Composite score</span>
          <span className="font-medium text-foreground">
            {score}
            <span className="text-muted-foreground"> / 100</span>
          </span>
        </div>
        <div className="relative mt-2 h-4">
          <div className="absolute inset-x-0 top-1/2 flex h-1 -translate-y-1/2 overflow-hidden rounded-full">
            <div className="bg-signal-short/25" style={{ width: `${SHORT_EDGE}%` }} />
            <div className="bg-border-strong/70" style={{ width: `${LONG_EDGE - SHORT_EDGE}%` }} />
            <div className="bg-signal-long/25" style={{ width: `${100 - LONG_EDGE}%` }} />
          </div>
          <div
            className="absolute top-0 h-4 w-[3px] -translate-x-1/2 rounded-full bg-foreground transition-[left] duration-700 ease-out"
            style={{ left: `${position}%` }}
          />
        </div>
        <div className="relative mt-1 h-4 text-[11px] text-muted-foreground">
          <span className="absolute left-0">Short</span>
          <span className="absolute -translate-x-1/2" style={{ left: `${SHORT_EDGE}%` }}>{SHORT_EDGE}</span>
          <span className="absolute -translate-x-1/2" style={{ left: `${LONG_EDGE}%` }}>{LONG_EDGE}</span>
          <span className="absolute right-0">Long</span>
        </div>
      </div>
    </div>
  )
}
