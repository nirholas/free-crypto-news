#!/usr/bin/env python3

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/cryptocurrency.cv
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

"""
Trading API Examples - Python
Free Crypto News API - https://github.com/nirholas/cryptocurrency.cv

Examples for trading-related endpoints.
"""

import requests
import json
from typing import Optional, List

BASE_URL = "https://cryptocurrency.cv"


# =============================================================================
# GET /api/arbitrage - Arbitrage Opportunities
# =============================================================================

def get_arbitrage(min_spread: float = 0.5, limit: int = 20) -> dict:
    """
    Find arbitrage opportunities across exchanges.
    
    Args:
        min_spread: Minimum spread percentage
        limit: Number of opportunities
    
    Returns:
        Arbitrage opportunities with buy/sell exchanges
    """
    params = {"min_spread": min_spread, "limit": limit}
    response = requests.get(f"{BASE_URL}/api/arbitrage", params=params)
    return response.json()


# =============================================================================
# GET /api/signals - Trading Signals
# =============================================================================

def get_signals(asset: Optional[str] = None, timeframe: str = "1h") -> dict:
    """
    Get technical trading signals.
    
    Args:
        asset: Filter by asset (BTC, ETH, etc.)
        timeframe: Timeframe (1h, 4h, 1d)
    
    Returns:
        Trading signals and indicators
    """
    params = {"timeframe": timeframe}
    if asset:
        params["asset"] = asset
    
    response = requests.get(f"{BASE_URL}/api/signals", params=params)
    return response.json()


# =============================================================================
# GET /api/funding - Funding Rates
# =============================================================================

def get_funding_rates(exchange: Optional[str] = None) -> dict:
    """
    Get perpetual funding rates.
    
    Args:
        exchange: Filter by exchange
    
    Returns:
        Current funding rates for perpetual contracts
    """
    params = {}
    if exchange:
        params["exchange"] = exchange
    
    response = requests.get(f"{BASE_URL}/api/funding", params=params)
    return response.json()


# =============================================================================
# GET /api/options - Options Data
# =============================================================================

def get_options(asset: str = "BTC") -> dict:
    """
    Get crypto options market data.
    
    Args:
        asset: Asset symbol
    
    Returns:
        Options data (calls, puts, Greeks)
    """
    response = requests.get(f"{BASE_URL}/api/options", params={"asset": asset})
    return response.json()


# =============================================================================
# GET /api/liquidations - Liquidation Data
# =============================================================================

def get_liquidations(timeframe: str = "24h", min_value: int = 100000) -> dict:
    """
    Get recent liquidations data.
    
    Args:
        timeframe: Time window (1h, 4h, 24h)
        min_value: Minimum liquidation value in USD
    
    Returns:
        Liquidation events
    """
    params = {"timeframe": timeframe, "min_value": min_value}
    response = requests.get(f"{BASE_URL}/api/liquidations", params=params)
    return response.json()


# =============================================================================
# GET /api/whale-alerts - Whale Transactions
# =============================================================================

def get_whale_alerts(min_value: int = 1000000, limit: int = 20) -> dict:
    """
    Get large whale transactions.
    
    Args:
        min_value: Minimum transaction value in USD
        limit: Number of alerts
    
    Returns:
        Whale transactions
    """
    params = {"min_value": min_value, "limit": limit}
    response = requests.get(f"{BASE_URL}/api/whale-alerts", params=params)
    return response.json()


# =============================================================================
# GET /api/orderbook - Order Book Data
# =============================================================================

def get_orderbook(symbol: str = "BTCUSDT", exchange: str = "binance",
                  depth: int = 20) -> dict:
    """
    Get order book data.
    
    Args:
        symbol: Trading pair
        exchange: Exchange name
        depth: Order book depth
    
    Returns:
        Order book with bids and asks
    """
    params = {"symbol": symbol, "exchange": exchange, "depth": depth}
    response = requests.get(f"{BASE_URL}/api/orderbook", params=params)
    return response.json()


