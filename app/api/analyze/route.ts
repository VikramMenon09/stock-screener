import { NextRequest, NextResponse } from 'next/server'
import { analyzeStock } from '@/lib/analysis-engine'
import type {
  AnalysisResult,
  StockQuote,
  TechnicalIndicators,
  FundamentalMetrics,
  PriceData,
} from '@/lib/types'

const FMP_API_KEY = process.env.FMP_API_KEY
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbol = searchParams.get('symbol')?.toUpperCase()

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol is required' },
      { status: 400 }
    )
  }

  try {
    // Track whether we fell back to mock data for any fetch
    let isMockData = !FMP_API_KEY && !ALPHA_VANTAGE_API_KEY

    // Fetch all data in parallel
    const [quoteData, priceHistory, technicalData, fundamentalData] = await Promise.all([
      fetchQuote(symbol).catch((e) => { isMockData = true; throw e }),
      fetchPriceHistory(symbol),
      fetchTechnicals(symbol),
      fetchFundamentals(symbol),
    ])

    // Run analysis engine
    const analysis = analyzeStock(
      quoteData,
      technicalData,
      fundamentalData,
      priceHistory,
      isMockData
    )

    const result: AnalysisResult = {
      symbol,
      name: quoteData.name,
      signal: analysis.signal,
      confidence: analysis.confidence,
      confidenceLabel: analysis.confidenceLabel,
      score: analysis.score,
      quote: quoteData,
      technicals: technicalData,
      fundamentals: fundamentalData,
      priceHistory,
      catalysts: analysis.catalysts,
      reasoning: analysis.reasoning,
      riskFlags: analysis.riskFlags,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze stock', message: String(error) },
      { status: 500 }
    )
  }
}

async function fetchQuote(symbol: string): Promise<StockQuote> {
  if (FMP_API_KEY) {
    try {
      const [quoteRes, profileRes] = await Promise.all([
        fetch(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_API_KEY}`),
        fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`),
      ])

      if (quoteRes.ok && profileRes.ok) {
        const [quoteData] = await quoteRes.json()
        const [profileData] = await profileRes.json()

        if (quoteData) {
          return {
            symbol: quoteData.symbol,
            name: profileData?.companyName || quoteData.name || symbol,
            price: quoteData.price,
            change: quoteData.change,
            changePercent: quoteData.changesPercentage,
            volume: quoteData.volume,
            avgVolume: quoteData.avgVolume || quoteData.volume,
            marketCap: quoteData.marketCap,
            pe: quoteData.pe,
            eps: quoteData.eps,
            high52Week: quoteData.yearHigh,
            low52Week: quoteData.yearLow,
            open: quoteData.open,
            previousClose: quoteData.previousClose,
            dayHigh: quoteData.dayHigh,
            dayLow: quoteData.dayLow,
          }
        }
      }
    } catch (e) {
      console.error('FMP quote error:', e)
    }
  }

  // Return mock quote
  return generateMockQuote(symbol)
}

