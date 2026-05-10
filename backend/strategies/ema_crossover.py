import pandas as pd

from indicators import ema


def generate_ema_crossover_signals(
    prices: pd.DataFrame,
    short_window: int = 20,
    long_window: int = 50,
) -> pd.DataFrame:
    data = prices.copy()
    data["short_ema"] = ema(data["Close"], short_window)
    data["long_ema"] = ema(data["Close"], long_window)
    crossed_up = (data["short_ema"] > data["long_ema"]) & (
        data["short_ema"].shift(1) <= data["long_ema"].shift(1)
    )
    crossed_down = (data["short_ema"] < data["long_ema"]) & (
        data["short_ema"].shift(1) >= data["long_ema"].shift(1)
    )
    data["Signal"] = "HOLD"
    data.loc[crossed_up, "Signal"] = "BUY"
    data.loc[crossed_down, "Signal"] = "SELL"
    return data

