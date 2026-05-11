import React, { useState } from "react";
import { Activity, BarChart3, Play, Settings2 } from "lucide-react";

import { runBacktest } from "./api/backtestApi";
import MetricsCards from "./components/MetricsCards";
import PriceChart from "./components/PriceChart";
import EquityCurve from "./components/EquityCurve";
import TradeLog from "./components/TradeLog";

const strategyDefaults = {
  ema_crossover: { short_window: 20, long_window: 50 },
  rsi_mean_reversion: { period: 14, oversold: 30, overbought: 70 },
  macd_strategy: { fast: 12, slow: 26, signal: 9 },
};

function App() {
  const [form, setForm] = useState({
    ticker: "AAPL",
    start_date: "2020-01-01",
    end_date: "2025-01-01",
    capital: 100000,
    strategy: "ema_crossover",
    transaction_cost: 0.001,
    slippage: 0.001,
  });
  const [params, setParams] = useState(strategyDefaults.ema_crossover);
  const [chartOptions, setChartOptions] = useState({
    show_bollinger: true,
    band_period: 20,
    band_std: 2,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateForm(event) {
    const { name, value } = event.target;
    if (name === "strategy") {
      setParams(strategyDefaults[value]);
    }
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateParam(event) {
    const { name, value } = event.target;
    setParams((current) => ({ ...current, [name]: Number(value) }));
  }

  function updateChartOption(event) {
    const { name, value, type, checked } = event.target;
    setChartOptions((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        capital: Number(form.capital),
        transaction_cost: Number(form.transaction_cost),
        slippage: Number(form.slippage),
        params,
      };
      setResult(await runBacktest(payload));
    } catch (apiError) {
      setError(apiError.message || "Backtest failed. Check backend logs.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <aside className="control-panel">
          <div className="brand-row">
            <Activity size={26} />
            <div>
              <h1>Quant Backtester</h1>
              <p>Strategy lab</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="input-form">
            <label>
              Ticker
              <input name="ticker" value={form.ticker} onChange={updateForm} />
            </label>
            <div className="two-column">
              <label>
                Start
                <input type="date" name="start_date" value={form.start_date} onChange={updateForm} />
              </label>
              <label>
                End
                <input type="date" name="end_date" value={form.end_date} onChange={updateForm} />
              </label>
            </div>
            <label>
              Capital
              <input type="number" name="capital" value={form.capital} onChange={updateForm} />
            </label>
            <label>
              Strategy
              <select name="strategy" value={form.strategy} onChange={updateForm}>
                <option value="ema_crossover">EMA Crossover</option>
                <option value="rsi_mean_reversion">RSI Mean Reversion</option>
                <option value="macd_strategy">MACD Strategy</option>
              </select>
            </label>

            <div className="param-box">
              <div className="section-title">
                <Settings2 size={17} />
                <span>Parameters</span>
              </div>
              {Object.entries(params).map(([key, value]) => (
                <label key={key}>
                  {key.replaceAll("_", " ")}
                  <input type="number" name={key} value={value} onChange={updateParam} step="0.01" />
                </label>
              ))}
            </div>

            <div className="param-box">
              <div className="section-title">
                <Settings2 size={17} />
                <span>Chart overlays</span>
              </div>
              <label className="switch-label">
                <span>Show Bollinger Bands</span>
                <input
                  type="checkbox"
                  name="show_bollinger"
                  checked={chartOptions.show_bollinger}
                  onChange={updateChartOption}
                />
              </label>
              <div className="two-column">
                <label>
                  Period
                  <input
                    type="number"
                    min="5"
                    name="band_period"
                    value={chartOptions.band_period}
                    onChange={updateChartOption}
                  />
                </label>
                <label>
                  Std Dev
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    name="band_std"
                    value={chartOptions.band_std}
                    onChange={updateChartOption}
                  />
                </label>
              </div>
            </div>

            <div className="two-column">
              <label>
                Cost
                <input
                  type="number"
                  name="transaction_cost"
                  value={form.transaction_cost}
                  onChange={updateForm}
                  step="0.0001"
                />
              </label>
              <label>
                Slippage
                <input
                  type="number"
                  name="slippage"
                  value={form.slippage}
                  onChange={updateForm}
                  step="0.0001"
                />
              </label>
            </div>

            <button className="run-button" type="submit" disabled={loading}>
              <Play size={18} />
              {loading ? "Running..." : "Run Backtest"}
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </aside>

        <section className="results-panel">
          <div className="results-header">
            <div>
              <h2>Results Dashboard</h2>
              {result ? (
                <>
                  <div className="results-summary">
                    <span className="pill">{form.ticker.toUpperCase()}</span>
                    <span className="pill">{form.strategy.replaceAll("_", " ")}</span>
                    <span className="pill">{result.metrics.total_trades} trades</span>
                  </div>
                  <p>Review strategy performance, chart overlays, and trade history below.</p>
                </>
              ) : (
                <p>Run a strategy to see metrics, charts, and trades.</p>
              )}
            </div>
            <BarChart3 size={28} />
          </div>

          {result ? (
            <>
              <MetricsCards metrics={result.metrics} />
              <div className="chart-grid">
                <PriceChart
                  prices={result.price_data}
                  signals={result.signals}
                  showBands={chartOptions.show_bollinger}
                  bandPeriod={chartOptions.band_period}
                  bandStd={chartOptions.band_std}
                />
                <EquityCurve
                  equity={result.equity_curve}
                  drawdown={result.drawdown_curve}
                  benchmark={result.benchmark_curve}
                />
              </div>
              <TradeLog trades={result.trade_log} />
            </>
          ) : (
            <div className="empty-state">No backtest has been run yet.</div>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
