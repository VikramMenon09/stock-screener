'use client'

import { cn } from '@/lib/utils'
import type { Catalyst } from '@/lib/types'
import { TrendingUp, TrendingDown, Minus, Zap, AlertTriangle, Info } from 'lucide-react'

interface CatalystsListProps {
  catalysts: Catalyst[]
}

export function CatalystsList({ catalysts }: CatalystsListProps) {
  const getTypeConfig = (type: Catalyst['type']) => {
    switch (type) {
      case 'bullish':
        return {
          Icon: TrendingUp,
          color: 'text-signal-long',
          bgColor: 'bg-signal-long/10',
          borderColor: 'border-signal-long/30',
        }
      case 'bearish':
        return {
          Icon: TrendingDown,
          color: 'text-signal-short',
          bgColor: 'bg-signal-short/10',
          borderColor: 'border-signal-short/30',
        }
      default:
        return {
          Icon: Minus,
          color: 'text-signal-neutral',
          bgColor: 'bg-signal-neutral/10',
          borderColor: 'border-signal-neutral/30',
        }
    }
  }

  const getImpactConfig = (impact: Catalyst['impact']) => {
    switch (impact) {
      case 'high':
        return {
          Icon: Zap,
          label: 'High Impact',
          color: 'text-signal-short',
        }
      case 'medium':
        return {
          Icon: AlertTriangle,
          label: 'Medium Impact',
          color: 'text-signal-neutral',
        }
      default:
        return {
          Icon: Info,
          label: 'Low Impact',
          color: 'text-muted-foreground',
        }
    }
  }

  if (catalysts.length === 0) {
    return (
      <div className="glass-subtle rounded-xl p-6 text-center">
        <p className="text-muted-foreground">No significant catalysts identified</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <Zap className="h-4 w-4" />
        Key Catalysts
      </h3>
      <div className="space-y-3">
        {catalysts.map((catalyst, index) => {
          const typeConfig = getTypeConfig(catalyst.type)
          const impactConfig = getImpactConfig(catalyst.impact)

          return (
            <div
              key={index}
              className={cn(
                'glass-subtle rounded-xl p-4 border-l-4',
                typeConfig.borderColor
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('mt-0.5', typeConfig.color)}>
                  <typeConfig.Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={cn('font-semibold', typeConfig.color)}>
                      {catalyst.title}
                    </h4>
                    <div className={cn('flex items-center gap-1 text-xs', impactConfig.color)}>
                      <impactConfig.Icon className="h-3 w-3" />
                      <span>{impactConfig.label}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {catalyst.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
