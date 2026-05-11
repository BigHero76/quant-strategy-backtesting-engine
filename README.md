# Quant Strategy Backtesting Engine

This is my full-stack backtesting engine for testing trading strategies on historical market data.

The idea is simple: instead of guessing whether a strategy would have worked, I wanted to build something that answers:

```text
If I used this strategy on this stock during this time period,
what return, risk, drawdown, and trade history would I get?
```

For example, I can test an EMA 20/50 crossover on a stock like `AAPL` or `RELIANCE.NS` with a starting capital of `100000`, and the app shows the performance, trades, charts, and comparison with buy-and-hold.

## What it does

The app lets a user:

- enter a stock ticker
- choose a date range
- enter starting capital
- select a strategy
- run a backtest
- view performance metrics
- see charts and trade history

Right now, the MVP supports these strategies:

- EMA crossover
- RSI mean reversion
- MACD crossover

## Tech stack

Backend:

- FastAPI
- Python
- Pandas
- NumPy
- yfinance (with Yahoo Finance API fallback)

Frontend:

- React
- Vite
- Recharts
- CSS

## Features

- Fetches historical price data using `yfinance` with fallback to Yahoo Finance chart API
- Calculates indicators like EMA, RSI, and MACD
- Generates buy and sell signals
- Simulates trades with available capital
- Tracks cash, shares, portfolio value, and trade history
- Includes transaction cost and slippage
- Avoids future leakage by executing signals after they are generated
- Compares strategy performance with buy-and-hold

## Metrics shown

The dashboard shows:

- final portfolio value
- total return
- CAGR
- max drawdown
- Sharpe ratio
- win rate
- number of trades
- average profit per trade
- buy-and-hold return

## Project structure

```text
backend/
  main.py
  data_fetcher.py
  indicators.py
  backtester.py
  metrics.py
  schemas.py
  strategies/

frontend/
  src/
    api/
    components/
    App.jsx
```

## Running the project

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` (or similar, check the terminal output).

## API Endpoints

- `GET /health` - Health check
- `POST /backtest` - Run a backtest

## CORS Configuration

The backend allows CORS from `http://localhost:5173` and `http://localhost:5175` for development.
```

The backend runs at:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/health
```

## Running the frontend

<img width="1886" height="953" alt="image" src="https://github.com/user-attachments/assets/4547ead2-7d85-450c-8357-8dbc76330495" />

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## Example request

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

## What I want to add next

Some strategies/features I want to add after this MVP:

- Bollinger Bands mean reversion
- Supertrend
- Donchian breakout
- ATR-based stop loss and trailing stop loss
- 200-day moving average trend filter
- volume-confirmed breakouts
- portfolio backtesting with multiple stocks
- saved backtest results
- ML-based signal filtering

The ML idea is to use technical indicators as features and predict whether the price is likely to move up over the next few days. Then the normal strategy signal can be filtered using model confidence.

## Why I built this

I wanted this project to be more realistic than a basic stock price prediction app. Backtesting forces me to think about actual trading logic, risk, transaction costs, slippage, drawdowns, and whether a strategy really beats a simple buy-and-hold approach.

This is still an MVP, but it already has the main pieces of a real backtesting workflow.

