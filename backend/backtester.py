import pandas as pd


def run_backtest(
    signal_data: pd.DataFrame,
    initial_capital: float,
    transaction_cost: float = 0.001,
    slippage: float = 0.001,
) -> tuple[pd.DataFrame, list[dict]]:
    cash = initial_capital
    shares = 0
    open_trade: dict | None = None
    trades: list[dict] = []
    equity_rows: list[dict] = []

    for _, row in signal_data.iterrows():
        date = row["Date"]
        close = float(row["Close"])
        signal = row["Signal"]

        if signal == "BUY" and shares == 0 and cash > 0:
            execution_price = close * (1 + slippage)
            quantity = int(cash / (execution_price * (1 + transaction_cost)))
            if quantity > 0:
                gross_cost = quantity * execution_price
                fees = gross_cost * transaction_cost
                cash -= gross_cost + fees
                shares = quantity
                open_trade = {
                    "entry_date": date,
                    "entry_price": execution_price,
                    "quantity": quantity,
                    "entry_fees": fees,
                }

        elif signal == "SELL" and shares > 0 and open_trade:
            execution_price = close * (1 - slippage)
            gross_value = shares * execution_price
            fees = gross_value * transaction_cost
            cash += gross_value - fees
            pnl = cash - initial_capital if not trades else cash - trades[-1]["cash_after_exit"]
            trade_pnl = (
                (execution_price - open_trade["entry_price"]) * shares
                - open_trade["entry_fees"]
                - fees
            )
            trades.append(
                {
                    **open_trade,
                    "exit_date": date,
                    "exit_price": execution_price,
                    "exit_fees": fees,
                    "profit_loss": trade_pnl,
                    "return_pct": trade_pnl
                    / (open_trade["entry_price"] * shares + open_trade["entry_fees"])
                    * 100,
                    "holding_period": (pd.to_datetime(date) - pd.to_datetime(open_trade["entry_date"])).days,
                    "cash_after_exit": cash,
                    "cumulative_pnl": pnl,
                }
            )
            shares = 0
            open_trade = None

        equity_rows.append(
            {
                "date": date,
                "cash": cash,
                "shares": shares,
                "close": close,
                "portfolio_value": cash + shares * close,
            }
        )

    return pd.DataFrame(equity_rows), trades

