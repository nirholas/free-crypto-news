// Copyright 2024-2026 nirholas. All rights reserved.
// SPDX-License-Identifier: SEE LICENSE IN LICENSE
// https://github.com/nirholas/cryptocurrency.cv
//
// This file is part of free-crypto-news.
// Unauthorized copying, modification, or distribution is strictly prohibited.
// For licensing inquiries: nirholas@users.noreply.github.com

// Package cryptonews provides a Go client for the Free Crypto News API.
// https://github.com/nirholas/cryptocurrency.cv
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const BaseURL = "https://cryptocurrency.cv"

// Client is the API client
type Client struct {
	HTTPClient *http.Client
	BaseURL    string
	APIKey     string
}

// NewClient creates a new API client
func NewClient(apiKey string) *Client {
	return &Client{
		HTTPClient: &http.Client{Timeout: 30 * time.Second},
		BaseURL:    BaseURL,
		APIKey:     apiKey,
	}
}

// =============================================================================
// News Types
// =============================================================================

type Article struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	URL         string `json:"url"`
	Source      string `json:"source"`
	PublishedAt string `json:"publishedAt"`
	Category    string `json:"category"`
	ImageURL    string `json:"imageUrl"`
}

type NewsResponse struct {
	Articles []Article `json:"articles"`
	Total    int       `json:"total"`
}

// =============================================================================
// Market Types
// =============================================================================

type Coin struct {
	ID            string  `json:"id"`
	Symbol        string  `json:"symbol"`
	Name          string  `json:"name"`
	CurrentPrice  float64 `json:"current_price"`
	MarketCap     float64 `json:"market_cap"`
	PriceChange24 float64 `json:"price_change_percentage_24h"`
}

type FearGreedIndex struct {
	Value          int    `json:"value"`
	Classification string `json:"classification"`
	Timestamp      string `json:"timestamp"`
}

// =============================================================================
// Sentiment Types
// =============================================================================

type SentimentResult struct {
	Asset     string  `json:"asset"`
	Score     float64 `json:"score"`
	Label     string  `json:"label"`
	Positive  int     `json:"positive"`
	Negative  int     `json:"negative"`
	Neutral   int     `json:"neutral"`
	UpdatedAt string  `json:"updatedAt"`
}

// =============================================================================
// DeFi Types
// =============================================================================

type DefiYield struct {
	Pool       string  `json:"pool"`
	Project    string  `json:"project"`
	Chain      string  `json:"chain"`
	TVL        float64 `json:"tvlUsd"`
	APY        float64 `json:"apy"`
	APYBase    float64 `json:"apyBase"`
	APYReward  float64 `json:"apyReward"`
	Stablecoin bool    `json:"stablecoin"`
}

type ProtocolHealth struct {
	Protocol   string  `json:"protocol"`
	HealthScore float64 `json:"healthScore"`
	TVL        float64 `json:"tvl"`
	RiskLevel  string  `json:"riskLevel"`
	Audited    bool    `json:"audited"`
}

type StablecoinData struct {
	Symbol       string   `json:"symbol"`
	Name         string   `json:"name"`
	Price        float64  `json:"price"`
	MarketCap    float64  `json:"marketCap"`
	PegDeviation float64  `json:"pegDeviation"`
	Chains       []string `json:"chains"`
}

// =============================================================================
// Blockchain Extended Types
// =============================================================================

type BitcoinStats struct {
	BlockHeight  int     `json:"blockHeight"`
	Hashrate     float64 `json:"hashrate"`
	Difficulty   float64 `json:"difficulty"`
	MempoolSize  int     `json:"mempoolSize"`
	AvgFee       float64 `json:"avgFee"`
}

type L2Project struct {
	Name      string  `json:"name"`
	TVL       float64 `json:"tvl"`
	Type      string  `json:"type"`
	TPS       float64 `json:"tps"`
	RiskLevel string  `json:"riskLevel"`
}

type GasEstimate struct {
	Chain    string  `json:"chain"`
	Slow     float64 `json:"slow"`
	Standard float64 `json:"standard"`
	Fast     float64 `json:"fast"`
	Instant  float64 `json:"instant"`
}

// =============================================================================
// Macro Types
// =============================================================================

type MacroIndicator struct {
	Name          string  `json:"name"`
	Value         float64 `json:"value"`
	PreviousValue float64 `json:"previousValue"`
	Change        float64 `json:"change"`
	Timestamp     string  `json:"timestamp"`
}

