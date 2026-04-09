# ShortLens

Presentation-ready stock intelligence app. Type any company name or ticker and get an instant **Long / Short / Neutral** recommendation with a full signal breakdown — technicals, fundamentals, momentum, catalysts, and risk flags.

Built for live presentations, finance classrooms, and retail traders who want fast, explainable analysis.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)

---

## Features

- **Instant analysis** — Long / Short / Neutral signal with confidence score (Low / Medium / High)
- **Full signal breakdown** — RSI, moving averages, Death Cross / Golden Cross, MACD, Bollinger Bands
- **Momentum scoring** — 1-day, 5-day, 1-month, 3-month returns with parabolic move detection
- **Fundamental scoring** — P/E, ROE, debt/equity, revenue growth, margins
- **Risk flags** — Short squeeze risk, high volatility, data quality warnings
- **Short candidates scanner** — Top gaining stocks ranked by short score
- **Interactive price chart** — Candlestick + SMA 20/50 overlays (1M / 3M / 6M ranges)
- **Works without API keys** — Falls back to realistic mock data for demos

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/VikramMenon09/ShortLens.git
cd ShortLens
```

### 2. Install dependencies

```bash
pnpm install
# or: npm install / yarn install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Financial Modeling Prep — quotes, price history, fundamentals, search
# Free tier: 250 req/day  →  https://financialmodelingprep.com/developer/docs
FMP_API_KEY=your_fmp_key_here

# Alpha Vantage — technical indicators (RSI, MACD, Bollinger Bands)
# Free tier: 25 req/day   →  https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
```

> **No keys?** The app runs fully on mock data without any API keys — great for demos and local testing.

### 4. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

The easiest way to deploy:

1. Push your fork to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add `FMP_API_KEY` and `ALPHA_VANTAGE_API_KEY` under **Settings → Environment Variables**
4. Deploy

---

## API Keys

| Provider | Used For | Free Tier | Link |
|---|---|---|---|
| Financial Modeling Prep | Quotes, price history, fundamentals, company search, top gainers | 250 req/day | [fmp](https://financialmodelingprep.com/developer/docs) |
| Alpha Vantage | RSI, SMA, MACD, Bollinger Bands | 25 req/day | [alphavantage](https://www.alphavantage.co/support/#api-key) |

API keys are **server-side only** — never exposed to the browser or committed to git.

---

## Rate Limits

Built-in IP-based rate limiting protects the backend from abuse:

| Endpoint | Limit |
|---|---|
| `/api/analyze` | 30 req / min |
| `/api/search` | 60 req / min |
| `/api/top-gainers` | 20 req / min |

Exceeding limits returns `429 Too Many Requests` with a `Retry-After` header.

---

## Project Structure

```
app/
  page.tsx                  — Main dashboard
  api/
    analyze/route.ts        — Core stock analysis endpoint
    search/route.ts         — Company name / ticker autocomplete
    top-gainers/route.ts    — Top gaining stocks + short score ranking
lib/
  analysis-engine.ts        — Scoring engine (technical 40% + fundamental 40% + momentum 20%)
  types.ts                  — TypeScript types
  rate-limit.ts             — In-memory IP rate limiter
components/
  signal-card.tsx           — Long/Short/Neutral verdict card
  risk-flags.tsx            — Squeeze / volatility / data warning chips
  top-gainers-scanner.tsx   — Short candidates sidebar
  price-chart.tsx           — Interactive candlestick chart
  metrics-grid.tsx          — Technicals + fundamentals grid
  reasoning-breakdown.tsx   — Signal reasoning
  catalysts-list.tsx        — Catalyst flags
  confidence-gauge.tsx      — Visual confidence meter
```

---

## Scoring Model

| Category | Weight | Signals |
|---|---|---|
| Technical | 40% | RSI, SMA 20/50/200, Death/Golden Cross, MACD, Bollinger Bands |
| Fundamental | 40% | P/E, ROE, debt/equity, revenue growth, net margin, current ratio |
| Momentum | 20% | Daily change, volume, 5-day / 1-month / 3-month returns, 52W range |

Scores below 35 → **SHORT** · Above 65 → **LONG** · In between → **NEUTRAL**

---

## Disclaimer

ShortLens is for **informational and educational purposes only**. It does not constitute financial advice. Always do your own research before making investment decisions.

---

## License

MIT
