import pandas as pd
import requests
import yfinance as yf
import logging
import warnings


logging.getLogger('yfinance').setLevel(logging.ERROR)
warnings.filterwarnings('ignore', module='yfinance')


REQUIRED_COLUMNS = ["Open", "High", "Low", "Close", "Volume"]


def _normalize_price_data(data: pd.DataFrame) -> pd.DataFrame:
    if data.empty:
        return data

    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    data = data.reset_index()
    date_column = "Date" if "Date" in data.columns else data.columns[0]
    data = data.rename(columns={date_column: "Date"})
    data["Date"] = pd.to_datetime(data["Date"]).dt.date

    if "Close" not in data.columns and "Adj Close" in data.columns:
        data["Close"] = data["Adj Close"]

    missing = [col for col in REQUIRED_COLUMNS if col not in data.columns]
    if missing:
        raise ValueError(f"Missing expected columns from data source: {missing}")

    return data[["Date", *REQUIRED_COLUMNS]].dropna().reset_index(drop=True)


def _fetch_with_download(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    return yf.download(
        ticker,
        start=start_date,
        end=end_date,
        auto_adjust=True,
        progress=False,
        threads=False,
    )


def _fetch_with_history(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    return yf.Ticker(ticker).history(
        start=start_date,
        end=end_date,
        auto_adjust=True,
    )


def _fetch_with_yahoo_chart(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    start_ts = int(pd.to_datetime(start_date).timestamp())
    end_ts = int(pd.to_datetime(end_date).timestamp())
    url = (
        f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?"
        f"period1={start_ts}&period2={end_ts}&interval=1d&includePrePost=false&events=div%2Csplit"
    )
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    data = response.json()

    result = data.get("chart", {}).get("result")
    if not result:
        return pd.DataFrame()

    result = result[0]
    timestamps = result.get("timestamp") or []
    quote = result.get("indicators", {}).get("quote", [{}])[0]
    df = pd.DataFrame(
        {
            "Date": pd.to_datetime(timestamps, unit="s").date,
            "Open": quote.get("open", []),
            "High": quote.get("high", []),
            "Low": quote.get("low", []),
            "Close": quote.get("close", []),
            "Volume": quote.get("volume", []),
        }
    )
    return df.dropna().reset_index(drop=True)


def _fetch_with_stooq(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    if "." in ticker:
        return pd.DataFrame()

    start = pd.to_datetime(start_date).strftime("%Y%m%d")
    end = pd.to_datetime(end_date).strftime("%Y%m%d")
    stooq_symbol = ticker.lower()
    if not stooq_symbol.endswith(".us"):
        stooq_symbol = f"{stooq_symbol}.us"

    url = f"https://stooq.com/q/d/l/?s={stooq_symbol}&d1={start}&d2={end}&i=d"
    return pd.read_csv(url)


def fetch_price_data(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    errors: list[str] = []

    for fetcher in (
        _fetch_with_download,
        _fetch_with_history,
        _fetch_with_yahoo_chart,
        _fetch_with_stooq,
    ):
        try:
            data = _normalize_price_data(fetcher(ticker, start_date, end_date))
            if not data.empty:
                return data
        except Exception as exc:
            errors.append(f"{fetcher.__name__}: {exc}")

    detail = "; ".join(errors) if errors else "all data sources returned empty data"
    raise ValueError(
        f"No price data found for ticker '{ticker}'. Check the ticker, date range, and internet access. Details: {detail}"
    )
