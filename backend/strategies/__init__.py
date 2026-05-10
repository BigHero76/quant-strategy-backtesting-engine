from strategies.ema_crossover import generate_ema_crossover_signals
from strategies.macd_strategy import generate_macd_signals
from strategies.rsi_strategy import generate_rsi_signals


STRATEGIES = {
    "ema_crossover": generate_ema_crossover_signals,
    "rsi_mean_reversion": generate_rsi_signals,
    "macd_strategy": generate_macd_signals,
}

