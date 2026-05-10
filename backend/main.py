from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backtester import run_backtest
from data_fetcher import fetch_price_data
from metrics import calculate_metrics
from schemas import BacktestRequest, BacktestResponse
from strategies import STRATEGIES


app = FastAPI(title="Quant Strategy Backtesting Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/backtest", response_model=BacktestResponse)
def backtest(request: BacktestRequest) -> BacktestResponse:
    if request.start_date >= request.end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date.")

    strategy_fn = STRATEGIES[request.strategy]
    try:
        prices = fetch_price_data(
            request.ticker,
            request.start_date.isoformat(),
            request.end_date.isoformat(),
        )
        signal_data = strategy_fn(prices, **request.params)
        # Shift signals by one bar so trades happen after the signal is known.
        tradable_data = signal_data.copy()
        tradable_data["Signal"] = tradable_data["Signal"].shift(1).fillna("HOLD")
        equity_curve, trade_log = run_backtest(
            tradable_data,
            request.capital,
            request.transaction_cost,
            request.slippage,
        )
        metrics, drawdown_curve, benchmark_curve = calculate_metrics(
            prices,
            equity_curve,
            trade_log,
            request.capital,
        )
    except TypeError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid strategy parameters: {exc}") from exc
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    signal_rows = signal_data[signal_data["Signal"].isin(["BUY", "SELL"])]
    return BacktestResponse(
        metrics=metrics,
        equity_curve=equity_curve.to_dict("records"),
        drawdown_curve=drawdown_curve.to_dict("records"),
        benchmark_curve=benchmark_curve.to_dict("records"),
        trade_log=trade_log,
        signals=signal_rows[["Date", "Close", "Signal"]].to_dict("records"),
        price_data=prices[["Date", "Close"]].to_dict("records"),
    )

