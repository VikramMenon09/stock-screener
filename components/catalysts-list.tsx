'use client'

import type { Catalyst } from '@/lib/types'
import { SentimentMark } from './sentiment-mark'

interface CatalystsListProps {
  catalysts: Catalyst[]
}

const impactLabel: Record<Catalyst['impact'], string> = {
  high: 'High impact',
  medium: 'Medium impact',
  low: 'Low impact',
}

export function CatalystsList({ catalysts }: CatalystsListProps) {
  return (
    <section aria-labelledby="catalysts-heading">
      <h2
        id="catalysts-heading"
        className="border-b border-border-strong pb-2 text-[13px] font-semibold text-foreground"
      >
        Key catalysts
      </h2>

      {catalysts.length === 0 ? (
        <p className="py-3 text-[13px] text-muted-foreground">No significant catalysts identified.</p>
      ) : (
        <ul className="divide-y divide-border">
          {catalysts.map((catalyst, index) => (
            <li key={index} className="py-3">
              <div className="flex items-baseline gap-2">
                <SentimentMark sentiment={catalyst.type} className="translate-y-[-1px]" />
                <h3 className="flex-1 text-[13px] font-medium text-foreground">{catalyst.title}</h3>
                <span className="shrink-0 text-[11px] text-muted-foreground">{impactLabel[catalyst.impact]}</span>
              </div>
              <p className="mt-1 pl-4 text-[13px] leading-5 text-muted-foreground">{catalyst.description}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
