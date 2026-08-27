/**
 * HTTP client for the cryptocurrency.cv REST API.
 *
 * One place owns the base URL, the optional API key, the 10 s timeout, the
 * single retry on 5xx / 429 / network failure, and the translation of every
 * failure into a short human-readable sentence. Tool handlers never see a
 * stack trace and never leak one to the model.
 */

export const DEFAULT_API_BASE = 'https://cryptocurrency.cv';
export const DEFAULT_TIMEOUT_MS = 10_000;
export const SERVER_NAME = 'free-crypto-news';
export const SERVER_VERSION = '4.0.0';
export const USER_AGENT = `free-crypto-news-mcp/${SERVER_VERSION} (+https://cryptocurrency.cv)`;

/** Tool output is capped so a single call cannot flood the model's context. */
export const MAX_RESULT_CHARS = 60_000;

export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeoutMs: number;
}

export function configFromEnv(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const rawBase = env.CRYPTO_NEWS_API_BASE?.trim() || DEFAULT_API_BASE;
  const baseUrl = rawBase.replace(/\/+$/, '');
  const apiKey = env.CRYPTO_NEWS_API_KEY?.trim() || undefined;
  const timeoutRaw = Number.parseInt(env.CRYPTO_NEWS_TIMEOUT_MS ?? '', 10);
  const timeoutMs = Number.isFinite(timeoutRaw) && timeoutRaw > 0 ? timeoutRaw : DEFAULT_TIMEOUT_MS;
  return { baseUrl, apiKey, timeoutMs };
}

export type QueryValue = string | number | boolean | undefined | null;

export interface ApiRequest {
  path: string;
  method?: 'GET' | 'POST';
  query?: Record<string, QueryValue>;
  body?: unknown;
  /** Accept header; defaults to JSON. RSS tools ask for XML. */
  accept?: string;
}

export interface ApiResponse {
  status: number;
  url: string;
  contentType: string;
  text: string;
  /** Parsed body when the response was JSON. */
  json?: unknown;
}

