from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, Field


StrategyName = Literal["ema_crossover", "rsi_mean_reversion", "macd_strategy"]


class BacktestRequest(BaseModel):
    ticker: str = Field(..., examples=["AAPL", "RELIANCE.NS"])
    start_date: date
    end_date: date
    capital: float = Field(..., gt=0)
    strategy: StrategyName
    params: dict[str, Any] = Field(default_factory=dict)
    transaction_cost: float = Field(0.001, ge=0, description="Cost per trade as a fraction.")
    slippage: float = Field(0.001, ge=0, description="Slippage per trade as a fraction.")


class BacktestResponse(BaseModel):
    metrics: dict[str, float | int]
    equity_curve: list[dict[str, Any]]
    drawdown_curve: list[dict[str, Any]]
    benchmark_curve: list[dict[str, Any]]
    trade_log: list[dict[str, Any]]
    signals: list[dict[str, Any]]
    price_data: list[dict[str, Any]]

