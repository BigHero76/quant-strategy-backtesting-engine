const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function runBacktest(payload) {
  const response = await fetch(`${baseUrl}/backtest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Backtest failed.");
  }
  return data;
}
