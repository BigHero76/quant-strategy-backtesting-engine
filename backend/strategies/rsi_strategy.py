import pandas as pd

from indicators import rsi


def generate_rsi_signals(
    prices: pd.DataFrame,
    period: int = 14,
    oversold: float = 30,
    overbought: float = 70,
) -> pd.DataFrame:
    data = prices.copy()
    data["rsi"] = rsi(data["Close"], period)
    data["Signal"] = "HOLD"
    data.loc[data["rsi"] < oversold, "Signal"] = "BUY"
    data.loc[data["rsi"] > overbought, "Signal"] = "SELL"
    return data