type Prediction struct {
	Asset          string  `json:"asset"`
	CurrentPrice   float64 `json:"currentPrice"`
	PredictedPrice float64 `json:"predictedPrice"`
	Timeframe      string  `json:"timeframe"`
	Confidence     float64 `json:"confidence"`
	Direction      string  `json:"direction"`
}

// =============================================================================
// NEWS ENDPOINTS
// =============================================================================

// GetNews fetches the main news feed
func (c *Client) GetNews(limit int, category, source string) (*NewsResponse, error) {
	params := url.Values{}
	params.Set("limit", fmt.Sprintf("%d", limit))
	if category != "" {
		params.Set("category", category)
	}
	if source != "" {
		params.Set("source", source)
	}

	var response NewsResponse
	err := c.get("/api/news", params, &response)
	return &response, err
}

// GetBitcoinNews fetches Bitcoin-specific news
func (c *Client) GetBitcoinNews(limit int) (*NewsResponse, error) {
	params := url.Values{}
	params.Set("limit", fmt.Sprintf("%d", limit))

	var response NewsResponse
	err := c.get("/api/bitcoin", params, &response)
	return &response, err
}

// GetDeFiNews fetches DeFi news
func (c *Client) GetDeFiNews(limit int) (*NewsResponse, error) {
	params := url.Values{}
	params.Set("limit", fmt.Sprintf("%d", limit))

	var response NewsResponse
	err := c.get("/api/defi", params, &response)
	return &response, err
}

// GetBreakingNews fetches breaking news
func (c *Client) GetBreakingNews() (*NewsResponse, error) {
	var response NewsResponse
	err := c.get("/api/breaking", nil, &response)
	return &response, err
}

// SearchNews searches across all news
func (c *Client) SearchNews(query string, limit int) (*NewsResponse, error) {
	params := url.Values{}
	params.Set("q", query)
	params.Set("limit", fmt.Sprintf("%d", limit))

	var response NewsResponse
	err := c.get("/api/search", params, &response)
	return &response, err
}

// GetTrending fetches trending topics
func (c *Client) GetTrending(limit int) ([]map[string]interface{}, error) {
	params := url.Values{}
	params.Set("limit", fmt.Sprintf("%d", limit))

	var response []map[string]interface{}
	err := c.get("/api/trending", params, &response)
	return response, err
}

// GetInternationalNews fetches international news
func (c *Client) GetInternationalNews(lang string, translate bool) (*NewsResponse, error) {
	params := url.Values{}
	if lang != "" {
		params.Set("lang", lang)
	}
	params.Set("translate", fmt.Sprintf("%t", translate))

	var response NewsResponse
	err := c.get("/api/news/international", params, &response)
	return &response, err
}

// =============================================================================
// AI ENDPOINTS
// =============================================================================

// GetSentiment fetches sentiment analysis
func (c *Client) GetSentiment(asset string, limit int) (*SentimentResult, error) {
	params := url.Values{}
	if asset != "" {
		params.Set("asset", asset)
	}
	params.Set("limit", fmt.Sprintf("%d", limit))

	var response SentimentResult
	err := c.get("/api/sentiment", params, &response)
	return &response, err
}

// AskAI asks the AI a question
func (c *Client) AskAI(question string) (map[string]interface{}, error) {
	params := url.Values{}
	params.Set("q", question)

	var response map[string]interface{}
	err := c.get("/api/ask", params, &response)
	return response, err
}

// GetMarketBrief fetches the AI market brief
func (c *Client) GetMarketBrief() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/ai/brief", nil, &response)
	return response, err
}

// GetNarratives fetches emerging narratives
func (c *Client) GetNarratives(limit int) ([]map[string]interface{}, error) {
	params := url.Values{}
	params.Set("limit", fmt.Sprintf("%d", limit))

	var response []map[string]interface{}
	err := c.get("/api/narratives", params, &response)
	return response, err
}

// =============================================================================
// MARKET DATA ENDPOINTS
// =============================================================================

// GetCoins fetches coin market data
func (c *Client) GetCoins(limit int, order string) ([]Coin, error) {
	params := url.Values{}
	params.Set("limit", fmt.Sprintf("%d", limit))
	if order != "" {
		params.Set("order", order)
	}

	var response []Coin
	err := c.get("/api/market/coins", params, &response)
	return response, err
}

