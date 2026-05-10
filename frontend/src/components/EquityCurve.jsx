import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function EquityCurve({ equity, drawdown, benchmark }) {
  const benchmarkByDate = new Map(benchmark.map((row) => [row.date, row.benchmark_value]));
  const drawdownByDate = new Map(drawdown.map((row) => [row.date, row.drawdown]));
  const chartData = equity.map((row) => ({
    date: row.date,
    strategy: row.portfolio_value,
    benchmark: benchmarkByDate.get(row.date),
    drawdown: drawdownByDate.get(row.date),
  }));

  return (
    <article className="chart-panel">
      <h3>Equity, Benchmark & Drawdown</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" minTickGap={38} />
          <YAxis yAxisId="value" domain={["auto", "auto"]} />
          <YAxis yAxisId="drawdown" orientation="right" domain={["auto", 0]} />
          <Tooltip />
          <Line yAxisId="value" type="monotone" dataKey="strategy" stroke="#0f766e" dot={false} strokeWidth={2} />
          <Line yAxisId="value" type="monotone" dataKey="benchmark" stroke="#f59e0b" dot={false} strokeWidth={2} />
          <Line yAxisId="drawdown" type="monotone" dataKey="drawdown" stroke="#ef4444" dot={false} strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </article>
  );
}

export default EquityCurve;
