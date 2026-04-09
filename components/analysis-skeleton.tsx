'use client'

import { cn } from '@/lib/utils'

export function AnalysisSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Signal Card Skeleton */}
      <div className="glass rounded-2xl p-6 border-2 border-border/50">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-20 bg-secondary rounded" />
              <div className="h-6 w-24 bg-secondary rounded-full" />
            </div>
            <div className="h-4 w-40 bg-secondary rounded" />
          </div>
          <div className="text-right">
            <div className="h-8 w-28 bg-secondary rounded mb-2" />
            <div className="h-4 w-20 bg-secondary rounded ml-auto" />
          </div>
        </div>

        {/* Gauge skeleton */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-[200px] h-[100px] bg-secondary rounded-t-full" />
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="h-10 w-16 bg-secondary/50 rounded" />
              <div className="h-4 w-24 bg-secondary/50 rounded mt-2" />
            </div>
          </div>
        </div>

        {/* Quick stats skeleton */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border/50">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="h-3 w-16 bg-secondary rounded mx-auto mb-2" />
              <div className="h-5 w-20 bg-secondary rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-6 w-32 bg-secondary rounded" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-12 bg-secondary rounded-lg" />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-5 w-20 bg-secondary rounded" />
            <div className="h-5 w-20 bg-secondary rounded" />
          </div>
        </div>
        <div className="w-full h-[400px] bg-secondary/50 rounded-lg" />
      </div>

      {/* Metrics skeleton */}
      <div className="space-y-6">
        <div>
          <div className="h-4 w-40 bg-secondary rounded mb-3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="glass-subtle rounded-xl p-4">
                <div className="h-3 w-16 bg-secondary rounded mb-3" />
                <div className="h-6 w-20 bg-secondary rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Catalysts skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-28 bg-secondary rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-subtle rounded-xl p-4 border-l-4 border-secondary">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 bg-secondary rounded" />
              <div className="flex-1">
                <div className="h-5 w-40 bg-secondary rounded mb-2" />
                <div className="h-4 w-full bg-secondary rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SearchSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center mb-8">
        <div className="h-10 w-64 bg-secondary rounded mx-auto mb-3" />
        <div className="h-5 w-96 bg-secondary/50 rounded mx-auto" />
      </div>
      <div className="w-full max-w-2xl">
        <div className="h-14 bg-secondary rounded-2xl" />
        <div className="h-4 w-48 bg-secondary/50 rounded mx-auto mt-3" />
      </div>
    </div>
  )
}