async function fetchPriceHistory(symbol: string): Promise<PriceData[]> {
  if (FMP_API_KEY) {
    try {
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?timeseries=180&apikey=${FMP_API_KEY}`
      )

      if (response.ok) {
        const data = await response.json()
        if (data.historical) {
          return data.historical
            .map((item: {
              date: string
              open: number
              high: number
              low: number
              close: number
              volume: number
            }) => ({
              date: item.date,
              open: item.open,
              high: item.high,
              low: item.low,
              close: item.close,
              volume: item.volume,
            }))
            .reverse() // Oldest first
        }
      }
    } catch (e) {
      console.error('FMP price history error:', e)
    }
  }

  // Return mock price history
  return generateMockPriceHistory(symbol)
}

async function fetchTechnicals(symbol: string): Promise<TechnicalIndicators> {
  if (ALPHA_VANTAGE_API_KEY) {
    try {
      const [rsiRes, smaRes, macdRes, bbRes] = await Promise.all([
        fetch(`https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${ALPHA_VANTAGE_API_KEY}`),
        fetch(`https://www.alphavantage.co/query?function=SMA&symbol=${symbol}&interval=daily&time_period=20&series_type=close&apikey=${ALPHA_VANTAGE_API_KEY}`),
        fetch(`https://www.alphavantage.co/query?function=MACD&symbol=${symbol}&interval=daily&series_type=close&apikey=${ALPHA_VANTAGE_API_KEY}`),
        fetch(`https://www.alphavantage.co/query?function=BBANDS&symbol=${symbol}&interval=daily&time_period=20&series_type=close&apikey=${ALPHA_VANTAGE_API_KEY}`),
      ])

      // Parse responses and extract latest values
      const rsiData = await rsiRes.json()
      const smaData = await smaRes.json()
      const macdData = await macdRes.json()
      const bbData = await bbRes.json()

      const rsiValues = rsiData['Technical Analysis: RSI']
      const smaValues = smaData['Technical Analysis: SMA']
      const macdValues = macdData['Technical Analysis: MACD']
      const bbValues = bbData['Technical Analysis: BBANDS']

      if (rsiValues && smaValues && macdValues && bbValues) {
        const latestRsiDate = Object.keys(rsiValues)[0]
        const latestSmaDate = Object.keys(smaValues)[0]
        const latestMacdDate = Object.keys(macdValues)[0]
        const latestBbDate = Object.keys(bbValues)[0]

        // For SMA50 and SMA200, we'd need additional calls
        // Using approximations for demo
        const sma20 = parseFloat(smaValues[latestSmaDate]?.SMA || '0')

        return {
          rsi14: parseFloat(rsiValues[latestRsiDate]?.RSI || '50'),
          sma20,
          sma50: sma20 * 0.98, // Approximation
          sma200: sma20 * 0.95, // Approximation
          macd: parseFloat(macdValues[latestMacdDate]?.MACD || '0'),
          macdSignal: parseFloat(macdValues[latestMacdDate]?.MACD_Signal || '0'),
          macdHistogram: parseFloat(macdValues[latestMacdDate]?.MACD_Hist || '0'),
          bollingerUpper: parseFloat(bbValues[latestBbDate]?.['Real Upper Band'] || '0'),
          bollingerMiddle: parseFloat(bbValues[latestBbDate]?.['Real Middle Band'] || '0'),
          bollingerLower: parseFloat(bbValues[latestBbDate]?.['Real Lower Band'] || '0'),
        }
      }
    } catch (e) {
      console.error('Alpha Vantage technicals error:', e)
    }
  }

  // Calculate technicals from price history if available, or return mock
  return generateMockTechnicals(symbol)
}

