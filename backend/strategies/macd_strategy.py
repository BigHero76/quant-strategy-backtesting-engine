import pandas as pd

from indicators import macd


def generate_macd_signals(
    prices: pd.DataFrame,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
) -> pd.DataFrame:
    data = prices.copy()
    data["macd"], data["macd_signal"], data["macd_histogram"] = macd(
        data["Close"], fast, slow, signal
    )
    crossed_up = (data["macd"] > data["macd_signal"]) & (
        data["macd"].shift(1) <= data["macd_signal"].shift(1)
    )
    crossed_down = (data["macd"] < data["macd_signal"]) & (
        data["macd"].shift(1) >= data["macd_signal"].shift(1)
    )
    data["Signal"] = "HOLD"
    data.loc[crossed_up, "Signal"] = "BUY"
    data.loc[crossed_down, "Signal"] = "SELL"
    return data

