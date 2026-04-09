import type {
  Signal,
  TechnicalIndicators,
  FundamentalMetrics,
  StockQuote,
  Catalyst,
  ReasoningItem,
  PriceData,
  RiskFlag,
  TopGainer,
} from './types'

// Signal thresholds
const LONG_THRESHOLD = 65
const SHORT_THRESHOLD = 35

// Weight distribution
const TECHNICAL_WEIGHT = 0.4
const FUNDAMENTAL_WEIGHT = 0.4
const MOMENTUM_WEIGHT = 0.2

interface ScoreResult {
  score: number
  reasoning: ReasoningItem[]
}

/**
 * Calculate technical score (0-100)
 */
export function calculateTechnicalScore(
  technicals: TechnicalIndicators,
  quote: StockQuote
): ScoreResult {
  const reasoning: ReasoningItem[] = []
  let totalScore = 0
  let weightSum = 0

  // RSI Analysis (weight: 20%)
  const rsiWeight = 0.2
  let rsiScore = 50
  if (technicals.rsi14 < 30) {
    rsiScore = 80 // Oversold = bullish
    reasoning.push({
      category: 'technical',
      label: 'RSI Oversold',
      value: `${technicals.rsi14.toFixed(1)}`,
      sentiment: 'bullish',
      weight: rsiWeight,
    })
  } else if (technicals.rsi14 > 70) {
    rsiScore = 20 // Overbought = bearish
    reasoning.push({
      category: 'technical',
      label: 'RSI Overbought',
      value: `${technicals.rsi14.toFixed(1)}`,
      sentiment: 'bearish',
      weight: rsiWeight,
    })
  } else {
    rsiScore = 50 + ((50 - technicals.rsi14) / 20) * 30
    reasoning.push({
      category: 'technical',
      label: 'RSI',
      value: `${technicals.rsi14.toFixed(1)}`,
      sentiment: 'neutral',
      weight: rsiWeight,
    })
  }
  totalScore += rsiScore * rsiWeight
  weightSum += rsiWeight

  // Moving Average Analysis (weight: 25%)
  const maWeight = 0.25
  const priceVsSma20 = ((quote.price - technicals.sma20) / technicals.sma20) * 100
  const priceVsSma50 = ((quote.price - technicals.sma50) / technicals.sma50) * 100
  const priceVsSma200 = ((quote.price - technicals.sma200) / technicals.sma200) * 100

  let maScore = 50
  const aboveMAs = [priceVsSma20 > 0, priceVsSma50 > 0, priceVsSma200 > 0].filter(Boolean).length

  if (aboveMAs === 3) {
    maScore = 75
    reasoning.push({
      category: 'technical',
      label: 'Above All MAs',
      value: 'SMA 20/50/200',
      sentiment: 'bullish',
      weight: maWeight,
    })
  } else if (aboveMAs === 0) {
    maScore = 25
    reasoning.push({
      category: 'technical',
      label: 'Below All MAs',
      value: 'SMA 20/50/200',
      sentiment: 'bearish',
      weight: maWeight,
    })
  } else {
    maScore = 40 + aboveMAs * 10
    reasoning.push({
      category: 'technical',
      label: 'Mixed MA Signals',
      value: `${aboveMAs}/3 above`,
      sentiment: 'neutral',
      weight: maWeight,
    })
  }
  totalScore += maScore * maWeight
  weightSum += maWeight

  // MA Crossover: Death Cross / Golden Cross (weight: 10%)
  const crossWeight = 0.1
  let crossScore = 50
  const sma50VsSma200 = ((technicals.sma50 - technicals.sma200) / technicals.sma200) * 100
  if (sma50VsSma200 > 2) {
    // 50-day clearly above 200-day: Golden Cross confirmed
    crossScore = 75
    reasoning.push({
      category: 'technical',
      label: 'Golden Cross',
      value: `50MA ${sma50VsSma200.toFixed(1)}% above 200MA`,
      sentiment: 'bullish',
      weight: crossWeight,
    })
  } else if (sma50VsSma200 < -2) {
    // 50-day clearly below 200-day: Death Cross confirmed
    crossScore = 20
    reasoning.push({
      category: 'technical',
      label: 'Death Cross',
      value: `50MA ${Math.abs(sma50VsSma200).toFixed(1)}% below 200MA`,
      sentiment: 'bearish',
      weight: crossWeight,
    })
  } else {
    reasoning.push({
      category: 'technical',
      label: 'MA Crossover',
      value: `50MA near 200MA (${sma50VsSma200 >= 0 ? '+' : ''}${sma50VsSma200.toFixed(1)}%)`,
      sentiment: 'neutral',
      weight: crossWeight,
    })
  }
  totalScore += crossScore * crossWeight
  weightSum += crossWeight

  // MACD Analysis (weight: 25%)
  const macdWeight = 0.25
  let macdScore = 50
  if (technicals.macdHistogram > 0 && technicals.macd > technicals.macdSignal) {
    macdScore = 70
    reasoning.push({
      category: 'technical',
      label: 'MACD Bullish',
      value: `Histogram: ${technicals.macdHistogram.toFixed(2)}`,
      sentiment: 'bullish',
      weight: macdWeight,
    })
  } else if (technicals.macdHistogram < 0 && technicals.macd < technicals.macdSignal) {
    macdScore = 30
    reasoning.push({
      category: 'technical',
      label: 'MACD Bearish',
      value: `Histogram: ${technicals.macdHistogram.toFixed(2)}`,
      sentiment: 'bearish',
      weight: macdWeight,
    })
  } else {
    reasoning.push({
      category: 'technical',
      label: 'MACD Neutral',
      value: `Histogram: ${technicals.macdHistogram.toFixed(2)}`,
      sentiment: 'neutral',
      weight: macdWeight,
    })
  }
  totalScore += macdScore * macdWeight
  weightSum += macdWeight

  // Bollinger Band Analysis (weight: 20%)
  const bbWeight = 0.2
  let bbScore = 50
  const bbPosition = (quote.price - technicals.bollingerLower) /
    (technicals.bollingerUpper - technicals.bollingerLower)

  if (bbPosition < 0.2) {
    bbScore = 70 // Near lower band = potential bounce
    reasoning.push({
      category: 'technical',
      label: 'Near Lower BB',
      value: `${(bbPosition * 100).toFixed(0)}% position`,
      sentiment: 'bullish',
      weight: bbWeight,
    })
  } else if (bbPosition > 0.8) {
    bbScore = 30 // Near upper band = potential pullback
    reasoning.push({
      category: 'technical',
      label: 'Near Upper BB',
      value: `${(bbPosition * 100).toFixed(0)}% position`,
      sentiment: 'bearish',
      weight: bbWeight,
    })
  } else {
    reasoning.push({
      category: 'technical',
      label: 'BB Position',
      value: `${(bbPosition * 100).toFixed(0)}% position`,
      sentiment: 'neutral',
      weight: bbWeight,
    })
  }
  totalScore += bbScore * bbWeight
  weightSum += bbWeight

  return {
    score: totalScore / weightSum,
    reasoning,
  }
}