// GetOHLC fetches OHLC candlestick data
func (c *Client) GetOHLC(coinID string, days int) ([][]float64, error) {
	params := url.Values{}
	params.Set("days", fmt.Sprintf("%d", days))

	var response [][]float64
	err := c.get(fmt.Sprintf("/api/market/ohlc/%s", coinID), params, &response)
	return response, err
}

// GetFearGreed fetches the Fear & Greed Index
func (c *Client) GetFearGreed() (*FearGreedIndex, error) {
	var response FearGreedIndex
	err := c.get("/api/fear-greed", nil, &response)
	return &response, err
}

// CompareCoins compares multiple coins
func (c *Client) CompareCoins(coins []string) (map[string]interface{}, error) {
	params := url.Values{}
	params.Set("coins", strings.Join(coins, ","))

	var response map[string]interface{}
	err := c.get("/api/market/compare", params, &response)
	return response, err
}

// GetDefiMarket fetches DeFi market data
func (c *Client) GetDefiMarket() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/market/defi", nil, &response)
	return response, err
}

// =============================================================================
// TRADING ENDPOINTS
// =============================================================================

// GetArbitrage fetches arbitrage opportunities
func (c *Client) GetArbitrage(minSpread float64, limit int) ([]map[string]interface{}, error) {
	params := url.Values{}
	params.Set("min_spread", fmt.Sprintf("%.2f", minSpread))
	params.Set("limit", fmt.Sprintf("%d", limit))

	var response []map[string]interface{}
	err := c.get("/api/arbitrage", params, &response)
	return response, err
}

// GetSignals fetches trading signals
func (c *Client) GetSignals(asset, timeframe string) (map[string]interface{}, error) {
	params := url.Values{}
	if asset != "" {
		params.Set("asset", asset)
	}
	params.Set("timeframe", timeframe)

	var response map[string]interface{}
	err := c.get("/api/signals", params, &response)
	return response, err
}

// GetFundingRates fetches perpetual funding rates
func (c *Client) GetFundingRates(exchange string) ([]map[string]interface{}, error) {
	params := url.Values{}
	if exchange != "" {
		params.Set("exchange", exchange)
	}

	var response []map[string]interface{}
	err := c.get("/api/funding", params, &response)
	return response, err
}

// GetWhaleAlerts fetches whale transactions
func (c *Client) GetWhaleAlerts(minValue int, limit int) ([]map[string]interface{}, error) {
	params := url.Values{}
	params.Set("min_value", fmt.Sprintf("%d", minValue))
	params.Set("limit", fmt.Sprintf("%d", limit))

	var response []map[string]interface{}
	err := c.get("/api/whale-alerts", params, &response)
	return response, err
}

// GetOrderbook fetches order book data
func (c *Client) GetOrderbook(symbol, exchange string, depth int) (map[string]interface{}, error) {
	params := url.Values{}
	params.Set("symbol", symbol)
	params.Set("exchange", exchange)
	params.Set("depth", fmt.Sprintf("%d", depth))

	var response map[string]interface{}
	err := c.get("/api/orderbook", params, &response)
	return response, err
}

// =============================================================================
// DEFI ENDPOINTS
// =============================================================================

// GetDefiSummary fetches DeFi market summary
func (c *Client) GetDefiSummary() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/defi/summary", nil, &response)
	return response, err
}

// GetProtocolHealth fetches DeFi protocol health scores
func (c *Client) GetProtocolHealth(protocol string) ([]ProtocolHealth, error) {
	params := url.Values{}
	if protocol != "" {
		params.Set("protocol", protocol)
	}

	var response []ProtocolHealth
	err := c.get("/api/defi/protocol-health", params, &response)
	return response, err
}

// GetDefiYields fetches DeFi yield opportunities
func (c *Client) GetDefiYields(chain, project string) ([]DefiYield, error) {
	params := url.Values{}
	if chain != "" {
		params.Set("chain", chain)
	}
	if project != "" {
		params.Set("project", project)
	}

	var response []DefiYield
	err := c.get("/api/defi/yields", params, &response)
	return response, err
}

// GetYieldStats fetches aggregate yield statistics
func (c *Client) GetYieldStats() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/defi/yields/stats", nil, &response)
	return response, err
}

// GetYieldsByChain fetches yields broken down by chain
func (c *Client) GetYieldsByChain() ([]map[string]interface{}, error) {
	var response []map[string]interface{}
	err := c.get("/api/defi/yields/chains", nil, &response)
	return response, err
}

