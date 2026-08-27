/**
 * Builds the MCP server shared by the stdio and HTTP entry points: registers
 * every tool, resource and prompt and turns API failures into readable
 * tool errors.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ApiError, clipText, SERVER_NAME, SERVER_VERSION, toText, type ApiConfig } from './api.js';
import { PROMPTS } from './prompts.js';
import { readResource, RESOURCES } from './resources.js';
import { createToolContext, TOOLS } from './tools.js';

function errorText(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message.split('\n')[0] ?? 'Unknown error';
  return String(error);
}

function textResult(text: string, isError = false): CallToolResult {
  return isError ? { content: [{ type: 'text', text: clipText(text) }], isError: true } : { content: [{ type: 'text', text: clipText(text) }] };
}

export function createServer(config: ApiConfig): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      instructions:
        'Free Crypto News: real-time crypto news, market, DeFi, derivatives and on-chain data from cryptocurrency.cv. ' +
        'Tools are read-only and return JSON. Coin ids are CoinGecko ids (bitcoin, ethereum, solana); use search_coins to resolve a ticker. ' +
        'Start with get_latest_news or get_market_overview for broad questions and search_news for specific topics.',
    },
  );
  const ctx = createToolContext(config);

  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.input,
        annotations: { title: tool.title, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
      },
      async (args) => {
        try {
          const result = await tool.run(args as never, ctx);
          return textResult(toText(result));
        } catch (error) {
          return textResult(errorText(error), true);
        }
      },
    );
  }

  for (const resource of RESOURCES) {
    server.registerResource(
      resource.name,
      resource.uri,
      { title: resource.title, description: resource.description, mimeType: resource.mimeType },
      async (uri) => {
        try {
          const text = await readResource(config, resource);
          return { contents: [{ uri: uri.href, mimeType: resource.mimeType, text: clipText(text) }] };
        } catch (error) {
          return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: errorText(error) }] };
        }
      },
    );
  }

  for (const prompt of PROMPTS) {
    server.registerPrompt(
      prompt.name,
      { title: prompt.title, description: prompt.description, argsSchema: prompt.args },
      (args) => ({
        messages: [{ role: 'user', content: { type: 'text', text: prompt.build(args as never) } }],
      }),
    );
  }

  return server;
}
