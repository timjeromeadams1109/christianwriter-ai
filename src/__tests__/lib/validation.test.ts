/**
 * Tests for Zod validation schemas in src/lib/validation.ts
 * These are pure unit tests — no mocks required.
 */

import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  contentSaveSchema,
  checkoutSchema,
  voiceAnalyzeSchema,
  sermonSchema,
  devotionalSchema,
  journalSeriesSchema,
  socialSchema,
} from '@/lib/validation';

describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({ email: 'user@example.com', password: 'secret123' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({ email: 'not-an-email', password: 'secret123' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = registerSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = registerSchema.safeParse({ password: 'secret123' });
    expect(result.success).toBe(false);
  });

  it('accepts optional name', () => {
    const result = registerSchema.safeParse({ name: 'Tim', email: 'user@example.com', password: 'pass' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Tim');
  });
});

describe('sermonSchema', () => {
  const valid = { topic: 'Grace', scripture: 'John 3:16' };

  it('accepts valid sermon input', () => {
    expect(sermonSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty topic', () => {
    expect(sermonSchema.safeParse({ ...valid, topic: '' }).success).toBe(false);
  });

  it('rejects empty scripture', () => {
    expect(sermonSchema.safeParse({ ...valid, scripture: '' }).success).toBe(false);
  });

  it('applies defaults for optional fields', () => {
    const result = sermonSchema.safeParse(valid);
    if (result.success) {
      expect(result.data.style).toBe('expository');
      expect(result.data.audience).toBe('general');
      expect(result.data.bibleVersion).toBe('NIV');
    }
  });

  it('rejects missing topic', () => {
    expect(sermonSchema.safeParse({ scripture: 'John 3:16' }).success).toBe(false);
  });
});

describe('devotionalSchema', () => {
  const valid = { topic: 'Faith', scripture: 'Hebrews 11:1' };

  it('accepts valid devotional input', () => {
    expect(devotionalSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty topic', () => {
    expect(devotionalSchema.safeParse({ ...valid, topic: '' }).success).toBe(false);
  });

  it('applies defaults', () => {
    const result = devotionalSchema.safeParse(valid);
    if (result.success) {
      expect(result.data.tone).toBe('encouraging');
      expect(result.data.bibleVersion).toBe('NIV');
    }
  });
});

describe('journalSeriesSchema', () => {
  const valid = { topic: 'Prayer', duration: 7 };

  it('accepts valid journal series input', () => {
    expect(journalSeriesSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects duration less than 1', () => {
    expect(journalSeriesSchema.safeParse({ ...valid, duration: 0 }).success).toBe(false);
  });

  it('rejects empty topic', () => {
    expect(journalSeriesSchema.safeParse({ ...valid, topic: '' }).success).toBe(false);
  });

  it('rejects invalid mode', () => {
    expect(journalSeriesSchema.safeParse({ ...valid, mode: 'invalid' }).success).toBe(false);
  });

  it('accepts both valid modes', () => {
    expect(journalSeriesSchema.safeParse({ ...valid, mode: 'devotional' }).success).toBe(true);
    expect(journalSeriesSchema.safeParse({ ...valid, mode: 'journal' }).success).toBe(true);
  });
});

describe('socialSchema', () => {
  it('accepts valid social input', () => {
    expect(socialSchema.safeParse({ topic: 'Hope' }).success).toBe(true);
  });

  it('rejects empty topic', () => {
    expect(socialSchema.safeParse({ topic: '' }).success).toBe(false);
  });

  it('applies platform default', () => {
    const result = socialSchema.safeParse({ topic: 'Hope' });
    if (result.success) expect(result.data.platform).toBe('twitter');
  });
});

describe('voiceAnalyzeSchema', () => {
  it('rejects sample text under 500 chars', () => {
    const result = voiceAnalyzeSchema.safeParse({ name: 'My Voice', sampleText: 'Too short' });
    expect(result.success).toBe(false);
  });

  it('accepts sample text of exactly 500 chars', () => {
    const result = voiceAnalyzeSchema.safeParse({
      name: 'My Voice',
      sampleText: 'A'.repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = voiceAnalyzeSchema.safeParse({ name: '', sampleText: 'A'.repeat(500) });
    expect(result.success).toBe(false);
  });
});

describe('checkoutSchema', () => {
  it('accepts valid tier', () => {
    expect(checkoutSchema.safeParse({ tier: 'pro' }).success).toBe(true);
  });

  it('rejects empty tier', () => {
    expect(checkoutSchema.safeParse({ tier: '' }).success).toBe(false);
  });

  it('rejects missing tier', () => {
    expect(checkoutSchema.safeParse({}).success).toBe(false);
  });
});

describe('contentSaveSchema', () => {
  const valid = { type: 'sermon' as const, title: 'Sunday Message' };

  it('accepts valid content', () => {
    expect(contentSaveSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid content type', () => {
    expect(contentSaveSchema.safeParse({ ...valid, type: 'blog' }).success).toBe(false);
  });

  it('rejects empty title', () => {
    expect(contentSaveSchema.safeParse({ ...valid, title: '' }).success).toBe(false);
  });

  it('accepts all valid content types', () => {
    for (const type of ['devotional', 'sermon', 'social'] as const) {
      expect(contentSaveSchema.safeParse({ type, title: 'Test' }).success).toBe(true);
    }
  });
});