// GetDexVolumes fetches DEX trading volumes
func (c *Client) GetDexVolumes() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/defi/dex-volumes", nil, &response)
	return response, err
}

// GetStablecoins fetches stablecoin market data
func (c *Client) GetStablecoins() ([]StablecoinData, error) {
	var response []StablecoinData
	err := c.get("/api/stablecoins", nil, &response)
	return response, err
}

// GetStablecoinDepeg monitors stablecoins for depeg events
func (c *Client) GetStablecoinDepeg() ([]map[string]interface{}, error) {
	var response []map[string]interface{}
	err := c.get("/api/stablecoins/depeg", nil, &response)
	return response, err
}

// GetStablecoinDominance fetches stablecoin market share data
func (c *Client) GetStablecoinDominance() ([]map[string]interface{}, error) {
	var response []map[string]interface{}
	err := c.get("/api/stablecoins/dominance", nil, &response)
	return response, err
}

// =============================================================================
// BITCOIN EXTENDED ENDPOINTS
// =============================================================================

// GetBitcoinStats fetches comprehensive Bitcoin network statistics
func (c *Client) GetBitcoinStats() (*BitcoinStats, error) {
	var response BitcoinStats
	err := c.get("/api/bitcoin/stats", nil, &response)
	return &response, err
}

// GetBitcoinDifficulty fetches Bitcoin mining difficulty
func (c *Client) GetBitcoinDifficulty() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/bitcoin/difficulty", nil, &response)
	return response, err
}

// GetBitcoinBlocks fetches recent Bitcoin blocks
func (c *Client) GetBitcoinBlocks(limit int) ([]map[string]interface{}, error) {
	params := url.Values{}
	params.Set("limit", fmt.Sprintf("%d", limit))

	var response []map[string]interface{}
	err := c.get("/api/bitcoin/blocks", params, &response)
	return response, err
}

// GetBitcoinBlockHeight fetches current block height
func (c *Client) GetBitcoinBlockHeight() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/bitcoin/block-height", nil, &response)
	return response, err
}

// GetBitcoinMempool fetches Bitcoin mempool information
func (c *Client) GetBitcoinMempool() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/bitcoin/mempool/info", nil, &response)
	return response, err
}

// GetBitcoinMempoolFees fetches recommended Bitcoin fees
func (c *Client) GetBitcoinMempoolFees() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/bitcoin/mempool/fees", nil, &response)
	return response, err
}

// =============================================================================
// LAYER 2 ENDPOINTS
// =============================================================================

// GetL2Projects fetches Layer 2 projects
func (c *Client) GetL2Projects() ([]L2Project, error) {
	var response []L2Project
	err := c.get("/api/l2/projects", nil, &response)
	return response, err
}

// GetL2Activity fetches Layer 2 activity metrics
func (c *Client) GetL2Activity() ([]map[string]interface{}, error) {
	var response []map[string]interface{}
	err := c.get("/api/l2/activity", nil, &response)
	return response, err
}

// GetL2Risk fetches Layer 2 risk assessments
func (c *Client) GetL2Risk() ([]map[string]interface{}, error) {
	var response []map[string]interface{}
	err := c.get("/api/l2/risk", nil, &response)
	return response, err
}

// =============================================================================
// SOLANA ENDPOINTS
// =============================================================================

// GetSolanaTokens fetches Solana SPL tokens
func (c *Client) GetSolanaTokens(limit int) ([]map[string]interface{}, error) {
	params := url.Values{}
	params.Set("limit", fmt.Sprintf("%d", limit))

	var response []map[string]interface{}
	err := c.get("/api/solana/tokens", params, &response)
	return response, err
}

// GetSolanaDefi fetches Solana DeFi data
func (c *Client) GetSolanaDefi() ([]map[string]interface{}, error) {
	var response []map[string]interface{}
	err := c.get("/api/solana/defi", nil, &response)
	return response, err
}

// =============================================================================
// NFT EXTENDED ENDPOINTS
// =============================================================================

// GetNFTMarket fetches NFT market overview
func (c *Client) GetNFTMarket() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/nft/market", nil, &response)
	return response, err
}

// GetNFTRecentSales fetches recent NFT sales
func (c *Client) GetNFTRecentSales(limit int) ([]map[string]interface{}, error) {
	params := url.Values{}
	params.Set("limit", fmt.Sprintf("%d", limit))

	var response []map[string]interface{}
	err := c.get("/api/nft/sales/recent", params, &response)
	return response, err
}

