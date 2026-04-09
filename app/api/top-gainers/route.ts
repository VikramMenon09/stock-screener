import { NextResponse } from 'next/server'
import { calculateShortScore } from '@/lib/analysis-engine'
import type { TopGainer } from '@/lib/types'

const FMP_API_KEY = process.env.FMP_API_KEY

export async function GET() {
  if (FMP_API_KEY) {
    try {
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=${FMP_API_KEY}`,
        { next: { revalidate: 300 } } // Cache for 5 minutes
      )

      if (response.ok) {
        const data = await response.json()
        
        const gainers: TopGainer[] = data.slice(0, 10).map((item: {
          symbol: string
          name: string
          price: number
          change: number
          changesPercentage: number
          volume: number
        }) => {
          const gainer: Omit<TopGainer, 'shortScore'> = {
            symbol: item.symbol,
            name: item.name,
            price: item.price,
            change: item.change,
            changePercent: item.changesPercentage,
            volume: item.volume,
          }
          return { ...gainer, shortScore: calculateShortScore({ ...gainer, shortScore: 0 }) }
        }).sort((a: TopGainer, b: TopGainer) => b.shortScore - a.shortScore)

        return NextResponse.json({ gainers })
      }
    } catch (e) {
      console.error('Top gainers API error:', e)
    }
  }

  // Return mock data
  return NextResponse.json({ gainers: getMockTopGainers() })
}

function getMockTopGainers(): TopGainer[] {
  const stocks = [
    { symbol: 'NVDA', name: 'NVIDIA Corporation', basePrice: 875 },
    { symbol: 'SMCI', name: 'Super Micro Computer', basePrice: 920 },
    { symbol: 'AMD', name: 'Advanced Micro Devices', basePrice: 165 },
    { symbol: 'PLTR', name: 'Palantir Technologies', basePrice: 22 },
    { symbol: 'MSTR', name: 'MicroStrategy Inc.', basePrice: 1450 },
    { symbol: 'COIN', name: 'Coinbase Global', basePrice: 225 },
    { symbol: 'SNOW', name: 'Snowflake Inc.', basePrice: 165 },
    { symbol: 'ARM', name: 'Arm Holdings', basePrice: 140 },
    { symbol: 'CRWD', name: 'CrowdStrike Holdings', basePrice: 310 },
    { symbol: 'NET', name: 'Cloudflare Inc.', basePrice: 85 },
  ]

  return stocks.map((stock) => {
    const changePercent = Math.random() * 8 + 2 // 2-10% gain
    const change = stock.basePrice * (changePercent / 100)
    const gainer: Omit<TopGainer, 'shortScore'> = {
      symbol: stock.symbol,
      name: stock.name,
      price: stock.basePrice + change,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 50000000) + 10000000,
    }
    return { ...gainer, shortScore: calculateShortScore({ ...gainer, shortScore: 0 }) }
  }).sort((a, b) => b.shortScore - a.shortScore)
}
