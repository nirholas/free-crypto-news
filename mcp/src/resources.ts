/**
 * MCP resources: read-only snapshots a client can pull into context without a
 * tool call. Each one reads a single live route through the shared client.
 */

import type { ApiConfig } from './api.js';
import { apiRequest } from './api.js';

export interface ResourceDefinition {
  uri: string;
  name: string;
  title: string;
  description: string;
  mimeType: string;
  path: string;
  query?: Record<string, string>;
}

export const RESOURCES: ReadonlyArray<ResourceDefinition> = [
  {
    uri: 'news://latest',
    name: 'latest-news',
    title: 'Latest news',
    description: 'The 20 most recent crypto headlines across all sources.',
    mimeType: 'application/json',
    path: '/api/news',
    query: { limit: '20' },
  },
  {
    uri: 'news://breaking',
    name: 'breaking-news',
    title: 'Breaking news',
    description: 'Urgent stories from the last few hours.',
    mimeType: 'application/json',
    path: '/api/breaking',
  },
  {
    uri: 'news://trending',
    name: 'trending-topics',
    title: 'Trending topics',
    description: 'Topics trending in the last 24 hours with sentiment.',
    mimeType: 'application/json',
    path: '/api/trending',
    query: { limit: '15', hours: '24' },
  },
  {
    uri: 'market://overview',
    name: 'market-overview',
    title: 'Market overview',
    description: 'Global market cap, volume and dominance.',
    mimeType: 'application/json',
    path: '/api/global',
  },
  {
    uri: 'market://fear-greed',
    name: 'fear-greed',
    title: 'Fear & Greed index',
    description: 'Current Fear & Greed reading with a week of history.',
    mimeType: 'application/json',
    path: '/api/fear-greed',
    query: { days: '7' },
  },
  {
    uri: 'defi://overview',
    name: 'defi-overview',
    title: 'DeFi overview',
    description: 'DeFi TVL summary across protocols and chains.',
    mimeType: 'application/json',
    path: '/api/defi/summary',
  },
];

export async function readResource(config: ApiConfig, resource: ResourceDefinition): Promise<string> {
  const response = await apiRequest(config, { path: resource.path, query: resource.query });
  return response.json === undefined ? response.text : JSON.stringify(response.json, null, 2);
}
