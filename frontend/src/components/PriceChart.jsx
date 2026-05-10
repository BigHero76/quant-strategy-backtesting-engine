import React from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function PriceChart({ prices, signals }) {
  const signalLookup = new Map(signals.map((signal) => [signal.Date, signal]));

  return (
    <article className="chart-panel">
      <h3>Price & Signals</h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={prices}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Date" minTickGap={38} />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <Line type="monotone" dataKey="Close" stroke="#2563eb" dot={false} strokeWidth={2} />
          {prices.map((point) => {
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
