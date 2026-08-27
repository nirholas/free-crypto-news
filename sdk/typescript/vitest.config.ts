/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
