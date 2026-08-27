/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/cryptocurrency.cv
 */

/**
 * Build identity baked in at image build time (see Dockerfile ARG GIT_SHA and
 * cloudbuild.yaml). Lets `curl https://cryptocurrency.cv/api/version` prove
 * which commit is live instead of guessing from behaviour.
 */
export const BUILD_INFO = {
  commit: process.env.GIT_SHA || process.env.NEXT_PUBLIC_GIT_SHA || 'unknown',
  builtAt: process.env.BUILD_TIME || 'unknown',
  revision: process.env.K_REVISION || null,
  service: process.env.K_SERVICE || null,
  region: process.env.CLOUD_RUN_REGION || null,
  nodeVersion: process.version,
} as const;
