function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function TradeLog({ trades }) {
  return (
    <article className="table-panel">
      <h3>Trade Log</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Entry Date</th>
              <th>Entry Price</th>
              <th>Exit Date</th>
              <th>Exit Price</th>
              <th>Qty</th>
              <th>P/L</th>
              <th>Return</th>
              <th>Days</th>
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr>
                <td colSpan="8">No closed trades for this period.</td>
              </tr>
            ) : (
              trades.map((trade, index) => (
                <tr key={`${trade.entry_date}-${index}`}>
                  <td>{trade.entry_date}</td>
                  <td>{formatCurrency(trade.entry_price)}</td>
                  <td>{trade.exit_date}</td>
                  <td>{formatCurrency(trade.exit_price)}</td>
                  <td>{trade.quantity}</td>
                  <td className={trade.profit_loss >= 0 ? "positive" : "negative"}>
                    {formatCurrency(trade.profit_loss)}
                  </td>
                  <td>{trade.return_pct.toFixed(2)}%</td>
                  <td>{trade.holding_period}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default TradeLog;

