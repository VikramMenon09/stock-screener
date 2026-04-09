'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Signal } from '@/lib/types'

interface ConfidenceGaugeProps {
  confidence: number
  signal: Signal
  score: number
}

export function ConfidenceGauge({ confidence, signal, score }: ConfidenceGaugeProps) {
  const [animatedConfidence, setAnimatedConfidence] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedConfidence(confidence)
    }, 100)
    return () => clearTimeout(timer)
  }, [confidence])

  const signalColors = {
    LONG: {
      stroke: 'stroke-signal-long',
      text: 'text-signal-long',
      glow: 'drop-shadow-[0_0_10px_oklch(0.72_0.19_160_/_0.5)]',
    },
    SHORT: {
      stroke: 'stroke-signal-short',
      text: 'text-signal-short',
      glow: 'drop-shadow-[0_0_10px_oklch(0.55_0.22_25_/_0.5)]',
    },
    NEUTRAL: {
      stroke: 'stroke-signal-neutral',
      text: 'text-signal-neutral',
      glow: 'drop-shadow-[0_0_10px_oklch(0.75_0.15_85_/_0.5)]',
    },
  }

  const colors = signalColors[signal]
  
  // SVG arc calculations
  const radius = 80
  const strokeWidth = 12
  const circumference = Math.PI * radius // Half circle
  const progress = (animatedConfidence / 100) * circumference

  const getConfidenceLabel = () => {
    if (confidence >= 80) return 'Very High'
    if (confidence >= 65) return 'High'
    if (confidence >= 50) return 'Moderate'
    if (confidence >= 35) return 'Low'
    return 'Very Low'
  }

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width="200"
        height="120"
        viewBox="0 0 200 120"
        className={cn('overflow-visible', colors.glow)}
      >
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary"
          strokeLinecap="round"
        />
        
        {/* Progress arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          strokeWidth={strokeWidth}
          className={colors.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{
            transition: 'stroke-dashoffset 1s ease-out',
          }}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = (tick / 100) * 180 - 180
          const radians = (angle * Math.PI) / 180
          const x1 = 100 + (radius - 20) * Math.cos(radians)
          const y1 = 100 + (radius - 20) * Math.sin(radians)
          const x2 = 100 + (radius - 28) * Math.cos(radians)
          const y2 = 100 + (radius - 28) * Math.sin(radians)
          
          return (
            <g key={tick}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={2}
                className="text-muted-foreground/50"
              />
            </g>
          )
        })}
      </svg>

      {/* Center content */}
      <div className="absolute top-8 flex flex-col items-center">
        <span className={cn('text-4xl font-bold font-mono', colors.text)}>
          {Math.round(animatedConfidence)}%
        </span>
        <span className="text-sm text-muted-foreground mt-1">
          {getConfidenceLabel()} Confidence
        </span>
      </div>

      {/* Score indicator */}
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Composite Score:</span>
        <span className={cn('font-mono font-semibold', colors.text)}>
          {score}/100
        </span>
      </div>
    </div>
  )
}
