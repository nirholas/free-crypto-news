#!/usr/bin/env node

/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

/**
 * Free Crypto News MCP server (stdio transport).
 *
 * For Claude Desktop, Claude Code, Cursor and any local MCP client:
 *   node /abs/path/cryptocurrency.cv/mcp/index.js
 *
 * Remote clients can skip the install entirely and use the hosted
 * Streamable-HTTP endpoint: https://cryptocurrency.cv/api/mcp
 *
 * Env: API_BASE (default https://cryptocurrency.cv)
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './server.js';

const server = createMcpServer();
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('free-crypto-news MCP server ready on stdio');
