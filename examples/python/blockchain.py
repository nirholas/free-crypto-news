#!/usr/bin/env python3

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/cryptocurrency.cv
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

"""
Blockchain & On-Chain API Examples - Python
Free Crypto News API - https://github.com/nirholas/cryptocurrency.cv

Examples for blockchain and on-chain data endpoints.
"""

import requests
import json
from typing import Optional, List

BASE_URL = "https://cryptocurrency.cv"


# =============================================================================
# GET /api/nft - NFT News
# =============================================================================

def get_nft_news(limit: int = 20, collection: Optional[str] = None) -> dict:
    """
    Get NFT-related news.
    
    Args:
        limit: Number of articles
        collection: Filter by collection
    
    Returns:
        NFT news articles
    """
    params = {"limit": limit}
    if collection:
        params["collection"] = collection
    
    response = requests.get(f"{BASE_URL}/api/nft", params=params)
    return response.json()


# =============================================================================
# GET /api/onchain - On-Chain Data
# =============================================================================

def get_onchain_data(chain: str = "ethereum", metric: str = "transactions") -> dict:
    """
    Get on-chain metrics.
    
    Args:
        chain: Blockchain (ethereum, bitcoin, solana, etc.)
        metric: Metric type (transactions, fees, active_addresses)
    
    Returns:
        On-chain metrics
    """
    params = {"chain": chain, "metric": metric}
    response = requests.get(f"{BASE_URL}/api/onchain", params=params)
    return response.json()


# =============================================================================
# GET /api/onchain/gas - Gas Prices
# =============================================================================

def get_gas_prices(chain: str = "ethereum") -> dict:
    """
    Get current gas prices.
    
    Args:
        chain: Blockchain
    
    Returns:
        Gas price data
    """
    response = requests.get(f"{BASE_URL}/api/onchain/gas", params={"chain": chain})
    return response.json()


# =============================================================================
# GET /api/onchain/holders - Token Holders
# =============================================================================

def get_token_holders(token: str, limit: int = 100) -> dict:
    """
    Get top token holders.
    
    Args:
        token: Token address or symbol
        limit: Number of holders
    
    Returns:
        Top holder list
    """
    params = {"token": token, "limit": limit}
    response = requests.get(f"{BASE_URL}/api/onchain/holders", params=params)
    return response.json()


# =============================================================================
# GET /api/onchain/whales - Whale Movements
# =============================================================================

def get_whale_movements(asset: str = "BTC", min_value: int = 1000000) -> dict:
    """
    Get whale wallet movements.
    
    Args:
        asset: Asset symbol
        min_value: Minimum transaction value
    
    Returns:
        Whale movements
    """
    params = {"asset": asset, "min_value": min_value}
    response = requests.get(f"{BASE_URL}/api/onchain/whales", params=params)
    return response.json()


# =============================================================================
# GET /api/onchain/defi - DeFi TVL
# =============================================================================

def get_defi_tvl(protocol: Optional[str] = None) -> dict:
    """
    Get DeFi Total Value Locked.
    
    Args:
        protocol: Filter by protocol
    
    Returns:
        TVL data
    """
    params = {}
    if protocol:
        params["protocol"] = protocol
    
    response = requests.get(f"{BASE_URL}/api/onchain/defi", params=params)
    return response.json()


# =============================================================================
# GET /api/tokens - Token Data
# =============================================================================

def get_tokens(chain: str = "ethereum", limit: int = 100) -> dict:
    """
    Get token list.
    
    Args:
        chain: Blockchain
        limit: Number of tokens
    
    Returns:
        Token list
    """
    params = {"chain": chain, "limit": limit}
    response = requests.get(f"{BASE_URL}/api/tokens", params=params)
    return response.json()


def get_token(address: str, chain: str = "ethereum") -> dict:
    """
    Get token details.
    
    Args:
        address: Token contract address
        chain: Blockchain
    
    Returns:
        Token details
    """
    response = requests.get(f"{BASE_URL}/api/tokens/{address}", 
                           params={"chain": chain})
    return response.json()


# =============================================================================
# GET /api/staking - Staking Data
# =============================================================================

def get_staking(asset: Optional[str] = None) -> dict:
    """
    Get staking data and yields.
    
    Args:
        asset: Filter by asset
    
    Returns:
        Staking opportunities
    """
    params = {}
    if asset:
        params["asset"] = asset
    
    response = requests.get(f"{BASE_URL}/api/staking", params=params)
    return response.json()


# =============================================================================
# GET /api/layer2 - Layer 2 Data
# =============================================================================

def get_layer2_data() -> dict:
    """
    Get Layer 2 scaling solutions data.
    
    Returns:
        L2 data (Arbitrum, Optimism, etc.)
    """
    response = requests.get(f"{BASE_URL}/api/layer2")
    return response.json()


