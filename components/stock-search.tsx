'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchResult } from '@/lib/types'

interface StockSearchProps {
  onSelect: (symbol: string) => void
  isLoading?: boolean
  /** "lg" for the home page, "sm" for the compact header field */
  size?: 'lg' | 'sm'
}

export function StockSearch({ onSelect, isLoading = false, size = 'lg' }: StockSearchProps) {
  const isLarge = size === 'lg'
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const searchStocks = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchStocks(query)
    }, 200)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, searchStocks])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (symbol: string) => {
    onSelect(symbol)
    setQuery('')
    setResults([])
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter' && query.length > 0) {
        // Direct symbol entry
        handleSelect(query.toUpperCase())
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex].symbol)
        } else if (query.length > 0) {
          handleSelect(query.toUpperCase())
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 flex items-center',
            isLarge ? 'pl-3.5' : 'pl-2.5'
          )}
        >
          {isLoading || isSearching ? (
            <Loader2 className={cn('animate-spin text-muted-foreground', isLarge ? 'h-[18px] w-[18px]' : 'h-4 w-4')} />
          ) : (
            <Search className={cn('text-muted-foreground', isLarge ? 'h-[18px] w-[18px]' : 'h-4 w-4')} />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={isLarge ? 'Ticker or company name, e.g. NVDA' : 'Search ticker or company'}
          disabled={isLoading}
          aria-label="Search stocks by ticker or company name"
          autoComplete="off"
          spellCheck={false}
          className={cn(
            'w-full rounded-md border border-input bg-card text-foreground',
            'placeholder:text-muted-foreground/80',
            'focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15',
            'transition-[border-color,box-shadow] duration-150',
            'disabled:cursor-not-allowed disabled:opacity-60',
            isLarge ? 'h-12 pl-11 pr-24 text-[16px]' : 'h-9 pl-8 pr-8 text-[13px]'
          )}
        />
        <div className={cn('absolute inset-y-0 right-0 flex items-center gap-2', isLarge ? 'pr-3' : 'pr-2')}>
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery('')
                setResults([])
                inputRef.current?.focus()
              }}
              className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className={isLarge ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
            </button>
          )}
          {isLarge && (
            <kbd className="rounded-[4px] border border-border-strong bg-background px-1.5 py-0.5 font-sans text-[11px] font-medium text-muted-foreground">
              Enter
            </kbd>
          )}
        </div>
      </div>

      {/* Results dropdown */}
      {isOpen && isSearching && results.length === 0 && query.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border-strong bg-popover px-3 py-2 text-[13px] text-muted-foreground shadow-[0_8px_24px_-8px_rgba(20,20,30,0.18)]">
          Searching...
        </div>
      )}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border-strong bg-popover shadow-[0_8px_24px_-8px_rgba(20,20,30,0.18)]">
          <ul className="max-h-80 overflow-auto py-1" role="listbox">
            {results.map((result, index) => (
              <li key={result.symbol} role="option" aria-selected={selectedIndex === index}>
                <button
                  type="button"
                  onClick={() => handleSelect(result.symbol)}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2 text-left text-[13px]',
                    'transition-colors hover:bg-secondary',
                    selectedIndex === index && 'bg-secondary'
                  )}
                >
                  <span className="min-w-[56px] font-semibold text-foreground">
                    {result.symbol}
                  </span>
                  <span className="flex-1 truncate text-muted-foreground">
                    {result.name}
                  </span>
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
                    {result.exchange}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