// GetNFTTrending fetches trending NFT collections
func (c *Client) GetNFTTrending() ([]map[string]interface{}, error) {
	var response []map[string]interface{}
	err := c.get("/api/nft/collections/trending", nil, &response)
	return response, err
}

// GetTokenUnlocks fetches upcoming token unlock events
func (c *Client) GetTokenUnlocks() ([]map[string]interface{}, error) {
	var response []map[string]interface{}
	err := c.get("/api/token-unlocks", nil, &response)
	return response, err
}

// =============================================================================
// MACRO & ECONOMIC ENDPOINTS
// =============================================================================

// GetMacro fetches macroeconomic overview
func (c *Client) GetMacro() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/macro", nil, &response)
	return response, err
}

// GetMacroIndicators fetches economic indicators
func (c *Client) GetMacroIndicators(indicator string) ([]MacroIndicator, error) {
	params := url.Values{}
	if indicator != "" {
		params.Set("indicator", indicator)
	}

	var response []MacroIndicator
	err := c.get("/api/macro/indicators", params, &response)
	return response, err
}

// GetFedData fetches Federal Reserve data
func (c *Client) GetFedData() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/macro/fed", nil, &response)
	return response, err
}

// GetDXY fetches US Dollar Index
func (c *Client) GetDXY() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/macro/dxy", nil, &response)
	return response, err
}

// GetMacroCorrelations fetches crypto-macro correlations
func (c *Client) GetMacroCorrelations(asset string) (map[string]interface{}, error) {
	params := url.Values{}
	params.Set("asset", asset)

	var response map[string]interface{}
	err := c.get("/api/macro/correlations", params, &response)
	return response, err
}

// GetGlobalData fetches global market data
func (c *Client) GetGlobalData() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/global", nil, &response)
	return response, err
}

// GetExchangeRates fetches fiat exchange rates
func (c *Client) GetExchangeRates() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/exchange-rates", nil, &response)
	return response, err
}

// ConvertCurrency converts between currencies
func (c *Client) ConvertCurrency(from, to string, amount float64) (map[string]interface{}, error) {
	params := url.Values{}
	params.Set("from", from)
	params.Set("to", to)
	params.Set("amount", fmt.Sprintf("%.8f", amount))

	var response map[string]interface{}
	err := c.get("/api/exchange-rates/convert", params, &response)
	return response, err
}

// GetPredictions fetches AI price predictions
func (c *Client) GetPredictions(asset string) ([]Prediction, error) {
	params := url.Values{}
	if asset != "" {
		params.Set("asset", asset)
	}

	var response []Prediction
	err := c.get("/api/predictions", params, &response)
	return response, err
}

// =============================================================================
// EXTENDED TRADING ENDPOINTS
// =============================================================================

// GetFundingDashboard fetches funding rates dashboard
func (c *Client) GetFundingDashboard() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/funding/dashboard", nil, &response)
	return response, err
}

// GetFundingHistory fetches historical funding rates
func (c *Client) GetFundingHistory(symbol, period string) ([]map[string]interface{}, error) {
	params := url.Values{}
	params.Set("period", period)

	var response []map[string]interface{}
	err := c.get(fmt.Sprintf("/api/funding/history/%s", symbol), params, &response)
	return response, err
}

// GetDerivativesOpportunities fetches derivatives trading opportunities
func (c *Client) GetDerivativesOpportunities() ([]map[string]interface{}, error) {
	var response []map[string]interface{}
	err := c.get("/api/derivatives/opportunities", nil, &response)
	return response, err
}

// GetWhaleAlertsContext fetches whale alerts with market context
func (c *Client) GetWhaleAlertsContext(minValue int) ([]map[string]interface{}, error) {
	params := url.Values{}
	params.Set("min_value", fmt.Sprintf("%d", minValue))

	var response []map[string]interface{}
	err := c.get("/api/whale-alerts/context", params, &response)
	return response, err
}

// Backtest runs a strategy backtest
func (c *Client) Backtest(strategy, asset, period string) (map[string]interface{}, error) {
	params := url.Values{}
	params.Set("strategy", strategy)
	params.Set("asset", asset)
	params.Set("period", period)

	var response map[string]interface{}
	err := c.get("/api/backtest", params, &response)
	return response, err
}

