# Quant Strategy Backtesting Engine

Full-stack MVP for testing rule-based trading strategies on historical market data.

## What is included

- FastAPI backend with a `/backtest` endpoint
- yfinance historical data fetching
- Indicator engine for EMA, RSI, and MACD
- Strategy engine for:
  - EMA crossover
  - RSI mean reversion
  - MACD crossover
- Backtester with:
  - transaction costs
  - slippage
  - no future leakage signal execution
  - cash, shares, portfolio value, and trade log tracking
- Metrics:
  - final value
  - total return
  - CAGR
  - max drawdown
  - Sharpe ratio
  - win rate
  - average profit per trade
  - buy-and-hold return
- React dashboard with:
  - input form
  - metrics cards
  - price chart with buy/sell markers
  - equity, benchmark, and drawdown chart
  - trade log

## Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/health
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Example API request

```json
{
  "ticker": "AAPL",
  "start_date": "2020-01-01",
  "end_date": "2025-01-01",
  "capital": 100000,
  "strategy": "ema_crossover",
  "params": {
    "short_window": 20,
    "long_window": 50
  },
  "transaction_cost": 0.001,
  "slippage": 0.001
}
```

## Extra strategies to add after the MVP

Good beginner-friendly additions:

- Bollinger Bands mean reversion: buy near/below lower band, sell near/above upper band.
- Moving average trend filter: only take long trades when price is above the 200-day SMA.
- Donchian breakout: buy when price breaks the highest high of the last N days, sell on lowest low.
- Supertrend strategy: buy when Supertrend flips bullish, sell when it flips bearish.
- VWAP strategy: useful intraday later; buy when price reclaims VWAP with volume confirmation.
- ATR trailing stop strategy: not exactly an entry strategy, but excellent for realistic exits.

More portfolio-worthy upgrades:

- Pairs trading: trade the spread between two correlated stocks.
- Momentum ranking: rank a basket of stocks by 3-month/6-month return and hold top N.
- Mean reversion with z-score: buy when price is statistically stretched below its rolling mean.
- Breakout with volume confirmation: buy breakouts only when volume is above average.
- ML-filtered signals: take EMA/RSI/MACD signals only when model confidence is above a threshold.

For the next best implementation step, Bollinger Bands plus ATR stop-loss is a strong combo: it is understandable, realistic, and shows you care about risk management rather than just entries.