/**
 * Calculate fundamental score (0-100)
 */
export function calculateFundamentalScore(
  fundamentals: FundamentalMetrics
): ScoreResult {
  const reasoning: ReasoningItem[] = []
  let totalScore = 0
  let weightSum = 0

  // P/E Ratio Analysis (weight: 20%)
  if (fundamentals.peRatio !== null) {
    const peWeight = 0.2
    let peScore = 50
    if (fundamentals.peRatio < 15) {
      peScore = 75
      reasoning.push({
        category: 'fundamental',
        label: 'Low P/E',
        value: `${fundamentals.peRatio.toFixed(1)}x`,
        sentiment: 'bullish',
        weight: peWeight,
      })
    } else if (fundamentals.peRatio > 30) {
      peScore = 30
      reasoning.push({
        category: 'fundamental',
        label: 'High P/E',
        value: `${fundamentals.peRatio.toFixed(1)}x`,
        sentiment: 'bearish',
        weight: peWeight,
      })
    } else {
      reasoning.push({
        category: 'fundamental',
        label: 'P/E Ratio',
        value: `${fundamentals.peRatio.toFixed(1)}x`,
        sentiment: 'neutral',
        weight: peWeight,
      })
    }
    totalScore += peScore * peWeight
    weightSum += peWeight
  }

  // ROE Analysis (weight: 20%)
  if (fundamentals.roe !== null) {
    const roeWeight = 0.2
    let roeScore = 50
    if (fundamentals.roe > 20) {
      roeScore = 80
      reasoning.push({
        category: 'fundamental',
        label: 'Strong ROE',
        value: `${fundamentals.roe.toFixed(1)}%`,
        sentiment: 'bullish',
        weight: roeWeight,
      })
    } else if (fundamentals.roe < 10) {
      roeScore = 35
      reasoning.push({
        category: 'fundamental',
        label: 'Weak ROE',
        value: `${fundamentals.roe.toFixed(1)}%`,
        sentiment: 'bearish',
        weight: roeWeight,
      })
    } else {
      reasoning.push({
        category: 'fundamental',
        label: 'ROE',
        value: `${fundamentals.roe.toFixed(1)}%`,
        sentiment: 'neutral',
        weight: roeWeight,
      })
    }
    totalScore += roeScore * roeWeight
    weightSum += roeWeight
  }

  // Debt to Equity (weight: 15%)
  if (fundamentals.debtToEquity !== null) {
    const deWeight = 0.15
    let deScore = 50
    if (fundamentals.debtToEquity < 0.5) {
      deScore = 75
      reasoning.push({
        category: 'fundamental',
        label: 'Low Debt',
        value: `${fundamentals.debtToEquity.toFixed(2)}x D/E`,
        sentiment: 'bullish',
        weight: deWeight,
      })
    } else if (fundamentals.debtToEquity > 2) {
      deScore = 30
      reasoning.push({
        category: 'fundamental',
        label: 'High Debt',
        value: `${fundamentals.debtToEquity.toFixed(2)}x D/E`,
        sentiment: 'bearish',
        weight: deWeight,
      })
    } else {
      reasoning.push({
        category: 'fundamental',
        label: 'Debt/Equity',
        value: `${fundamentals.debtToEquity.toFixed(2)}x`,
        sentiment: 'neutral',
        weight: deWeight,
      })
    }
    totalScore += deScore * deWeight
    weightSum += deWeight
  }

  // Revenue Growth (weight: 20%)
  if (fundamentals.revenueGrowth !== null) {
    const rgWeight = 0.2
    let rgScore = 50
    if (fundamentals.revenueGrowth > 15) {
      rgScore = 80
      reasoning.push({
        category: 'fundamental',
        label: 'Strong Revenue Growth',
        value: `${fundamentals.revenueGrowth.toFixed(1)}%`,
        sentiment: 'bullish',
        weight: rgWeight,
      })
    } else if (fundamentals.revenueGrowth < 0) {
      rgScore = 25
      reasoning.push({
        category: 'fundamental',
        label: 'Revenue Decline',
        value: `${fundamentals.revenueGrowth.toFixed(1)}%`,
        sentiment: 'bearish',
        weight: rgWeight,
      })
    } else {
      reasoning.push({
        category: 'fundamental',
        label: 'Revenue Growth',
        value: `${fundamentals.revenueGrowth.toFixed(1)}%`,
        sentiment: 'neutral',
        weight: rgWeight,
      })
    }
    totalScore += rgScore * rgWeight
    weightSum += rgWeight
  }

  // Profit Margins (weight: 15%)
  if (fundamentals.netMargin !== null) {
    const nmWeight = 0.15
    let nmScore = 50
    if (fundamentals.netMargin > 15) {
      nmScore = 75
      reasoning.push({
        category: 'fundamental',
        label: 'High Margins',
        value: `${fundamentals.netMargin.toFixed(1)}% net`,
        sentiment: 'bullish',
        weight: nmWeight,
      })
    } else if (fundamentals.netMargin < 5) {
      nmScore = 30
      reasoning.push({
        category: 'fundamental',
        label: 'Thin Margins',
        value: `${fundamentals.netMargin.toFixed(1)}% net`,
        sentiment: 'bearish',
        weight: nmWeight,
      })
    } else {
      reasoning.push({
        category: 'fundamental',
        label: 'Net Margin',
        value: `${fundamentals.netMargin.toFixed(1)}%`,
        sentiment: 'neutral',
        weight: nmWeight,
      })
    }
    totalScore += nmScore * nmWeight
    weightSum += nmWeight
  }

  // Current Ratio (weight: 10%)
  if (fundamentals.currentRatio !== null) {
    const crWeight = 0.1
    let crScore = 50
    if (fundamentals.currentRatio > 2) {
      crScore = 70
      reasoning.push({
        category: 'fundamental',
        label: 'Strong Liquidity',
        value: `${fundamentals.currentRatio.toFixed(2)}x`,
        sentiment: 'bullish',
        weight: crWeight,
      })
    } else if (fundamentals.currentRatio < 1) {
      crScore = 25
      reasoning.push({
        category: 'fundamental',
        label: 'Liquidity Risk',
        value: `${fundamentals.currentRatio.toFixed(2)}x`,
        sentiment: 'bearish',
        weight: crWeight,
      })
    } else {
      reasoning.push({
        category: 'fundamental',
        label: 'Current Ratio',
        value: `${fundamentals.currentRatio.toFixed(2)}x`,
        sentiment: 'neutral',
        weight: crWeight,
      })
    }
    totalScore += crScore * crWeight
    weightSum += crWeight
  }

  // If no fundamentals available, return neutral
  if (weightSum === 0) {
    return {
      score: 50,
      reasoning: [{
        category: 'fundamental',
        label: 'Limited Data',
        value: 'Insufficient fundamental data',
        sentiment: 'neutral',
        weight: 1,
      }],
    }
  }

  return {
    score: totalScore / weightSum,
    reasoning,
  }
}

