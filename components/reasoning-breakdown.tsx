'use client'

import type { ReasoningItem } from '@/lib/types'
import { SentimentMark } from './sentiment-mark'

interface ReasoningBreakdownProps {
  reasoning: ReasoningItem[]
}

const categoryMeta: Record<ReasoningItem['category'], { label: string; weight: string }> = {
  technical: { label: 'Technical', weight: '40%' },
  fundamental: { label: 'Fundamental', weight: '40%' },
  momentum: { label: 'Momentum', weight: '20%' },
}

export function ReasoningBreakdown({ reasoning }: ReasoningBreakdownProps) {
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

  const tally = (items: ReasoningItem[]) => ({
    up: items.filter((i) => i.sentiment === 'bullish').length,
    down: items.filter((i) => i.sentiment === 'bearish').length,
  })

  return (
    <section aria-labelledby="breakdown-heading">
      <div className="flex items-baseline justify-between pb-3">
        <h2 id="breakdown-heading" className="text-[15px] font-semibold text-foreground">
          Signal breakdown
        </h2>
        <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><SentimentMark sentiment="bullish" />Bullish</span>
          <span className="flex items-center gap-1.5"><SentimentMark sentiment="bearish" />Bearish</span>
          <span className="flex items-center gap-1.5"><SentimentMark sentiment="neutral" />Neutral</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-8 border-t border-border pt-4 md:grid-cols-3">
        {categories.map((category) => {
          const items = grouped[category] || []
          if (items.length === 0) return null
          const meta = categoryMeta[category]
          const { up, down } = tally(items)

          return (
            <div key={category}>
              <div className="flex items-baseline justify-between border-b border-border-strong pb-2">
                <h3 className="text-[13px] font-semibold text-foreground">
                  {meta.label}
                  <span className="ml-2 font-normal text-muted-foreground">{meta.weight} weight</span>
                </h3>
                <span
                  className="flex items-center gap-2.5 text-[12px] text-muted-foreground"
                  aria-label={`${up} bullish, ${down} bearish`}
                >
                  <span className="flex items-center gap-1"><SentimentMark sentiment="bullish" />{up}</span>
                  <span className="flex items-center gap-1"><SentimentMark sentiment="bearish" />{down}</span>
                </span>
              </div>
              <ul className="divide-y divide-border">
                {items.map((item, index) => (
                  <li key={index} className="flex items-center justify-between gap-3 py-2 text-[13px]">
                    <span className="flex min-w-0 items-center gap-2">
                      <SentimentMark sentiment={item.sentiment} />
                      <span className="truncate text-foreground">{item.label}</span>
                    </span>
                    <span className="shrink-0 text-right text-muted-foreground">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
