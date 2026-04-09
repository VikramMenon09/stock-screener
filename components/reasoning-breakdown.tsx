'use client'

import { cn } from '@/lib/utils'
import type { ReasoningItem } from '@/lib/types'
import { Activity, DollarSign, Zap, CheckCircle, XCircle, MinusCircle } from 'lucide-react'

interface ReasoningBreakdownProps {
  reasoning: ReasoningItem[]
}

export function ReasoningBreakdown({ reasoning }: ReasoningBreakdownProps) {
  const getCategoryConfig = (category: ReasoningItem['category']) => {
    switch (category) {
      case 'technical':
        return {
          Icon: Activity,
          label: 'Technical',
          color: 'text-chart-4',
        }
      case 'fundamental':
        return {
          Icon: DollarSign,
          label: 'Fundamental',
          color: 'text-chart-5',
        }
      case 'momentum':
        return {
          Icon: Zap,
          label: 'Momentum',
          color: 'text-primary',
        }
    }
  }

  const getSentimentConfig = (sentiment: ReasoningItem['sentiment']) => {
    switch (sentiment) {
      case 'bullish':
        return {
          Icon: CheckCircle,
          color: 'text-signal-long',
          bgColor: 'bg-signal-long/10',
        }
      case 'bearish':
        return {
          Icon: XCircle,
          color: 'text-signal-short',
          bgColor: 'bg-signal-short/10',
        }
      default:
        return {
          Icon: MinusCircle,
          color: 'text-signal-neutral',
          bgColor: 'bg-signal-neutral/10',
        }
    }
  }

  // Group by category
  const grouped = reasoning.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, ReasoningItem[]>
  )

  const categories: ReasoningItem['category'][] = ['technical', 'fundamental', 'momentum']

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <Activity className="h-4 w-4" />
        Analysis Breakdown
      </h3>
      <div className="space-y-4">
        {categories.map((category) => {
          const items = grouped[category] || []
          if (items.length === 0) return null

          const categoryConfig = getCategoryConfig(category)

          return (
            <div key={category} className="glass-subtle rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <categoryConfig.Icon className={cn('h-4 w-4', categoryConfig.color)} />
                <span className={cn('text-sm font-semibold', categoryConfig.color)}>
                  {categoryConfig.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({category === 'technical' ? '40%' : category === 'fundamental' ? '40%' : '20%'} weight)
                </span>
              </div>
              <div className="space-y-2">
                {items.map((item, index) => {
                  const sentimentConfig = getSentimentConfig(item.sentiment)

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <sentimentConfig.Icon
                          className={cn('h-4 w-4', sentimentConfig.color)}
                        />
                        <span className="text-sm text-foreground">{item.label}</span>
                      </div>
                      <span
                        className={cn(
                          'text-sm font-mono px-2 py-0.5 rounded',
                          sentimentConfig.bgColor,
                          sentimentConfig.color
                        )}
                      >
                        {item.value}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