/**
 * Calculate momentum score (0-100)
 */
export function calculateMomentumScore(
  quote: StockQuote,
  priceHistory: PriceData[]
): ScoreResult {
  const reasoning: ReasoningItem[] = []
  let totalScore = 0
  let weightSum = 0

  // Daily Change (weight: 20%)
  const dailyWeight = 0.2
  let dailyScore = 50
  if (quote.changePercent > 3) {
    dailyScore = 75
    reasoning.push({
      category: 'momentum',
      label: 'Strong Daily Gain',
      value: `+${quote.changePercent.toFixed(2)}%`,
      sentiment: 'bullish',
      weight: dailyWeight,
    })
  } else if (quote.changePercent < -3) {
    dailyScore = 30
    reasoning.push({
      category: 'momentum',
      label: 'Sharp Daily Decline',
      value: `${quote.changePercent.toFixed(2)}%`,
      sentiment: 'bearish',
      weight: dailyWeight,
    })
  } else {
    dailyScore = 50 + (quote.changePercent * 5)
    reasoning.push({
      category: 'momentum',
      label: 'Daily Change',
      value: `${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%`,
      sentiment: quote.changePercent > 0 ? 'bullish' : quote.changePercent < 0 ? 'bearish' : 'neutral',
      weight: dailyWeight,
    })
  }
  totalScore += Math.max(0, Math.min(100, dailyScore)) * dailyWeight
  weightSum += dailyWeight

  // Volume Analysis (weight: 20%)
  const volumeWeight = 0.2
  let volumeScore = 50
  const volumeRatio = quote.volume / quote.avgVolume
  if (volumeRatio > 2 && quote.changePercent > 0) {
    volumeScore = 80
    reasoning.push({
      category: 'momentum',
      label: 'High Volume Rally',
      value: `${volumeRatio.toFixed(1)}x avg vol`,
      sentiment: 'bullish',
      weight: volumeWeight,
    })
  } else if (volumeRatio > 2 && quote.changePercent < 0) {
    volumeScore = 25
    reasoning.push({
      category: 'momentum',
      label: 'High Volume Selloff',
      value: `${volumeRatio.toFixed(1)}x avg vol`,
      sentiment: 'bearish',
      weight: volumeWeight,
    })
  } else {
    reasoning.push({
      category: 'momentum',
      label: 'Volume',
      value: `${volumeRatio.toFixed(1)}x avg`,
      sentiment: 'neutral',
      weight: volumeWeight,
    })
  }
  totalScore += volumeScore * volumeWeight
  weightSum += volumeWeight

  // 52-Week Range Position (weight: 15%)
  const rangeWeight = 0.15
  const rangePosition = (quote.price - quote.low52Week) / (quote.high52Week - quote.low52Week)
  let rangeScore = 50
  if (rangePosition > 0.8) {
    rangeScore = 65
    reasoning.push({
      category: 'momentum',
      label: 'Near 52W High',
      value: `${(rangePosition * 100).toFixed(0)}% of range`,
      sentiment: 'bullish',
      weight: rangeWeight,
    })
  } else if (rangePosition < 0.2) {
    rangeScore = 40
    reasoning.push({
      category: 'momentum',
      label: 'Near 52W Low',
      value: `${(rangePosition * 100).toFixed(0)}% of range`,
      sentiment: 'bearish',
      weight: rangeWeight,
    })
  } else {
    reasoning.push({
      category: 'momentum',
      label: '52W Range Position',
      value: `${(rangePosition * 100).toFixed(0)}%`,
      sentiment: 'neutral',
      weight: rangeWeight,
    })
  }
  totalScore += rangeScore * rangeWeight
  weightSum += rangeWeight

  // 5-Day Trend (weight: 15%)
  if (priceHistory.length >= 5) {
    const trendWeight = 0.15
    const recent5 = priceHistory.slice(-5)
    const fiveDayChange = ((recent5[recent5.length - 1].close - recent5[0].close) / recent5[0].close) * 100
    let trendScore = 50
    if (fiveDayChange > 5) {
      trendScore = 75
      reasoning.push({
        category: 'momentum',
        label: '5-Day Uptrend',
        value: `+${fiveDayChange.toFixed(1)}%`,
        sentiment: 'bullish',
        weight: trendWeight,
      })
    } else if (fiveDayChange < -5) {
      trendScore = 30
      reasoning.push({
        category: 'momentum',
        label: '5-Day Downtrend',
        value: `${fiveDayChange.toFixed(1)}%`,
        sentiment: 'bearish',
        weight: trendWeight,
      })
    } else {
      trendScore = 50 + fiveDayChange * 3
      reasoning.push({
        category: 'momentum',
        label: '5-Day Trend',
        value: `${fiveDayChange >= 0 ? '+' : ''}${fiveDayChange.toFixed(1)}%`,
        sentiment: fiveDayChange > 0 ? 'bullish' : fiveDayChange < 0 ? 'bearish' : 'neutral',
        weight: trendWeight,
      })
    }
    totalScore += Math.max(0, Math.min(100, trendScore)) * trendWeight
    weightSum += trendWeight
  }

  // 1-Month Return (weight: 15%)
  if (priceHistory.length >= 21) {
    const oneMonthWeight = 0.15
    const recent21 = priceHistory.slice(-21)
    const oneMonthChange = ((recent21[recent21.length - 1].close - recent21[0].close) / recent21[0].close) * 100
    let oneMonthScore = 50

    if (oneMonthChange > 25) {
      // Parabolic move — strong short extension signal
      oneMonthScore = 25
      reasoning.push({
        category: 'momentum',
        label: 'Parabolic 1M Move',
        value: `+${oneMonthChange.toFixed(1)}%`,
        sentiment: 'bearish',
        weight: oneMonthWeight,
      })
    } else if (oneMonthChange > 10) {
      oneMonthScore = 70
      reasoning.push({
        category: 'momentum',
        label: '1M Strong Rally',
        value: `+${oneMonthChange.toFixed(1)}%`,
        sentiment: 'bullish',
        weight: oneMonthWeight,
      })
    } else if (oneMonthChange < -10) {
      oneMonthScore = 30
      reasoning.push({
        category: 'momentum',
        label: '1M Decline',
        value: `${oneMonthChange.toFixed(1)}%`,
        sentiment: 'bearish',
        weight: oneMonthWeight,
      })
    } else {
      oneMonthScore = 50 + oneMonthChange * 1.5
      reasoning.push({
        category: 'momentum',
        label: '1-Month Return',
        value: `${oneMonthChange >= 0 ? '+' : ''}${oneMonthChange.toFixed(1)}%`,
        sentiment: oneMonthChange > 0 ? 'bullish' : oneMonthChange < 0 ? 'bearish' : 'neutral',
        weight: oneMonthWeight,
      })
    }
    totalScore += Math.max(0, Math.min(100, oneMonthScore)) * oneMonthWeight
    weightSum += oneMonthWeight
  }

  // 3-Month Return (weight: 15%)
  if (priceHistory.length >= 63) {
    const threeMonthWeight = 0.15
    const recent63 = priceHistory.slice(-63)
    const threeMonthChange = ((recent63[recent63.length - 1].close - recent63[0].close) / recent63[0].close) * 100
    let threeMonthScore = 50

    if (threeMonthChange > 40) {
      // Extended parabolic: bearish for short thesis
      threeMonthScore = 25
      reasoning.push({
        category: 'momentum',
        label: 'Extended 3M Rally',
        value: `+${threeMonthChange.toFixed(1)}%`,
        sentiment: 'bearish',
        weight: threeMonthWeight,
      })
    } else if (threeMonthChange > 15) {
      threeMonthScore = 70
      reasoning.push({
        category: 'momentum',
        label: '3M Strong Trend',
        value: `+${threeMonthChange.toFixed(1)}%`,
        sentiment: 'bullish',
        weight: threeMonthWeight,
      })
    } else if (threeMonthChange < -15) {
      threeMonthScore = 30
      reasoning.push({
        category: 'momentum',
        label: '3M Downtrend',
        value: `${threeMonthChange.toFixed(1)}%`,
        sentiment: 'bearish',
        weight: threeMonthWeight,
      })
    } else {
      threeMonthScore = 50 + threeMonthChange
      reasoning.push({
        category: 'momentum',
        label: '3-Month Return',
        value: `${threeMonthChange >= 0 ? '+' : ''}${threeMonthChange.toFixed(1)}%`,
        sentiment: threeMonthChange > 0 ? 'bullish' : threeMonthChange < 0 ? 'bearish' : 'neutral',
        weight: threeMonthWeight,
      })
    }
    totalScore += Math.max(0, Math.min(100, threeMonthScore)) * threeMonthWeight
    weightSum += threeMonthWeight
  }

  return {
    score: totalScore / weightSum,
    reasoning,
  }
}