// =============================================================================
// EXTENDED AI ENDPOINTS
// =============================================================================

// GetFlashBriefing fetches AI flash briefing
func (c *Client) GetFlashBriefing() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/ai/flash-briefing", nil, &response)
	return response, err
}

// GetOracle fetches AI oracle prediction
func (c *Client) GetOracle(asset string) (map[string]interface{}, error) {
	params := url.Values{}
	params.Set("asset", asset)

	var response map[string]interface{}
	err := c.get("/api/ai/oracle", params, &response)
	return response, err
}

// Factcheck fact-checks a claim
func (c *Client) Factcheck(claim string) (map[string]interface{}, error) {
	params := url.Values{}
	params.Set("claim", claim)

	var response map[string]interface{}
	err := c.get("/api/factcheck", params, &response)
	return response, err
}

// GetGas fetches gas prices for a chain
func (c *Client) GetGas(chain string) (*GasEstimate, error) {
	params := url.Values{}
	params.Set("chain", chain)

	var response GasEstimate
	err := c.get("/api/gas", params, &response)
	return &response, err
}

// GetGasEstimate estimates gas for a transaction type
func (c *Client) GetGasEstimate(chain, txType string) (map[string]interface{}, error) {
	params := url.Values{}
	params.Set("chain", chain)
	params.Set("type", txType)

	var response map[string]interface{}
	err := c.get("/api/gas/estimate", params, &response)
	return response, err
}

// GetLiquidations fetches recent liquidations
func (c *Client) GetLiquidations(timeframe string) ([]map[string]interface{}, error) {
	params := url.Values{}
	params.Set("timeframe", timeframe)

	var response []map[string]interface{}
	err := c.get("/api/liquidations", params, &response)
	return response, err
}

// GetHealth checks API health status
func (c *Client) GetHealth() (map[string]interface{}, error) {
	var response map[string]interface{}
	err := c.get("/api/health", nil, &response)
	return response, err
}

// =============================================================================
// REGULATORY ENDPOINTS
// =============================================================================

// GetRegulatoryNews fetches regulatory news
func (c *Client) GetRegulatoryNews(region string, limit int) (*NewsResponse, error) {
	params := url.Values{}
	if region != "" {
		params.Set("region", region)
	}
	params.Set("limit", fmt.Sprintf("%d", limit))

	var response NewsResponse
	err := c.get("/api/regulatory", params, &response)
	return &response, err
}

// GetETFNews fetches ETF news
func (c *Client) GetETFNews(etfType string) (*NewsResponse, error) {
	params := url.Values{}
	if etfType != "" {
		params.Set("type", etfType)
	}

	var response NewsResponse
	err := c.get("/api/regulatory/etf", params, &response)
	return &response, err
}

// =============================================================================
// BLOCKCHAIN ENDPOINTS
// =============================================================================

// GetNFTNews fetches NFT news
func (c *Client) GetNFTNews(limit int) (*NewsResponse, error) {
	params := url.Values{}
	params.Set("limit", fmt.Sprintf("%d", limit))

	var response NewsResponse
	err := c.get("/api/nft", params, &response)
	return &response, err
}

// GetGasPrices fetches gas prices
func (c *Client) GetGasPrices(chain string) (map[string]interface{}, error) {
	params := url.Values{}
	params.Set("chain", chain)

	var response map[string]interface{}
	err := c.get("/api/onchain/gas", params, &response)
	return response, err
}

// GetDefiTVL fetches DeFi TVL
func (c *Client) GetDefiTVL(protocol string) (map[string]interface{}, error) {
	params := url.Values{}
	if protocol != "" {
		params.Set("protocol", protocol)
	}

	var response map[string]interface{}
	err := c.get("/api/onchain/defi", params, &response)
	return response, err
}

// =============================================================================
// FEEDS & EXPORT ENDPOINTS
// =============================================================================

// GetRSSFeed fetches RSS feed as JSON
func (c *Client) GetRSSFeed(category string, limit int) (*NewsResponse, error) {
	params := url.Values{}
	if category != "" {
		params.Set("category", category)
	}
	params.Set("limit", fmt.Sprintf("%d", limit))

	var response NewsResponse
	err := c.get("/api/rss.json", params, &response)
	return &response, err
}

// =============================================================================
// HTTP HELPERS
// =============================================================================

