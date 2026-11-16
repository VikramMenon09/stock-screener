'use client'

function Bar({ className = '' }: { className?: string }) {
  return <div className={`rounded-sm bg-secondary ${className}`} />
}

export function AnalysisSkeleton() {
  return (
    <div className="animate-pulse space-y-12" aria-busy="true" aria-label="Loading analysis">
      {/* Summary */}
      <div>
        <div className="flex flex-col gap-8 pb-7 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Bar className="h-8 w-24" />
              <Bar className="h-4 w-40" />
            </div>
            <div className="mt-5 flex items-end gap-3">
              <Bar className="h-10 w-44" />
              <Bar className="h-4 w-28" />
            </div>
          </div>
          <div className="w-full md:max-w-[400px] md:border-l md:border-border md:pl-8">
            <div className="flex justify-between">
              <div>
                <Bar className="h-3 w-12" />
                <Bar className="mt-2 h-7 w-24" />
              </div>
              <div className="flex flex-col items-end">
                <Bar className="h-3 w-16" />
                <Bar className="mt-2 h-7 w-20" />
              </div>
            </div>
            <Bar className="mt-6 h-1 w-full" />
            <Bar className="mt-3 h-3 w-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 border-y border-border sm:grid-cols-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.7fr)_minmax(0,1.1fr)_minmax(0,1.35fr)_minmax(0,2fr)]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`py-3 pr-4 ${i === 5 ? 'col-span-2 lg:col-span-1' : ''}`}>
              <Bar className="h-2.5 w-16" />
              <Bar className="mt-2 h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <Bar className="h-4 w-16" />
          <Bar className="h-6 w-32" />
        </div>
        <div className="h-[420px] border-t border-border pt-2">
          <Bar className="h-full w-full bg-secondary/60" />
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        {[1, 2, 3].map((col) => (
          <div key={col} className="space-y-3">
            <Bar className="h-3.5 w-28" />
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="flex justify-between">
                <Bar className="h-3 w-24" />
                <Bar className="h-3 w-12" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SearchSkeleton() {
  return (
    <div className="animate-pulse pt-14">
      <Bar className="h-8 w-56" />
      <Bar className="mt-3 h-4 w-96" />
      <Bar className="mt-7 h-12 w-full max-w-[640px]" />
    </div>
  )
}