/**
 * Generate risk flags based on market conditions
 */
export function generateRiskFlags(
  quote: StockQuote,
  technicals: TechnicalIndicators,
  priceHistory: PriceData[],
  isMockData: boolean
): RiskFlag[] {
  const flags: RiskFlag[] = []

  // Squeeze risk: overbought + extended above upper Bollinger + elevated volume
  const volumeRatio = quote.volume / quote.avgVolume
  if (
    technicals.rsi14 > 65 &&
    quote.price > technicals.bollingerUpper &&
    volumeRatio > 1.5
  ) {
    flags.push({
      type: 'squeeze',
      label: 'Short Squeeze Risk',
      description: `RSI ${technicals.rsi14.toFixed(0)}, price above upper BB, volume ${volumeRatio.toFixed(1)}x avg — elevated squeeze risk for short positions.`,
      severity: 'high',
    })
  }

  // Volatility flag: avg daily range > 4% over last 5 days
  if (priceHistory.length >= 5) {
    const recent5 = priceHistory.slice(-5)
    const avgDailyRange =
      recent5.reduce((sum, d) => sum + (d.high - d.low) / d.close, 0) / recent5.length * 100
    if (avgDailyRange > 4) {
      flags.push({
        type: 'volatility',
        label: 'High Volatility',
        description: `Avg daily range of ${avgDailyRange.toFixed(1)}% over last 5 sessions indicates elevated price swings.`,
        severity: 'medium',
      })
    }
  }

  // Data quality flag
  if (isMockData) {
    flags.push({
      type: 'data',
      label: 'Simulated Data',
      description: 'Using mock data — set FMP_API_KEY and ALPHA_VANTAGE_API_KEY env vars for live analysis.',
      severity: 'low',
    })
  }

  return flags
}