/** A failed API call, already reduced to a sentence safe to show a model. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | undefined,
    public readonly url: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function buildUrl(config: ApiConfig, path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(path.startsWith('/') ? path : `/${path}`, `${config.baseUrl}/`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function headersFor(config: ApiConfig, request: ApiRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': USER_AGENT,
    Accept: request.accept ?? 'application/json',
  };
  if (request.body !== undefined) headers['Content-Type'] = 'application/json';
  if (config.apiKey) {
    headers['X-API-Key'] = config.apiKey;
    headers.Authorization = `Bearer ${config.apiKey}`;
  }
  return headers;
}

function describeBody(parsed: unknown, text: string): string | undefined {
  if (parsed && typeof parsed === 'object') {
    const record = parsed as Record<string, unknown>;
    const parts: string[] = [];
    for (const key of ['error', 'message', 'detail']) {
      const value = record[key];
      if (typeof value === 'string' && value && !parts.includes(value)) parts.push(value);
    }
    if (typeof record.code === 'string') parts.push(`code ${record.code}`);
    const retryAfter = record.retryAfter;
    if (typeof retryAfter === 'number') parts.push(`retry after ${retryAfter}s`);
    if (parts.length > 0) return parts.join('; ');
  }
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed || trimmed.startsWith('<')) return undefined;
  return trimmed.slice(0, 200);
}

function describePayment(parsed: unknown, url: string): string {
  const record = (parsed && typeof parsed === 'object' ? parsed : {}) as {
    accepts?: Array<{ amount?: string; network?: string; extra?: { name?: string } }>;
    resource?: { description?: string };
  };
  const offer = record.accepts?.[0];
  let price: string | undefined;
  if (offer?.amount && /^\d+$/.test(offer.amount)) {
    const dollars = Number(offer.amount) / 1_000_000;
    price = `$${dollars.toFixed(dollars < 0.01 ? 3 : 2)} ${offer.extra?.name ?? 'USDC'}${offer.network ? ` on ${offer.network}` : ''}`;
  }
  const what = record.resource?.description ? ` (${record.resource.description})` : '';
  return (
    `Payment required for ${url}${what}: this endpoint is paid via x402` +
    (price ? ` at ${price} per request` : '') +
    '. Set CRYPTO_NEWS_API_KEY to a key from https://cryptocurrency.cv/api/keys or call it with an x402-capable client.'
  );
}

function failureMessage(request: ApiRequest, response: ApiResponse): string {
  const label = `${request.method ?? 'GET'} ${request.path}`;
  if (response.status === 402) return describePayment(response.json, response.url);
  const detail = describeBody(response.json, response.text);
  const hint =
    response.status === 429
      ? ' The API rate limit for this client was hit; wait and retry, or set CRYPTO_NEWS_API_KEY for a higher quota.'
      : response.status === 401 || response.status === 403
        ? ' Check CRYPTO_NEWS_API_KEY if the endpoint needs a key.'
        : response.status === 404
          ? ' The resource was not found; check the id, slug or coin id.'
          : '';
  return `${label} returned HTTP ${response.status}${detail ? `: ${detail}` : ''}.${hint}`;
}

function shouldRetry(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

async function attempt(config: ApiConfig, request: ApiRequest): Promise<ApiResponse> {
  const url = buildUrl(config, request.path, request.query);
  const response = await fetch(url, {
    method: request.method ?? 'GET',
    headers: headersFor(config, request),
    body: request.body === undefined ? undefined : JSON.stringify(request.body),
    signal: AbortSignal.timeout(config.timeoutMs),
    redirect: 'follow',
  });
  const text = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  let json: unknown;
  if (text && (contentType.includes('json') || /^[\s]*[[{]/.test(text))) {
    try {
      json = JSON.parse(text);
    } catch {
      json = undefined;
    }
  }
  return { status: response.status, url, contentType, text, json };
}

function networkMessage(request: ApiRequest, error: unknown, url: string): string {
  const label = `${request.method ?? 'GET'} ${request.path}`;
  const name = error instanceof Error ? error.name : '';
  if (name === 'TimeoutError' || name === 'AbortError') {
    return `${label} timed out after ${Math.round(DEFAULT_TIMEOUT_MS / 1000)}s (${url}). The API may be slow; retry with a smaller limit.`;
  }
  const cause = error instanceof Error ? error.message : String(error);
  return `${label} could not reach ${url}: ${cause.replace(/\s+/g, ' ').slice(0, 160)}. Check CRYPTO_NEWS_API_BASE and your network.`;
}

const RETRY_DELAY_MS = 750;

/**
 * Performs one API call with a single retry on 5xx, 429 or a network/timeout
 * failure. Resolves with the response for 2xx; rejects with ApiError otherwise.
 */
export async function apiRequest(config: ApiConfig, request: ApiRequest): Promise<ApiResponse> {
  const url = buildUrl(config, request.path, request.query);
  let lastError: unknown;
  let lastResponse: ApiResponse | undefined;
  for (let attemptNo = 0; attemptNo < 2; attemptNo += 1) {
    if (attemptNo > 0) await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    try {
      const response = await attempt(config, request);
      if (response.status >= 200 && response.status < 300) return response;
      lastResponse = response;
      if (!shouldRetry(response.status)) break;
    } catch (error) {
      lastError = error;
    }
  }
  if (lastResponse) throw new ApiError(failureMessage(request, lastResponse), lastResponse.status, url);
  throw new ApiError(networkMessage(request, lastError, url), undefined, url);
}

/** Convenience: JSON-decode a successful response or explain why it was not JSON. */
export async function apiJson(config: ApiConfig, request: ApiRequest): Promise<unknown> {
  const response = await apiRequest(config, request);
  if (response.json !== undefined) return response.json;
  throw new ApiError(
    `${request.method ?? 'GET'} ${request.path} returned a non-JSON body (${response.contentType || 'unknown content type'}).`,
    response.status,
    response.url,
  );
}

export function clipText(text: string): string {
  if (text.length <= MAX_RESULT_CHARS) return text;
  const dropped = text.length - MAX_RESULT_CHARS;
  return `${text.slice(0, MAX_RESULT_CHARS)}\n\n[truncated ${dropped} characters; narrow the request with a smaller limit or more filters]`;
}

export function toText(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}
