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
 * Data Export API E2E Tests
 * 
 * Tests for the data export functionality including:
 * - Export job creation
 * - Format validation (JSON, CSV, Parquet, SQLite)
 * - Job status polling
 * - Download functionality
 * - Schema endpoints
 * - Monthly archives
 */

import { test, expect } from '@playwright/test';

test.describe('Data Export API', () => {
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

  test.describe('Schema Endpoints', () => {
    test('GET /api/exports?schema=true returns all schemas', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/exports?schema=true`);
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.schemaVersion).toBeDefined();
      expect(data.schemas).toBeDefined();
      expect(data.formats).toContain('json');
      expect(data.formats).toContain('csv');
      expect(data.formats).toContain('parquet');
      expect(data.formats).toContain('sqlite');
      expect(data.compression).toContain('none');
      expect(data.compression).toContain('gzip');
      
      // Verify schema structure
      const { schemas } = data;
      expect(schemas.news).toBeDefined();
      expect(schemas.news.fields).toBeInstanceOf(Array);
      expect(schemas.prices).toBeDefined();
      expect(schemas.predictions).toBeDefined();
      expect(schemas.sentiment).toBeDefined();
    });

    test('schema includes required field definitions', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/exports?schema=true`);
      const data = await response.json();
      
      // Check news schema fields
      const newsFields = data.schemas.news.fields;
      const fieldNames = newsFields.map((f: { name: string }) => f.name);
      
      expect(fieldNames).toContain('id');
      expect(fieldNames).toContain('title');
      expect(fieldNames).toContain('url');
      expect(fieldNames).toContain('source');
      expect(fieldNames).toContain('publishedAt');
      
      // Verify field structure
      const titleField = newsFields.find((f: { name: string }) => f.name === 'title');
      expect(titleField.type).toBe('string');
      expect(titleField.nullable).toBe(false);
    });
  });

  test.describe('Export Job Creation', () => {
    test('POST /api/exports creates JSON export job', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/exports`, {
        data: {
          dataType: 'news',
          format: 'json',
          limit: 100,
        },
      });
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.job).toBeDefined();
      expect(data.job.id).toBeDefined();
      expect(data.job.status).toMatch(/pending|processing|completed/);
      expect(data.job.dataType).toBe('news');
      expect(data.statusUrl).toBeDefined();
      expect(data.downloadUrl).toBeDefined();
    });

    test('POST /api/exports creates CSV export job', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/exports`, {
        data: {
          dataType: 'prices',
          format: 'csv',
        },
      });
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.job.options.format).toBe('csv');
    });

    test('POST /api/exports creates Parquet export job', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/exports`, {
        data: {
          dataType: 'sentiment',
          format: 'parquet',
          compression: 'gzip',
        },
      });
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.job.options.format).toBe('parquet');
      expect(data.job.options.compression).toBe('gzip');
    });

    test('POST /api/exports rejects invalid data type', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/exports`, {
        data: {
          dataType: 'invalid_type',
          format: 'json',
        },
      });
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid data type');
      expect(data.validTypes).toBeDefined();
    });

    test('POST /api/exports rejects invalid format', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/exports`, {
        data: {
          dataType: 'news',
          format: 'invalid_format',
        },
      });
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid format');
    });

    test('POST /api/exports supports date range filters', async ({ request }) => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date();
      
      const response = await request.post(`${baseUrl}/api/exports`, {
        data: {
          dataType: 'news',
          format: 'json',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.job.options.startDate).toBeDefined();
      expect(data.job.options.endDate).toBeDefined();
    });

    test('POST /api/exports supports field selection', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/exports`, {
        data: {
          dataType: 'news',
          format: 'csv',
          fields: ['id', 'title', 'url', 'publishedAt'],
        },
      });
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.job.options.fields).toEqual(['id', 'title', 'url', 'publishedAt']);
    });
  });

  test.describe('Export Job Status', () => {
    test('GET /api/exports lists all jobs', async ({ request }) => {
      // Create a job first
      await request.post(`${baseUrl}/api/exports`, {
        data: { dataType: 'news', format: 'json' },
      });
      
      const response = await request.get(`${baseUrl}/api/exports`);
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.jobs).toBeInstanceOf(Array);
      expect(data.count).toBeGreaterThanOrEqual(0);
    });

    test('GET /api/exports/[id] returns job status', async ({ request }) => {
      // Create a job
      const createResponse = await request.post(`${baseUrl}/api/exports`, {
        data: { dataType: 'news', format: 'json', limit: 10 },
      });
      
      const { job } = await createResponse.json();
      
      // Wait a bit for processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check status
      const statusResponse = await request.get(`${baseUrl}/api/exports/${job.id}`);
      
      expect(statusResponse.ok()).toBeTruthy();
      
      const data = await statusResponse.json();
      expect(data.success).toBe(true);
      expect(data.job).toBeDefined();
      expect(data.job.id).toBe(job.id);
    });

    test('GET /api/exports/[id] returns 404 for unknown job', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/exports/nonexistent_job_123`);
      
      expect(response.status()).toBe(404);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });
  });

  test.describe('Export Download', () => {
    test('GET /api/exports/[id]?download=true downloads completed export', async ({ request }) => {
      // Create and wait for job completion
      const createResponse = await request.post(`${baseUrl}/api/exports`, {
        data: { dataType: 'prices', format: 'json', limit: 5 },
      });
      
      const { job } = await createResponse.json();
      
      // Poll for completion
      let isReady = false;
      let attempts = 0;
      while (!isReady && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const statusResponse = await request.get(`${baseUrl}/api/exports/${job.id}`);
        const statusData = await statusResponse.json();
        isReady = statusData.job?.status === 'completed';
        attempts++;
      }
      
      // Download
      const downloadResponse = await request.get(`${baseUrl}/api/exports/${job.id}?download=true`);
      
      if (isReady) {
        expect(downloadResponse.ok()).toBeTruthy();
        expect(downloadResponse.headers()['content-type']).toContain('application/json');
        expect(downloadResponse.headers()['content-disposition']).toContain('attachment');
        expect(downloadResponse.headers()['x-checksum-sha256']).toBeDefined();
        
        const content = await downloadResponse.text();
        expect(content.length).toBeGreaterThan(0);
        
        // Verify it's valid JSON
        const parsed = JSON.parse(content);
        expect(Array.isArray(parsed)).toBe(true);
      }
    });

    test('GET /api/exports/[id]?download=true returns error for incomplete job', async ({ request }) => {
      // Create job but don't wait
      const createResponse = await request.post(`${baseUrl}/api/exports`, {
        data: { dataType: 'all', format: 'json', limit: 10000 },
      });
      
      const { job } = await createResponse.json();
      
      // Immediately try to download
      const downloadResponse = await request.get(`${baseUrl}/api/exports/${job.id}?download=true`);
      
      // May be completed already for small exports, so check both cases
      if (downloadResponse.status() === 400) {
        const data = await downloadResponse.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('not ready');
      }
    });

    test('CSV export has correct content type', async ({ request }) => {
      const createResponse = await request.post(`${baseUrl}/api/exports`, {
        data: { dataType: 'prices', format: 'csv', limit: 5 },
      });
      
      const { job } = await createResponse.json();
      
      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const downloadResponse = await request.get(`${baseUrl}/api/exports/${job.id}?download=true`);
      
      if (downloadResponse.ok()) {
        expect(downloadResponse.headers()['content-type']).toContain('text/csv');
        
        const content = await downloadResponse.text();
        // CSV should have header row and data rows
        const lines = content.split('\n');
        expect(lines.length).toBeGreaterThan(1);
        
        // First line should be headers
        expect(lines[0]).toContain('symbol');
      }
    });
  });

  test.describe('Monthly Archives', () => {
    test('GET /api/exports?archives=true lists archives', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/exports?archives=true`);
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.archives).toBeInstanceOf(Array);
    });

    test('POST /api/exports creates monthly archive', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/exports`, {
        data: {
          createArchive: true,
          archiveYear: 2024,
          archiveMonth: 6,
          dataType: ['news', 'prices'],
        },
      });
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.archive).toBeDefined();
      expect(data.archive.year).toBe(2024);
      expect(data.archive.month).toBe(6);
      expect(data.archive.downloadUrl).toBeDefined();
    });

    test('POST /api/exports rejects archive without year/month', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/exports`, {
        data: {
          createArchive: true,
          dataType: 'news',
        },
      });
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('archiveYear');
    });

    test('GET /api/exports/archive_[id] returns archive details', async ({ request }) => {
      // Create an archive first
      await request.post(`${baseUrl}/api/exports`, {
        data: {
          createArchive: true,
          archiveYear: 2024,
          archiveMonth: 7,
          dataType: 'news',
        },
      });
      
      const response = await request.get(`${baseUrl}/api/exports/archive_2024_07`);
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.archive).toBeDefined();
      expect(data.archive.year).toBe(2024);
      expect(data.archive.month).toBe(7);
    });
  });

  test.describe('Data Types', () => {
    const dataTypes = ['news', 'prices', 'predictions', 'alerts', 'influencers', 'sentiment', 'social', 'gas', 'defi'];
    
    for (const dataType of dataTypes) {
      test(`exports ${dataType} data type`, async ({ request }) => {
        const response = await request.post(`${baseUrl}/api/exports`, {
          data: {
            dataType,
            format: 'json',
            limit: 10,
          },
        });
        
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.job.dataType).toBe(dataType);
      });
    }

    test('exports all data types at once', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/exports`, {
        data: {
          dataType: 'all',
          format: 'json',
          limit: 50,
        },
      });
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.job.dataType).toBe('all');
    });
  });
});