/**
 * Calculate a short score (0-100) for a top gainer using only quote-level data.
 * Higher = stronger short candidate.
 */
export function calculateShortScore(gainer: TopGainer): number {
  let score = 0

  // Large single-day gain → more extended, better short candidate (up to 35 pts)
  score += Math.min(35, gainer.changePercent * 3.5)

  // Volume confirmation: high vol on gain confirms extension (up to 15 pts)
  // Extreme vol (>5x) suggests potential squeeze — penalize slightly
  const volumeRatio = gainer.volume / Math.max(1, gainer.volume * 0.05) // normalized proxy
  // Since we don't have avgVolume on TopGainer, use absolute volume tiers
  if (gainer.volume > 50_000_000) {
    score += 10 // Very high volume — strong extension
  } else if (gainer.volume > 20_000_000) {
    score += 7
  } else if (gainer.volume > 5_000_000) {
    score += 4
  }

  // Being a top gainer at all = baseline extension (30 pts)
  score += 30

  // Price level proxy: lower-priced stocks are higher risk/reward for shorts (up to 10 pts)
  if (gainer.price < 20) {
    score += 10
  } else if (gainer.price < 50) {
    score += 6
  } else if (gainer.price < 100) {
    score += 3
  }

  // Moderate penalty for extreme gainers (>15%) — squeeze risk
  if (gainer.changePercent > 15) {
    score -= 10
  }

  return Math.round(Math.max(0, Math.min(100, score)))
}

