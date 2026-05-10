import numpy as np
import pandas as pd


def calculate_metrics(
    prices: pd.DataFrame,
    equity_curve: pd.DataFrame,
    trades: list[dict],
    initial_capital: float,
) -> tuple[dict, pd.DataFrame, pd.DataFrame]:
    final_value = float(equity_curve["portfolio_value"].iloc[-1])
    total_return = (final_value - initial_capital) / initial_capital * 100

    start_date = pd.to_datetime(equity_curve["date"].iloc[0])
    end_date = pd.to_datetime(equity_curve["date"].iloc[-1])
    years = max((end_date - start_date).days / 365.25, 1 / 365.25)
    cagr = ((final_value / initial_capital) ** (1 / years) - 1) * 100

    running_peak = equity_curve["portfolio_value"].cummax()
    drawdown = (equity_curve["portfolio_value"] / running_peak - 1) * 100
    drawdown_curve = pd.DataFrame({"date": equity_curve["date"], "drawdown": drawdown})
    max_drawdown = float(drawdown.min())

    daily_returns = equity_curve["portfolio_value"].pct_change().dropna()
    sharpe_ratio = 0.0
    if not daily_returns.empty and daily_returns.std() != 0:
        sharpe_ratio = float((daily_returns.mean() / daily_returns.std()) * np.sqrt(252))

    closed_trades = [trade for trade in trades if "exit_date" in trade]
    winning_trades = [trade for trade in closed_trades if trade["profit_loss"] > 0]
    win_rate = len(winning_trades) / len(closed_trades) * 100 if closed_trades else 0.0
    avg_profit_per_trade = (
        float(np.mean([trade["profit_loss"] for trade in closed_trades])) if closed_trades else 0.0
    )

    first_close = float(prices["Close"].iloc[0])
    benchmark_units = initial_capital / first_close
    benchmark_curve = pd.DataFrame(
        {
            "date": prices["Date"],
            "benchmark_value": benchmark_units * prices["Close"],
        }
    )
    buy_hold_return = (
        (float(benchmark_curve["benchmark_value"].iloc[-1]) - initial_capital)
        / initial_capital
        * 100
    )

    metrics = {
        "final_value": round(final_value, 2),
        "total_return": round(float(total_return), 2),
        "cagr": round(float(cagr), 2),
        "max_drawdown": round(max_drawdown, 2),
        "sharpe_ratio": round(sharpe_ratio, 2),
        "win_rate": round(float(win_rate), 2),
        "total_trades": len(closed_trades),
        "avg_profit_per_trade": round(avg_profit_per_trade, 2),
        "buy_hold_return": round(float(buy_hold_return), 2),
    }
    return metrics, drawdown_curve, benchmark_curve

