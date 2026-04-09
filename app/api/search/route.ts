import { NextRequest, NextResponse } from 'next/server'
import type { SearchResult } from '@/lib/types'

const FMP_API_KEY = process.env.FMP_API_KEY

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] })
  }

  if (!FMP_API_KEY) {
    // Return mock data if no API key
    return NextResponse.json({
      results: getMockSearchResults(query),
    })
  }

  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(query)}&limit=10&apikey=${FMP_API_KEY}`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      throw new Error('FMP API error')
    }

    const data = await response.json()

    const results: SearchResult[] = data.map((item: {
      symbol: string
      name: string
      stockExchange: string
      exchangeShortName: string
    }) => ({
      symbol: item.symbol,
      name: item.name,
      exchange: item.exchangeShortName || item.stockExchange,
      type: 'stock',
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({
      results: getMockSearchResults(query),
    })
  }
}

function getMockSearchResults(query: string): SearchResult[] {
  const mockStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'stock' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'stock' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'stock' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', type: 'stock' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', type: 'stock' },
    { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', type: 'stock' },
    { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', type: 'stock' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', type: 'stock' },
    { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', type: 'stock' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', type: 'stock' },
    { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', type: 'stock' },
    { symbol: 'PG', name: 'Procter & Gamble Co.', exchange: 'NYSE', type: 'stock' },
    { symbol: 'MA', name: 'Mastercard Inc.', exchange: 'NYSE', type: 'stock' },
    { symbol: 'HD', name: 'The Home Depot Inc.', exchange: 'NYSE', type: 'stock' },
    { symbol: 'DIS', name: 'The Walt Disney Company', exchange: 'NYSE', type: 'stock' },
  ]

  const lowerQuery = query.toLowerCase()
  return mockStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(lowerQuery) ||
      stock.name.toLowerCase().includes(lowerQuery)
  ).slice(0, 8)
}