/**
 * Generate catalysts based on analysis
 */
export function generateCatalysts(
  quote: StockQuote,
  technicals: TechnicalIndicators,
  fundamentals: FundamentalMetrics,
  priceHistory: PriceData[]
): Catalyst[] {
  const catalysts: Catalyst[] = []

  // Technical catalysts
  if (technicals.rsi14 < 30) {
    catalysts.push({
      type: 'bullish',
      title: 'Oversold Conditions',
      description: 'RSI indicates oversold territory, potential for mean reversion bounce.',
      impact: 'medium',
    })
  } else if (technicals.rsi14 > 70) {
    catalysts.push({
      type: 'bearish',
      title: 'Overbought Conditions',
      description: 'RSI indicates overbought territory, potential for pullback.',
      impact: 'medium',
    })
  }

  // Death Cross / Golden Cross
  const sma50VsSma200 = ((technicals.sma50 - technicals.sma200) / technicals.sma200) * 100
  if (sma50VsSma200 > 2) {
    catalysts.push({
      type: 'bullish',
      title: 'Golden Cross Active',
      description: `50-day MA is ${sma50VsSma200.toFixed(1)}% above 200-day MA — bullish structural alignment.`,
      impact: 'high',
    })
  } else if (sma50VsSma200 < -2) {
    catalysts.push({
      type: 'bearish',
      title: 'Death Cross Active',
      description: `50-day MA is ${Math.abs(sma50VsSma200).toFixed(1)}% below 200-day MA — bearish structural signal.`,
      impact: 'high',
    })
  } else if (Math.abs(sma50VsSma200) <= 2) {
    catalysts.push({
      type: 'neutral',
      title: 'MA Crossover Forming',
      description: '50-day and 200-day MAs are converging — watch for a Death Cross or Golden Cross.',
      impact: 'medium',
    })
  }

  // Volume surge
  const volumeRatio = quote.volume / quote.avgVolume
  if (volumeRatio > 3) {
    catalysts.push({
      type: quote.changePercent > 0 ? 'bullish' : 'bearish',
      title: 'Unusual Volume Activity',
      description: `Trading volume is ${volumeRatio.toFixed(1)}x higher than average, indicating significant interest.`,
      impact: 'high',
    })
  }

  // Parabolic 1-month move
  if (priceHistory.length >= 21) {
    const recent21 = priceHistory.slice(-21)
    const oneMonthChange = ((recent21[recent21.length - 1].close - recent21[0].close) / recent21[0].close) * 100
    if (oneMonthChange > 25) {
      catalysts.push({
        type: 'bearish',
        title: 'Parabolic Extension',
        description: `Stock has rallied ${oneMonthChange.toFixed(1)}% in the past month — elevated mean-reversion risk.`,
        impact: 'high',
      })
    }
  }

  // Near 52-week extremes
  const distFromHigh = ((quote.high52Week - quote.price) / quote.high52Week) * 100
  const distFromLow = ((quote.price - quote.low52Week) / quote.low52Week) * 100

  if (distFromHigh < 5) {
    catalysts.push({
      type: 'bullish',
      title: 'Near 52-Week High',
      description: 'Stock is within 5% of its 52-week high, showing strong momentum.',
      impact: 'medium',
    })
  } else if (distFromLow < 10) {
    catalysts.push({
      type: 'neutral',
      title: 'Near 52-Week Low',
      description: 'Stock is near its 52-week low. Could be value opportunity or continued weakness.',
      impact: 'medium',
    })
  }

  // Fundamental catalysts
  if (fundamentals.revenueGrowth !== null && fundamentals.revenueGrowth > 25) {
    catalysts.push({
      type: 'bullish',
      title: 'Strong Revenue Growth',
      description: `Revenue growing at ${fundamentals.revenueGrowth.toFixed(1)}% indicates healthy business expansion.`,
      impact: 'high',
    })
  }

  if (fundamentals.debtToEquity !== null && fundamentals.debtToEquity > 3) {
    catalysts.push({
      type: 'bearish',
      title: 'High Leverage Risk',
      description: `Debt-to-equity ratio of ${fundamentals.debtToEquity.toFixed(2)}x poses financial risk.`,
      impact: 'medium',
    })
  }

  // Ensure we have at least one catalyst
  if (catalysts.length === 0) {
    catalysts.push({
      type: 'neutral',
      title: 'Stable Trading',
      description: 'No significant technical or fundamental catalysts identified.',
      impact: 'low',
    })
  }

  return catalysts.slice(0, 4)
}