# =============================================================================
# GET /api/bridges - Cross-Chain Bridges
# =============================================================================

def get_bridges() -> dict:
    """
    Get cross-chain bridge data.
    
    Returns:
        Bridge TVL and volume
    """
    response = requests.get(f"{BASE_URL}/api/bridges")
    return response.json()


# =============================================================================
# GET /api/yields - DeFi Yields
# =============================================================================

def get_yields(chain: Optional[str] = None, 
               min_apy: Optional[float] = None) -> dict:
    """
    Get DeFi yield opportunities.
    
    Args:
        chain: Filter by chain
        min_apy: Minimum APY
    
    Returns:
        Yield opportunities
    """
    params = {}
    if chain:
        params["chain"] = chain
    if min_apy:
        params["min_apy"] = min_apy
    
    response = requests.get(f"{BASE_URL}/api/yields", params=params)
    return response.json()


# =============================================================================
# GET /api/airdrops - Airdrop Opportunities
# =============================================================================

def get_airdrops(status: str = "active") -> dict:
    """
    Get crypto airdrops.
    
    Args:
        status: Filter by status (active, upcoming, ended)
    
    Returns:
        Airdrop opportunities
    """
    response = requests.get(f"{BASE_URL}/api/airdrops", params={"status": status})
    return response.json()


# =============================================================================
# GET /api/security - Security Alerts
# =============================================================================

def get_security_alerts(severity: Optional[str] = None, 
                        limit: int = 20) -> dict:
    """
    Get security alerts (hacks, vulnerabilities).
    
    Args:
        severity: Filter by severity (high, medium, low)
        limit: Number of alerts
    
    Returns:
        Security alerts
    """
    params = {"limit": limit}
    if severity:
        params["severity"] = severity
    
    response = requests.get(f"{BASE_URL}/api/security", params=params)
    return response.json()


# =============================================================================
# GET /api/hacks - Hack Reports
# =============================================================================

def get_hacks(limit: int = 20) -> dict:
    """
    Get crypto hack reports.
    
    Args:
        limit: Number of reports
    
    Returns:
        Hack reports
    """
    response = requests.get(f"{BASE_URL}/api/hacks", params={"limit": limit})
    return response.json()


# =============================================================================
# GET /api/rugpull - Rug Pull Detection
# =============================================================================

def check_rugpull(token: str) -> dict:
    """
    Check token for rug pull indicators.
    
    Args:
        token: Token address
    
    Returns:
        Risk assessment
    """
    response = requests.get(f"{BASE_URL}/api/rugpull", params={"token": token})
    return response.json()


# =============================================================================
# GET /api/audit - Smart Contract Audits
# =============================================================================

def get_audits(protocol: Optional[str] = None, limit: int = 20) -> dict:
    """
    Get smart contract audits.
    
    Args:
        protocol: Filter by protocol
        limit: Number of audits
    
    Returns:
        Audit reports
    """
    params = {"limit": limit}
    if protocol:
        params["protocol"] = protocol
    
    response = requests.get(f"{BASE_URL}/api/audit", params=params)
    return response.json()


# =============================================================================
# GET /api/bitcoin/stats - Bitcoin Network Stats
# =============================================================================

def get_bitcoin_stats() -> dict:
    """
    Get comprehensive Bitcoin network statistics.
    
    Returns:
        Network stats (hashrate, difficulty, block time, etc.)
    """
    response = requests.get(f"{BASE_URL}/api/bitcoin/stats")
    return response.json()


# =============================================================================
# GET /api/bitcoin/difficulty - Mining Difficulty
# =============================================================================

def get_bitcoin_difficulty() -> dict:
    """
    Get Bitcoin mining difficulty data and next adjustment estimate.
    
    Returns:
        Difficulty data
    """
    response = requests.get(f"{BASE_URL}/api/bitcoin/difficulty")
    return response.json()


# =============================================================================
# GET /api/bitcoin/blocks - Recent Blocks
# =============================================================================

def get_bitcoin_blocks(limit: int = 10) -> dict:
    """
    Get recent Bitcoin blocks.
    
    Args:
        limit: Number of blocks
    
    Returns:
        Recent block data
    """
    response = requests.get(f"{BASE_URL}/api/bitcoin/blocks", params={"limit": limit})
    return response.json()


# =============================================================================
# GET /api/bitcoin/block-height - Current Block Height
# =============================================================================

def get_bitcoin_block_height() -> dict:
    """
    Get current Bitcoin block height.
    
    Returns:
        Current block height
    """
    response = requests.get(f"{BASE_URL}/api/bitcoin/block-height")
    return response.json()


# =============================================================================
# GET /api/bitcoin/mempool/info - Mempool Status
# =============================================================================

