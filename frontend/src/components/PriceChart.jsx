import React from "react";
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function PriceChart({ prices, signals, showBands, bandPeriod, bandStd }) {
  const signalLookup = new Map(signals.map((signal) => [signal.Date, signal]));

  const chartData = prices.map((point, idx, arr) => {
    const closes = arr
      .slice(Math.max(0, idx - bandPeriod + 1), idx + 1)
      .map((row) => Number(row.Close));
    const sma = closes.length === bandPeriod ? closes.reduce((sum, value) => sum + value, 0) / bandPeriod : null;
    const std = sma !== null ? Math.sqrt(closes.reduce((sum, value) => sum + Math.pow(value - sma, 2), 0) / bandPeriod) : null;
    return {
      ...point,
      sma: sma ?? undefined,
      upper: std !== null ? sma + bandStd * std : undefined,
      lower: std !== null ? sma - bandStd * std : undefined,
    };
  });

  return (
    <article className="chart-panel">
      <h3>Price & Signals</h3>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Date" minTickGap={30} />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <Legend verticalAlign="top" height={28} />
          <Line type="monotone" dataKey="Close" stroke="#2563eb" dot={false} strokeWidth={2} name="Close" />
          {showBands && (
            <>
              <Line
                type="monotone"
                dataKey="upper"
                stroke="#f97316"
                dot={false}
                strokeDasharray="5 5"
                connectNulls
                name="Upper Band"
              />
              <Line
                type="monotone"
                dataKey="sma"
                stroke="#16a34a"
                dot={false}
                strokeWidth={1.5}
                connectNulls
                name="Middle Band"
              />
              <Line
                type="monotone"
                dataKey="lower"
                stroke="#38bdf8"
                dot={false}
                strokeDasharray="5 5"
                connectNulls
                name="Lower Band"
              />
            </>
          )}
          {chartData.map((point) => {
            const signal = signalLookup.get(point.Date);
            if (!signal) return null;
            return (
              <ReferenceDot
                key={`${point.Date}-${signal.Signal}`}
                x={point.Date}
                y={point.Close}
                r={5}
                fill={signal.Signal === "BUY" ? "#16a34a" : "#dc2626"}
                stroke="white"
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </article>
  );
}

export default PriceChart;
