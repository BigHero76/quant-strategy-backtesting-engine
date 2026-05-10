import React from "react";

const labels = {
  final_value: "Final Value",
  total_return: "Total Return",
  cagr: "CAGR",
  max_drawdown: "Max Drawdown",
  sharpe_ratio: "Sharpe",
  win_rate: "Win Rate",
  total_trades: "Trades",
  avg_profit_per_trade: "Avg Trade P/L",
  buy_hold_return: "Buy & Hold",
};

function formatMetric(key, value) {
  if (["total_return", "cagr", "max_drawdown", "win_rate", "buy_hold_return"].includes(key)) {
    return `${value}%`;
  }
  if (["final_value", "avg_profit_per_trade"].includes(key)) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return value;
}

function MetricsCards({ metrics }) {
  return (
    <div className="metrics-grid">
      {Object.entries(labels).map(([key, label]) => (
        <article className="metric-card" key={key}>
          <span>{label}</span>
          <strong>{formatMetric(key, metrics[key])}</strong>
        </article>
      ))}
    </div>
  );
}

export default MetricsCards;
