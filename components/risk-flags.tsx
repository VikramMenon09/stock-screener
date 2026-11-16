'use client'

import { AlertTriangle } from 'lucide-react'
import type { RiskFlag } from '@/lib/types'

interface RiskFlagsProps {
  riskFlags: RiskFlag[]
}

/**
 * Market risk notes (short squeeze, volatility). The data-source flag
 * ("Simulated Data") is rendered next to the ticker in SignalCard instead.
 */
export function RiskFlags({ riskFlags }: RiskFlagsProps) {
  const notes = (riskFlags ?? []).filter((f) => f.type !== 'data')
  if (notes.length === 0) return null

  return (
    <ul className="mt-4 space-y-1.5">
      {notes.map((flag, i) => (
        <li key={i} className="flex items-start gap-2 text-[13px] leading-5">
          <AlertTriangle
            className={
              flag.severity === 'high'
                ? 'mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-short'
                : 'mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground'
            }
            aria-hidden="true"
          />
          <p>
            <span className="font-medium text-foreground">{flag.label}.</span>{' '}
            <span className="text-muted-foreground">{flag.description}</span>
          </p>
        </li>
      ))}
    </ul>
  )
}