func (c *Client) get(path string, params url.Values, result interface{}) error {
	urlStr := c.BaseURL + path
	if params != nil && len(params) > 0 {
		urlStr += "?" + params.Encode()
	}

	req, err := http.NewRequest("GET", urlStr, nil)
	if err != nil {
		return err
	}

	if c.APIKey != "" {
		req.Header.Set("X-API-Key", c.APIKey)
	}
	req.Header.Set("Accept", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	return json.Unmarshal(body, result)
}

func (c *Client) post(path string, payload interface{}, result interface{}) error {
	urlStr := c.BaseURL + path

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", urlStr, strings.NewReader(string(jsonPayload)))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	if c.APIKey != "" {
		req.Header.Set("X-API-Key", c.APIKey)
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	return json.Unmarshal(body, result)
}

// =============================================================================
// EXAMPLE USAGE
// =============================================================================

func main() {
	fmt.Println("=".repeat(60))
	fmt.Println("FREE CRYPTO NEWS API - GO EXAMPLES")
	fmt.Println("=".repeat(60))

	client := NewClient("")

	// 1. Latest News
	fmt.Println("\n📰 1. Latest News (5 articles)")
	news, err := client.GetNews(5, "", "")
	if err != nil {
		fmt.Printf("   Error: %v\n", err)
	} else {
		for i, article := range news.Articles {
			if i >= 5 {
				break
			}
			title := article.Title
			if len(title) > 60 {
				title = title[:60] + "..."
			}
			fmt.Printf("   %d. %s\n", i+1, title)
		}
	}

	// 2. Bitcoin News
	fmt.Println("\n₿ 2. Bitcoin News")
	btcNews, err := client.GetBitcoinNews(3)
	if err != nil {
		fmt.Printf("   Error: %v\n", err)
	} else {
		for _, article := range btcNews.Articles {
			title := article.Title
			if len(title) > 60 {
				title = title[:60] + "..."
			}
			fmt.Printf("   - %s\n", title)
		}
	}

	// 3. Search
	fmt.Println("\n🔍 3. Search 'Ethereum ETF'")
	searchResults, err := client.SearchNews("Ethereum ETF", 3)
	if err != nil {
		fmt.Printf("   Error: %v\n", err)
	} else {
		for _, article := range searchResults.Articles {
			title := article.Title
			if len(title) > 60 {
				title = title[:60] + "..."
			}
			fmt.Printf("   - %s\n", title)
		}
	}

	// 4. Sentiment
	fmt.Println("\n📊 4. BTC Sentiment")
	sentiment, err := client.GetSentiment("BTC", 20)
	if err != nil {
		fmt.Printf("   Error: %v\n", err)
	} else {
		fmt.Printf("   Score: %.2f (%s)\n", sentiment.Score, sentiment.Label)
	}

	// 5. Fear & Greed
	fmt.Println("\n😱 5. Fear & Greed Index")
	fg, err := client.GetFearGreed()
	if err != nil {
		fmt.Printf("   Error: %v\n", err)
	} else {
		fmt.Printf("   Value: %d (%s)\n", fg.Value, fg.Classification)
	}

	// 6. Top Coins
	fmt.Println("\n💰 6. Top 5 Coins")
	coins, err := client.GetCoins(5, "market_cap_desc")
	if err != nil {
		fmt.Printf("   Error: %v\n", err)
	} else {
		for _, coin := range coins {
			fmt.Printf("   %s: $%.2f\n", coin.Name, coin.CurrentPrice)
		}
	}

	// 7. Arbitrage
	fmt.Println("\n💹 7. Arbitrage Opportunities")
	arb, err := client.GetArbitrage(0.5, 5)
	if err != nil {
		fmt.Printf("   Error: %v\n", err)
	} else {
		fmt.Printf("   Found %d opportunities\n", len(arb))
	}

	// 8. Whale Alerts
	fmt.Println("\n🐋 8. Whale Alerts")
	whales, err := client.GetWhaleAlerts(5000000, 5)
	if err != nil {
		fmt.Printf("   Error: %v\n", err)
	} else {
		fmt.Printf("   Found %d whale transactions\n", len(whales))
	}

	fmt.Println("\n" + "=".repeat(60))
	fmt.Println("All Go examples completed!")
	fmt.Println("=".repeat(60))
}

// Helper function for string repeat
func repeatString(s string, count int) string {
	result := ""
	for i := 0; i < count; i++ {
		result += s
	}
	return result
}

func init() {
	// Make = symbol repeat work
}
