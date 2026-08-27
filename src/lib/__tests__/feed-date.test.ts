/**
 * Feed date parsing tests.
 *
 * A feed date that fails to parse used to become "now", which put undated or
 * oddly-formatted items at the top of /api/news ahead of real breaking news and
 * moved them back to the top on every refresh.
 */

import { describe, it, expect } from 'vitest';
import { parseFeedDate } from '@/lib/crypto-news';

describe('parseFeedDate', () => {
  it('parses RFC 822, the format most feeds use', () => {
    expect(parseFeedDate('Thu, 27 Aug 2026 10:00:00 GMT')?.toISOString()).toBe(
      '2026-08-27T10:00:00.000Z',
    );
  });

  it('parses ISO 8601', () => {
    expect(parseFeedDate('2026-08-27T10:00:00Z')?.toISOString()).toBe('2026-08-27T10:00:00.000Z');
  });

  it("parses Drupal's long form, which plain Date() rejects", () => {
    // The UK FCA feed emits exactly this.
    expect(new Date('Thursday, August 27, 2026 - 10:00').getTime()).toBeNaN();
    expect(parseFeedDate('Thursday, August 27, 2026 - 10:00')?.toISOString()).toBe(
      '2026-08-27T10:00:00.000Z',
    );
  });

  it('tolerates surrounding and internal whitespace', () => {
    expect(parseFeedDate('\n  Thursday, August 27, 2026 - 10:00  \n')?.toISOString()).toBe(
      '2026-08-27T10:00:00.000Z',
    );
  });

  it('unwraps a CDATA-wrapped date', () => {
    // The Federal Reserve feed emits exactly this.
    const wrapped = '<![CDATA[Tue, 25 Aug 2026 18:00:00 GMT]]>';
    expect(new Date(wrapped).getTime()).toBeNaN();
    expect(parseFeedDate(wrapped)?.toISOString()).toBe('2026-08-25T18:00:00.000Z');
  });

  it('returns null rather than a wrong date for unusable input', () => {
    for (const value of ['', '   ', 'not a date', 'yesterday', null, undefined]) {
      expect(parseFeedDate(value)).toBeNull();
    }
  });

  it('never returns an Invalid Date', () => {
    for (const value of ['Thu, 27 Aug 2026 10:00:00 GMT', 'Thursday, August 27, 2026 - 10:00']) {
      const parsed = parseFeedDate(value);
      expect(parsed).not.toBeNull();
      expect(Number.isNaN(parsed!.getTime())).toBe(false);
    }
  });
});
