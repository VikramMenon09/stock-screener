'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchResult } from '@/lib/types'

interface StockSearchProps {
  onSelect: (symbol: string) => void
  isLoading?: boolean
}

export function StockSearch({ onSelect, isLoading = false }: StockSearchProps) {
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
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          {isLoading || isSearching ? (
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-muted-foreground" />
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
          placeholder="Search stocks by symbol or name..."
          disabled={isLoading}
          className={cn(
            'w-full h-14 pl-12 pr-12 rounded-2xl',
            'glass border-2 border-transparent',
            'text-lg text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              inputRef.current?.focus()
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 glass rounded-xl overflow-hidden shadow-2xl">
          <ul className="py-2 max-h-80 overflow-auto">
            {results.map((result, index) => (
              <li key={result.symbol}>
                <button
                  onClick={() => handleSelect(result.symbol)}
                  className={cn(
                    'w-full px-4 py-3 flex items-center gap-4 text-left',
                    'hover:bg-accent/50 transition-colors',
                    selectedIndex === index && 'bg-accent/50'
                  )}
                >
                  <span className="font-mono font-semibold text-primary min-w-[60px]">
                    {result.symbol}
                  </span>
                  <span className="text-foreground truncate flex-1">
                    {result.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {result.exchange}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Keyboard hint */}
      <div className="mt-3 text-center text-sm text-muted-foreground">
        Press <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">Enter</kbd> to analyze
      </div>
    </div>
  )
}
