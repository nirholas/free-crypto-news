#!/usr/bin/env node
/**
 * Free Crypto News MCP server, stdio transport.
 *
 * This is what Claude Desktop, Claude Code, Cursor, Windsurf and every other
 * local MCP client launch. Logs go to stderr only; stdout is the protocol.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { configFromEnv } from './api.js';
import { createServer } from './server.js';
import { TOOLS } from './tools.js';

const config = configFromEnv();
const server = createServer(config);
const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`free-crypto-news MCP ready on stdio: ${TOOLS.length} tools, API ${config.baseUrl}`);