# =============================================================================
# GET /api/orderbook/stream - Real-time Order Book (SSE)
# =============================================================================

def stream_orderbook(symbol: str = "BTCUSDT", callback=None):
    """
    Stream order book updates in real-time.
    
    Args:
        symbol: Trading pair
        callback: Function to call with each update
    
    Note: This uses Server-Sent Events (SSE)
    """
    import sseclient  # pip install sseclient-py
    
    url = f"{BASE_URL}/api/orderbook/stream?symbol={symbol}"
    response = requests.get(url, stream=True)
    client = sseclient.SSEClient(response)
    
    for event in client.events():
        data = json.loads(event.data)
        if callback:
            callback(data)
        else:
            print(f"Update: {data}")


# =============================================================================
# GET /api/trading/orderbook - Trading Order Book
# =============================================================================

def get_trading_orderbook(symbol: str = "BTCUSDT") -> dict:
    """
    Get trading-focused order book with analysis.
    
    Args:
        symbol: Trading pair
    
    Returns:
        Order book with support/resistance levels
    """
    response = requests.get(f"{BASE_URL}/api/trading/orderbook", 
                           params={"symbol": symbol})
    return response.json()


# =============================================================================
# GET /api/trading/arbitrage - Advanced Arbitrage
# =============================================================================

def get_advanced_arbitrage(include_fees: bool = True) -> dict:
    """
    Get advanced arbitrage opportunities with fee calculation.
    
    Args:
        include_fees: Account for trading fees
    
    Returns:
        Net profitable arbitrage opportunities
    """
    response = requests.get(f"{BASE_URL}/api/trading/arbitrage",
                           params={"include_fees": str(include_fees).lower()})
    return response.json()


# =============================================================================
# GET /api/trading/options - Trading Options Data
# =============================================================================

def get_trading_options(asset: str = "BTC", 
                        expiry: Optional[str] = None) -> dict:
    """
    Get options data for trading.
    
    Args:
        asset: Asset symbol
        expiry: Filter by expiry date
    
    Returns:
        Options chain data
    """
    params = {"asset": asset}
    if expiry:
        params["expiry"] = expiry
    
    response = requests.get(f"{BASE_URL}/api/trading/options", params=params)
    return response.json()


# =============================================================================
# GET /api/funding/dashboard - Funding Dashboard
# =============================================================================

def get_funding_dashboard() -> dict:
    """
    Get funding rates dashboard across exchanges.
    
    Returns:
        Funding dashboard data
    """
    response = requests.get(f"{BASE_URL}/api/funding/dashboard")
    return response.json()


# =============================================================================
# GET /api/funding/history/[symbol] - Funding Rate History
# =============================================================================

def get_funding_history(symbol: str, period: str = "7d") -> dict:
    """
    Get historical funding rates for a symbol.
    
    Args:
        symbol: Trading pair (e.g., 'BTCUSDT')
        period: Time period (1d, 7d, 30d)
    
    Returns:
        Historical funding rate data
    """
    response = requests.get(
        f"{BASE_URL}/api/funding/history/{symbol}", 
        params={"period": period}
    )
    return response.json()


# =============================================================================
# GET /api/derivatives/opportunities - Trading Opportunities
# =============================================================================

def get_derivatives_opportunities() -> dict:
    """
    Get derivatives trading opportunities (basis trades, funding arb).
    
    Returns:
        Derivatives opportunities
    """
    response = requests.get(f"{BASE_URL}/api/derivatives/opportunities")
    return response.json()


# =============================================================================
# GET /api/derivatives/aggregated/funding - Aggregated Funding
# =============================================================================

def get_aggregated_funding() -> dict:
    """
    Get aggregated funding rates across exchanges.
    
    Returns:
        Aggregated funding rate data
    """
    response = requests.get(f"{BASE_URL}/api/derivatives/aggregated/funding")
    return response.json()