def get_bitcoin_mempool() -> dict:
    """
    Get Bitcoin mempool information.
    
    Returns:
        Mempool size, fees, congestion
    """
    response = requests.get(f"{BASE_URL}/api/bitcoin/mempool/info")
    return response.json()


# =============================================================================
# GET /api/bitcoin/mempool/fees - Recommended Fees
# =============================================================================

def get_bitcoin_mempool_fees() -> dict:
    """
    Get recommended Bitcoin transaction fees.
    
    Returns:
        Fee estimates (fastest, half-hour, hour, economy)
    """
    response = requests.get(f"{BASE_URL}/api/bitcoin/mempool/fees")
    return response.json()


# =============================================================================
# GET /api/bitcoin/network-stats - Extended Network Stats
# =============================================================================

def get_bitcoin_network_stats() -> dict:
    """
    Get extended Bitcoin network statistics.
    
    Returns:
        Detailed network statistics
    """
    response = requests.get(f"{BASE_URL}/api/bitcoin/network-stats")
    return response.json()


# =============================================================================
# GET /api/gas - Gas Prices (multi-chain)
# =============================================================================

def get_gas(chain: str = "ethereum") -> dict:
    """
    Get gas prices for a blockchain.
    
    Args:
        chain: Blockchain (ethereum, polygon, bsc, etc.)
    
    Returns:
        Gas price data (slow, standard, fast, instant)
    """
    response = requests.get(f"{BASE_URL}/api/gas", params={"chain": chain})
    return response.json()


# =============================================================================
# GET /api/gas/estimate - Gas Estimation
# =============================================================================

def get_gas_estimate(chain: str = "ethereum", tx_type: str = "transfer") -> dict:
    """
    Estimate gas for a transaction type.
    
    Args:
        chain: Blockchain
        tx_type: Transaction type (transfer, swap, mint, etc.)
    
    Returns:
        Gas estimate in native currency and USD
    """
    params = {"chain": chain, "type": tx_type}
    response = requests.get(f"{BASE_URL}/api/gas/estimate", params=params)
    return response.json()


# =============================================================================
# GET /api/gas/history - Historical Gas Prices
# =============================================================================

def get_gas_history(chain: str = "ethereum", period: str = "24h") -> dict:
    """
    Get historical gas price data.
    
    Args:
        chain: Blockchain
        period: Time period (1h, 24h, 7d, 30d)
    
    Returns:
        Historical gas price data
    """
    params = {"chain": chain, "period": period}
    response = requests.get(f"{BASE_URL}/api/gas/history", params=params)
    return response.json()


# =============================================================================
# GET /api/l2 - Layer 2 Overview
# =============================================================================

def get_l2() -> dict:
    """
    Get Layer 2 overview data.
    
    Returns:
        L2 ecosystem overview
    """
    response = requests.get(f"{BASE_URL}/api/l2")
    return response.json()


# =============================================================================
# GET /api/l2/projects - L2 Projects
# =============================================================================

def get_l2_projects() -> dict:
    """
    Get all Layer 2 projects with TVL and activity data.
    
    Returns:
        L2 project list with metrics
    """
    response = requests.get(f"{BASE_URL}/api/l2/projects")
    return response.json()


# =============================================================================
# GET /api/l2/activity - L2 Activity
# =============================================================================

def get_l2_activity() -> dict:
    """
    Get Layer 2 transaction activity data.
    
    Returns:
        L2 activity metrics (TPS, transactions, users)
    """
    response = requests.get(f"{BASE_URL}/api/l2/activity")
    return response.json()


# =============================================================================
# GET /api/l2/risk - L2 Risk Assessment
# =============================================================================

def get_l2_risk() -> dict:
    """
    Get Layer 2 risk assessments.
    
    Returns:
        L2 risk scores and analysis
    """
    response = requests.get(f"{BASE_URL}/api/l2/risk")
    return response.json()


# =============================================================================
# GET /api/solana - Solana Overview
# =============================================================================

def get_solana() -> dict:
    """
    Get Solana ecosystem overview.
    
    Returns:
        Solana network data
    """
    response = requests.get(f"{BASE_URL}/api/solana")
    return response.json()


# =============================================================================
# GET /api/solana/tokens - Solana Tokens
# =============================================================================

def get_solana_tokens(limit: int = 50) -> dict:
    """
    Get Solana SPL tokens.
    
    Args:
        limit: Number of tokens
    
    Returns:
        Solana token data
    """
    response = requests.get(f"{BASE_URL}/api/solana/tokens", params={"limit": limit})
    return response.json()


# =============================================================================
# GET /api/solana/defi - Solana DeFi
# =============================================================================

def get_solana_defi() -> dict:
    """
    Get Solana DeFi protocol data.
    
    Returns:
        Solana DeFi data
    """
    response = requests.get(f"{BASE_URL}/api/solana/defi")
    return response.json()


