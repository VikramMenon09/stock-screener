'use client'

import { AlertTriangle, Zap, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RiskFlag } from '@/lib/types'

interface RiskFlagsProps {
  riskFlags: RiskFlag[]
}

const flagConfig = {
  squeeze: {
    Icon: Zap,
    colorClass: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    iconClass: 'text-orange-400',
  },
  volatility: {
    Icon: AlertTriangle,
    colorClass: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    iconClass: 'text-yellow-400',
  },
  data: {
    Icon: Database,
    colorClass: 'bg-muted/50 border-border text-muted-foreground',
    iconClass: 'text-muted-foreground',
  },
}

export function RiskFlags({ riskFlags }: RiskFlagsProps) {
  if (!riskFlags || riskFlags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {riskFlags.map((flag, i) => {
        const config = flagConfig[flag.type]
        return (
          <div
            key={i}
            title={flag.description}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-default',
              config.colorClass
            )}
          >
            <config.Icon className={cn('h-3.5 w-3.5 shrink-0', config.iconClass)} />
            <span>{flag.label}</span>
          </div>
        )
      })}
    </div>
  )
}