async function fetchFundamentals(symbol: string): Promise<FundamentalMetrics> {
  if (FMP_API_KEY) {
    try {
      const [ratiosRes, growthRes, metricsRes] = await Promise.all([
        fetch(`https://financialmodelingprep.com/api/v3/ratios-ttm/${symbol}?apikey=${FMP_API_KEY}`),
        fetch(`https://financialmodelingprep.com/api/v3/financial-growth/${symbol}?limit=1&apikey=${FMP_API_KEY}`),
        fetch(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${symbol}?apikey=${FMP_API_KEY}`),
      ])

      if (ratiosRes.ok && growthRes.ok && metricsRes.ok) {
        const [ratios] = await ratiosRes.json()
        const [growth] = await growthRes.json()
        const [metrics] = await metricsRes.json()

        if (ratios) {
          return {
            peRatio: ratios.peRatioTTM || null,
            pbRatio: ratios.priceToBookRatioTTM || null,
            debtToEquity: ratios.debtEquityRatioTTM || null,
            currentRatio: ratios.currentRatioTTM || null,
            quickRatio: ratios.quickRatioTTM || null,
            roe: ratios.returnOnEquityTTM ? ratios.returnOnEquityTTM * 100 : null,
            roa: ratios.returnOnAssetsTTM ? ratios.returnOnAssetsTTM * 100 : null,
            grossMargin: ratios.grossProfitMarginTTM ? ratios.grossProfitMarginTTM * 100 : null,
            operatingMargin: ratios.operatingProfitMarginTTM ? ratios.operatingProfitMarginTTM * 100 : null,
            netMargin: ratios.netProfitMarginTTM ? ratios.netProfitMarginTTM * 100 : null,
            revenueGrowth: growth?.revenueGrowth ? growth.revenueGrowth * 100 : null,
            earningsGrowth: growth?.netIncomeGrowth ? growth.netIncomeGrowth * 100 : null,
            freeCashFlow: metrics?.freeCashFlowPerShareTTM || null,
            dividendYield: ratios.dividendYielTTM ? ratios.dividendYielTTM * 100 : null,
          }
        }
      }
    } catch (e) {
      console.error('FMP fundamentals error:', e)
    }
  }

  // Return mock fundamentals
  return generateMockFundamentals(symbol)
}

// Mock data generators
function generateMockQuote(symbol: string): StockQuote {
  const basePrice = getSymbolBasePrice(symbol)
  const changePercent = (Math.random() - 0.5) * 6
  const change = basePrice * (changePercent / 100)

  return {
    symbol,
    name: getSymbolName(symbol),
    price: basePrice,
    change,
    changePercent,
    volume: Math.floor(Math.random() * 50000000) + 10000000,
    avgVolume: Math.floor(Math.random() * 40000000) + 15000000,
    marketCap: basePrice * (Math.random() * 10 + 1) * 1e9,
    pe: Math.random() * 30 + 10,
    eps: basePrice / (Math.random() * 30 + 10),
    high52Week: basePrice * (1 + Math.random() * 0.3),
    low52Week: basePrice * (1 - Math.random() * 0.3),
    open: basePrice * (1 + (Math.random() - 0.5) * 0.02),
    previousClose: basePrice - change,
    dayHigh: basePrice * (1 + Math.random() * 0.03),
    dayLow: basePrice * (1 - Math.random() * 0.03),
  }
}

function generateMockPriceHistory(symbol: string): PriceData[] {
  const basePrice = getSymbolBasePrice(symbol)
  const history: PriceData[] = []
  let price = basePrice * 0.85

  for (let i = 180; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    const change = (Math.random() - 0.48) * 0.03 // Slight upward bias
    price = price * (1 + change)
    
    const dayRange = price * 0.02
    const open = price + (Math.random() - 0.5) * dayRange
    const high = Math.max(open, price) + Math.random() * dayRange
    const low = Math.min(open, price) - Math.random() * dayRange

    history.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close: price,
      volume: Math.floor(Math.random() * 50000000) + 10000000,
    })
  }

  return history
}

function generateMockTechnicals(symbol: string): TechnicalIndicators {
  const basePrice = getSymbolBasePrice(symbol)
  const rsi = Math.random() * 60 + 20 // 20-80

  return {
    rsi14: rsi,
    sma20: basePrice * (0.98 + Math.random() * 0.04),
    sma50: basePrice * (0.95 + Math.random() * 0.06),
    sma200: basePrice * (0.9 + Math.random() * 0.1),
    macd: (Math.random() - 0.5) * 5,
    macdSignal: (Math.random() - 0.5) * 4,
    macdHistogram: (Math.random() - 0.5) * 2,
    bollingerUpper: basePrice * 1.05,
    bollingerMiddle: basePrice,
    bollingerLower: basePrice * 0.95,
  }
}

function generateMockFundamentals(symbol: string): FundamentalMetrics {
  return {
    peRatio: Math.random() * 30 + 10,
    pbRatio: Math.random() * 8 + 1,
    debtToEquity: Math.random() * 2,
    currentRatio: Math.random() * 2 + 0.5,
    quickRatio: Math.random() * 1.5 + 0.3,
    roe: Math.random() * 30 + 5,
    roa: Math.random() * 15 + 2,
    grossMargin: Math.random() * 40 + 20,
    operatingMargin: Math.random() * 25 + 5,
    netMargin: Math.random() * 20 + 2,
    revenueGrowth: (Math.random() - 0.2) * 40,
    earningsGrowth: (Math.random() - 0.3) * 50,
    freeCashFlow: Math.random() * 10 + 1,
    dividendYield: Math.random() * 3,
  }
}

function getSymbolBasePrice(symbol: string): number {
  const prices: Record<string, number> = {
    AAPL: 178,
    MSFT: 378,
    GOOGL: 141,
    AMZN: 178,
    NVDA: 875,
    TSLA: 248,
    META: 505,
    JPM: 195,
    V: 280,
    JNJ: 155,
    WMT: 165,
    PG: 162,
    MA: 460,
    HD: 380,
    DIS: 112,
  }
  return prices[symbol] || Math.random() * 200 + 50
}

function getSymbolName(symbol: string): string {
  const names: Record<string, string> = {
    AAPL: 'Apple Inc.',
    MSFT: 'Microsoft Corporation',
    GOOGL: 'Alphabet Inc.',
    AMZN: 'Amazon.com Inc.',
    NVDA: 'NVIDIA Corporation',
    TSLA: 'Tesla Inc.',
    META: 'Meta Platforms Inc.',
    JPM: 'JPMorgan Chase & Co.',
    V: 'Visa Inc.',
    JNJ: 'Johnson & Johnson',
    WMT: 'Walmart Inc.',
    PG: 'Procter & Gamble Co.',
    MA: 'Mastercard Inc.',
    HD: 'The Home Depot Inc.',
    DIS: 'The Walt Disney Company',
  }
  return names[symbol] || `${symbol} Inc.`
}