# =============================================================================
# GET /api/solana/nfts - Solana NFTs
# =============================================================================

def get_solana_nfts(limit: int = 20) -> dict:
    """
    Get Solana NFT collections.
    
    Args:
        limit: Number of collections
    
    Returns:
        Solana NFT data
    """
    response = requests.get(f"{BASE_URL}/api/solana/nfts", params={"limit": limit})
    return response.json()


# =============================================================================
# GET /api/nft/market - NFT Market Overview
# =============================================================================

def get_nft_market() -> dict:
    """
    Get NFT market overview data.
    
    Returns:
        NFT market stats (volume, floor prices, etc.)
    """
    response = requests.get(f"{BASE_URL}/api/nft/market")
    return response.json()


# =============================================================================
# GET /api/nft/sales/recent - Recent NFT Sales
# =============================================================================

def get_nft_recent_sales(limit: int = 20) -> dict:
    """
    Get recent notable NFT sales.
    
    Args:
        limit: Number of sales
    
    Returns:
        Recent NFT sale data
    """
    response = requests.get(f"{BASE_URL}/api/nft/sales/recent", params={"limit": limit})
    return response.json()


# =============================================================================
# GET /api/nft/collections/trending - Trending NFT Collections
# =============================================================================

def get_nft_trending() -> dict:
    """
    Get trending NFT collections.
    
    Returns:
        Trending NFT collections
    """
    response = requests.get(f"{BASE_URL}/api/nft/collections/trending")
    return response.json()


# =============================================================================
# GET /api/token-unlocks - Token Unlock Schedule
# =============================================================================

def get_token_unlocks(limit: int = 20) -> dict:
    """
    Get upcoming token unlock events.
    
    Args:
        limit: Number of events
    
    Returns:
        Token unlock schedule
    """
    response = requests.get(f"{BASE_URL}/api/token-unlocks", params={"limit": limit})
    return response.json()


# =============================================================================
# GET /api/validators - Validator Data
# =============================================================================

def get_validators(chain: Optional[str] = None) -> dict:
    """
    Get blockchain validator data.
    
    Args:
        chain: Filter by chain (ethereum, solana, etc.)
    
    Returns:
        Validator data
    """
    params = {}
    if chain:
        params["chain"] = chain
    
    response = requests.get(f"{BASE_URL}/api/validators", params=params)
    return response.json()


# =============================================================================
# COMPLETE EXAMPLES
# =============================================================================

if __name__ == "__main__":
    print("\n" + "="*60)
    print("FREE CRYPTO NEWS API - BLOCKCHAIN & ON-CHAIN EXAMPLES")
    print("="*60)
    
    # 1. NFT News
    print("\n🎨 1. NFT News")
    nft = get_nft_news(limit=5)
    print(f"   NFT News: {nft}")
    
    # 2. On-Chain Metrics
    print("\n⛓️ 2. Ethereum On-Chain Data")
    onchain = get_onchain_data(chain="ethereum", metric="transactions")
    print(f"   On-Chain: {onchain}")
    
    # 3. Gas Prices
    print("\n⛽ 3. ETH Gas Prices")
    gas = get_gas_prices("ethereum")
    print(f"   Gas: {gas}")
    
    # 4. Whale Movements
    print("\n🐋 4. BTC Whale Movements")
    whales = get_whale_movements("BTC", min_value=5000000)
    print(f"   Whales: {whales}")
    
    # 5. DeFi TVL
    print("\n🔒 5. DeFi TVL")
    tvl = get_defi_tvl()
    print(f"   TVL: {tvl}")
    
    # 6. Staking
    print("\n🥩 6. Staking Opportunities")
    staking = get_staking()
    print(f"   Staking: {staking}")
    
    # 7. Layer 2
    print("\n🔷 7. Layer 2 Data")
    l2 = get_layer2_data()
    print(f"   L2: {l2}")
    
    # 8. Yields
    print("\n💰 8. DeFi Yields (>10% APY)")
    yields = get_yields(min_apy=10)
    print(f"   Yields: {yields}")
    
    # 9. Airdrops
    print("\n🪂 9. Active Airdrops")
    airdrops = get_airdrops(status="active")
    print(f"   Airdrops: {airdrops}")
    
    # 10. Security
    print("\n🔐 10. Security Alerts")
    security = get_security_alerts(severity="high", limit=5)
    print(f"   Security: {security}")
    
    # 11. Hacks
    print("\n⚠️ 11. Recent Hacks")
    hacks = get_hacks(limit=5)
    print(f"   Hacks: {hacks}")
    
    # 12. Audits
    print("\n📋 12. Smart Contract Audits")
    audits = get_audits(limit=5)
    print(f"   Audits: {audits}")
    
    print("\n" + "="*60)
    print("All blockchain & on-chain examples completed!")
    print("="*60)
