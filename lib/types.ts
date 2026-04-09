// Stock Screener Type Definitions

export type Signal = 'LONG' | 'SHORT' | 'NEUTRAL'

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  avgVolume: number
  marketCap: number
  pe: number | null
  eps: number | null
  high52Week: number
  low52Week: number
  open: number
  previousClose: number
  dayHigh: number
  dayLow: number
}

export interface TechnicalIndicators {
  rsi14: number
  sma20: number
  sma50: number
  sma200: number
  macd: number
  macdSignal: number
  macdHistogram: number
  bollingerUpper: number
  bollingerMiddle: number
  bollingerLower: number
}

export interface FundamentalMetrics {
  peRatio: number | null
  pbRatio: number | null
  debtToEquity: number | null
  currentRatio: number | null
  quickRatio: number | null
  roe: number | null
  roa: number | null
  grossMargin: number | null
  operatingMargin: number | null
  netMargin: number | null
  revenueGrowth: number | null
  earningsGrowth: number | null
  freeCashFlow: number | null
  dividendYield: number | null
}

export interface PriceData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface RiskFlag {
  type: 'squeeze' | 'volatility' | 'data'
  label: string
  description: string
  severity: 'high' | 'medium' | 'low'
}

export interface AnalysisResult {
  symbol: string
  name: string
  signal: Signal
  confidence: number // 0-100
  confidenceLabel: 'Low' | 'Medium' | 'High'
  score: number // Raw score used for signal determination
  quote: StockQuote
  technicals: TechnicalIndicators
  fundamentals: FundamentalMetrics
  priceHistory: PriceData[]
  catalysts: Catalyst[]
  reasoning: ReasoningItem[]
  riskFlags: RiskFlag[]
  timestamp: string
}

export interface Catalyst {
  type: 'bullish' | 'bearish' | 'neutral'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
}

export interface ReasoningItem {
  category: 'technical' | 'fundamental' | 'momentum'
  label: string
  value: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  weight: number
}

export interface TopGainer {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  shortScore: number
}

export interface SearchResult {
  symbol: string
  name: string
  exchange: string
  type: string
}

export interface APIError {
  error: string
  message: string
  status: number
}