# =============================================================================
# GET /api/derivatives/aggregated/open-interest - Aggregated OI
# =============================================================================

def get_aggregated_open_interest() -> dict:
    """
    Get aggregated open interest across exchanges.
    
    Returns:
        Aggregated open interest data
    """
    response = requests.get(f"{BASE_URL}/api/derivatives/aggregated/open-interest")
    return response.json()


# =============================================================================
# GET /api/whale-alerts/context - Whale Alerts with Context
# =============================================================================

def get_whale_alerts_context(min_value: int = 5000000) -> dict:
    """
    Get whale alerts with market context and analysis.
    
    Args:
        min_value: Minimum transaction value in USD
    
    Returns:
        Whale alerts with context
    """
    response = requests.get(
        f"{BASE_URL}/api/whale-alerts/context", 
        params={"min_value": min_value}
    )
    return response.json()


# =============================================================================
# GET /api/backtest - Strategy Backtesting
# =============================================================================

def backtest(strategy: str, asset: str = "BTC", 
             period: str = "90d") -> dict:
    """
    Backtest a trading strategy.
    
    Args:
        strategy: Strategy name or parameters
        asset: Asset to backtest
        period: Backtest period
    
    Returns:
        Backtest results (returns, drawdown, Sharpe, etc.)
    """
    response = requests.get(
        f"{BASE_URL}/api/backtest",
        params={"strategy": strategy, "asset": asset, "period": period}
    )
    return response.json()


# =============================================================================
# GET /api/signals/narrative - Narrative Signals
# =============================================================================

def get_narrative_signals() -> dict:
    """
    Get trading signals based on market narratives.
    
    Returns:
        Narrative-driven trading signals
    """
    response = requests.get(f"{BASE_URL}/api/signals/narrative")
    return response.json()


# =============================================================================
# COMPLETE EXAMPLES
# =============================================================================

if __name__ == "__main__":
    print("\n" + "="*60)
    print("FREE CRYPTO NEWS API - TRADING EXAMPLES")
    print("="*60)
    
    # 1. Arbitrage
    print("\n💹 1. Arbitrage Opportunities")
    arb = get_arbitrage(min_spread=0.3, limit=5)
    print(f"   Found: {arb}")
    
    # 2. Signals
    print("\n📊 2. Trading Signals (BTC)")
    signals = get_signals(asset="BTC", timeframe="4h")
    print(f"   Signals: {signals}")
    
    # 3. Funding Rates
    print("\n💰 3. Funding Rates")
    funding = get_funding_rates()
    print(f"   Rates: {funding}")
    
    # 4. Options
    print("\n📈 4. BTC Options Data")
    options = get_options("BTC")
    print(f"   Options: {options}")
    
    # 5. Liquidations
    print("\n🔥 5. Recent Liquidations (24h)")
    liquidations = get_liquidations(timeframe="24h", min_value=500000)
    print(f"   Liquidations: {liquidations}")
    
    # 6. Whale Alerts
    print("\n🐋 6. Whale Alerts")
    whales = get_whale_alerts(min_value=5000000, limit=5)
    print(f"   Whales: {whales}")
    
    # 7. Order Book
    print("\n📖 7. BTC/USDT Order Book")
    orderbook = get_orderbook("BTCUSDT", depth=10)
    if isinstance(orderbook, dict):
        bids = orderbook.get("bids", [])[:3]
        asks = orderbook.get("asks", [])[:3]
        print(f"   Top Bids: {bids}")
        print(f"   Top Asks: {asks}")
    
    # 8. Advanced Arbitrage
    print("\n🔄 8. Advanced Arbitrage (with fees)")
    adv_arb = get_advanced_arbitrage(include_fees=True)
    print(f"   Opportunities: {adv_arb}")
    
    print("\n" + "="*60)
    print("All trading examples completed!")
    print("="*60)