/**
 * Main analysis function - combines all scores and generates signal
 */
export function analyzeStock(
  quote: StockQuote,
  technicals: TechnicalIndicators,
  fundamentals: FundamentalMetrics,
  priceHistory: PriceData[],
  isMockData = false
): {
  signal: Signal
  confidence: number
  confidenceLabel: 'Low' | 'Medium' | 'High'
  score: number
  reasoning: ReasoningItem[]
  catalysts: Catalyst[]
  riskFlags: RiskFlag[]
} {
  // Calculate component scores
  const technicalResult = calculateTechnicalScore(technicals, quote)
  const fundamentalResult = calculateFundamentalScore(fundamentals)
  const momentumResult = calculateMomentumScore(quote, priceHistory)

  // Weighted composite score
  const compositeScore =
    technicalResult.score * TECHNICAL_WEIGHT +
    fundamentalResult.score * FUNDAMENTAL_WEIGHT +
    momentumResult.score * MOMENTUM_WEIGHT

  // Determine signal
  let signal: Signal
  if (compositeScore >= LONG_THRESHOLD) {
    signal = 'LONG'
  } else if (compositeScore <= SHORT_THRESHOLD) {
    signal = 'SHORT'
  } else {
    signal = 'NEUTRAL'
  }

  // Calculate confidence (how far from neutral zone)
  let confidence: number
  if (signal === 'LONG') {
    confidence = Math.min(100, 50 + ((compositeScore - LONG_THRESHOLD) / (100 - LONG_THRESHOLD)) * 50)
  } else if (signal === 'SHORT') {
    confidence = Math.min(100, 50 + ((SHORT_THRESHOLD - compositeScore) / SHORT_THRESHOLD) * 50)
  } else {
    const distFromLong = LONG_THRESHOLD - compositeScore
    const distFromShort = compositeScore - SHORT_THRESHOLD
    const minDist = Math.min(distFromLong, distFromShort)
    confidence = 50 + (minDist / ((LONG_THRESHOLD - SHORT_THRESHOLD) / 2)) * 30
  }

  const roundedConfidence = Math.round(confidence)
  const confidenceLabel: 'Low' | 'Medium' | 'High' =
    roundedConfidence >= 80 ? 'High' : roundedConfidence >= 60 ? 'Medium' : 'Low'

  // Combine all reasoning
  const reasoning = [
    ...technicalResult.reasoning,
    ...fundamentalResult.reasoning,
    ...momentumResult.reasoning,
  ]

  // Generate catalysts and risk flags
  const catalysts = generateCatalysts(quote, technicals, fundamentals, priceHistory)
  const riskFlags = generateRiskFlags(quote, technicals, priceHistory, isMockData)

  return {
    signal,
    confidence: roundedConfidence,
    confidenceLabel,
    score: Math.round(compositeScore),
    reasoning,
    catalysts,
    riskFlags,
  }
}
