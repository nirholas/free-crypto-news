/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/cryptocurrency.cv
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

/**
 * DeFi React Components
 *
 * React components and hooks for DeFi data: yields, stablecoins,
 * protocol health, DEX volumes, and bridges.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';

const BASE_URL = 'https://cryptocurrency.cv';

// ═══════════════════════════════════════════════════════════════
// Custom Hooks
// ═══════════════════════════════════════════════════════════════

function useApi(endpoint, params = {}, refreshInterval = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const queryString = useMemo(() => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });
    return searchParams.toString();
  }, [JSON.stringify(params)]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, queryString]);

  useEffect(() => {
    fetchData();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
}

// ═══════════════════════════════════════════════════════════════
// DeFi Summary Dashboard
// ═══════════════════════════════════════════════════════════════

export function DefiSummary() {
  const { data, loading, error } = useApi('/api/defi/summary');

  if (loading) return <div className="animate-pulse">Loading DeFi summary...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-500 text-sm">Total TVL</h3>
        <p className="text-3xl font-bold">
          ${(data?.totalTvl / 1e9)?.toFixed(2)}B
        </p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-500 text-sm">24h Volume</h3>
        <p className="text-3xl font-bold">
          ${(data?.totalVolume24h / 1e9)?.toFixed(2)}B
        </p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-500 text-sm">Active Protocols</h3>
        <p className="text-3xl font-bold">{data?.protocolCount || '—'}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Protocol Health Monitor
// ═══════════════════════════════════════════════════════════════

export function ProtocolHealthMonitor() {
  const { data, loading, error } = useApi('/api/defi/protocol-health');

  if (loading) return <div className="animate-pulse">Loading protocol health...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const protocols = Array.isArray(data) ? data : data?.protocols || [];

  const riskColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold p-4 border-b">Protocol Health</h2>
      <div className="divide-y">
        {protocols.map((p, i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div>
              <span className="font-semibold">{p.protocol}</span>
              <span className="text-gray-500 ml-2">
                TVL: ${(p.tvl / 1e6)?.toFixed(1)}M
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm">Score: {p.healthScore?.toFixed(0)}/100</div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${riskColor(p.riskLevel)}`}>
                {p.riskLevel}
              </span>
              {p.audited && <span className="text-green-500 text-sm">✓ Audited</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Yield Explorer
// ═══════════════════════════════════════════════════════════════

export function YieldExplorer() {
  const [chain, setChain] = useState('');
  const [stablecoinOnly, setStablecoinOnly] = useState(false);
  const [sortBy, setSortBy] = useState('apy');

  const params = useMemo(() => {
    const p = {};
    if (chain) p.chain = chain;
    if (stablecoinOnly) p.stablecoin = 'true';
    return p;
  }, [chain, stablecoinOnly]);

  const { data, loading, error } = useApi('/api/defi/yields', params);

  const yields = useMemo(() => {
    const items = Array.isArray(data) ? data : data?.yields || [];
    return [...items].sort((a, b) => {
      if (sortBy === 'apy') return (b.apy || 0) - (a.apy || 0);
      if (sortBy === 'tvl') return (b.tvlUsd || 0) - (a.tvlUsd || 0);
      return 0;
    });
  }, [data, sortBy]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex flex-wrap gap-3 items-center">
        <h2 className="text-xl font-bold">DeFi Yields</h2>
        <select
          value={chain}
          onChange={(e) => setChain(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Chains</option>
          <option value="ethereum">Ethereum</option>
          <option value="arbitrum">Arbitrum</option>
          <option value="optimism">Optimism</option>
          <option value="polygon">Polygon</option>
          <option value="bsc">BSC</option>
          <option value="solana">Solana</option>
          <option value="base">Base</option>
        </select>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={stablecoinOnly}
            onChange={(e) => setStablecoinOnly(e.target.checked)}
          />
          Stablecoins only
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="apy">Sort by APY</option>
          <option value="tvl">Sort by TVL</option>
        </select>
      </div>

      {loading && <div className="p-4 animate-pulse">Loading yields...</div>}
      {error && <div className="p-4 text-red-500">Error: {error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm">Pool</th>
              <th className="px-4 py-3 text-left text-sm">Project</th>
              <th className="px-4 py-3 text-left text-sm">Chain</th>
              <th className="px-4 py-3 text-right text-sm">APY</th>
              <th className="px-4 py-3 text-right text-sm">TVL</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {yields.slice(0, 50).map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{item.pool}</td>
                <td className="px-4 py-3 text-gray-600">{item.project}</td>
                <td className="px-4 py-3 text-gray-600">{item.chain}</td>
                <td className="px-4 py-3 text-right text-green-600 font-semibold">
                  {item.apy?.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  ${(item.tvlUsd / 1e6)?.toFixed(1)}M
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Stablecoin Monitor
// ═══════════════════════════════════════════════════════════════

export function StablecoinMonitor() {
  const { data: stablecoins, loading: loadingCoins } = useApi('/api/stablecoins');
  const { data: depeg, loading: loadingDepeg } = useApi(
    '/api/stablecoins/depeg',
    {},
    30000 // Refresh every 30s
  );

  if (loadingCoins || loadingDepeg) {
    return <div className="animate-pulse">Loading stablecoin data...</div>;
  }

  const coins = Array.isArray(stablecoins) ? stablecoins : stablecoins?.data || [];
  const depegAlerts = Array.isArray(depeg) ? depeg : depeg?.data || [];
  const hasDepeg = depegAlerts.some((d) => Math.abs(d.deviation || 0) > 0.005);

  return (
    <div className="space-y-4">
      {hasDepeg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-bold">⚠️ Depeg Alert</h3>
          {depegAlerts
            .filter((d) => Math.abs(d.deviation || 0) > 0.005)
            .map((d, i) => (
              <p key={i} className="text-red-700">
                {d.symbol}: ${d.price?.toFixed(4)} (deviation: {(d.deviation * 100)?.toFixed(2)}%)
              </p>
            ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {coins.slice(0, 8).map((coin, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <div className="font-bold">{coin.symbol}</div>
            <div className="text-2xl">${coin.price?.toFixed(4)}</div>
            <div className="text-gray-500 text-sm">
              MCap: ${(coin.marketCap / 1e9)?.toFixed(1)}B
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DEX Volume Chart
// ═══════════════════════════════════════════════════════════════

export function DexVolumeWidget() {
  const { data, loading, error } = useApi('/api/defi/dex-volumes');

  if (loading) return <div className="animate-pulse">Loading DEX volumes...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const dexes = Array.isArray(data) ? data : data?.dexes || [];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">DEX Volumes (24h)</h2>
      <div className="space-y-3">
        {dexes.slice(0, 10).map((dex, i) => {
          const maxVolume = dexes[0]?.volume24h || 1;
          const widthPercent = ((dex.volume24h || 0) / maxVolume) * 100;
          return (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{dex.dex || dex.name}</span>
                <span className="text-gray-600">
                  ${((dex.volume24h || 0) / 1e6).toFixed(1)}M
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 rounded-full h-2"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Complete DeFi Dashboard
// ═══════════════════════════════════════════════════════════════

export default function DefiDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      <h1 className="text-3xl font-bold">DeFi Dashboard</h1>
      <DefiSummary />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StablecoinMonitor />
        <DexVolumeWidget />
      </div>
      <ProtocolHealthMonitor />
      <YieldExplorer />
    </div>
  );
}
