import { z } from 'zod';
import { NextResponse } from 'next/server';

export function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): { data: z.infer<S> } | { error: NextResponse } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { error: NextResponse.json({ error: 'Invalid request', details: result.error.flatten().fieldErrors }, { status: 400 }) };
  }
  return { data: result.data as z.infer<S> };
}

// POST /api/auth/register
export const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/content
export const contentSaveSchema = z.object({
  type: z.enum(['devotional', 'sermon', 'social']),
  title: z.string().min(1),
  inputParams: z.record(z.unknown()).optional(),
  generatedContent: z.string().optional(),
  scriptureReferences: z.array(z.object({
    reference: z.string(),
    text: z.string(),
    version: z.string(),
  })).optional(),
  authorVoiceId: z.string().optional(),
});

// POST /api/checkout
export const checkoutSchema = z.object({
  tier: z.string().min(1),
});

// POST /api/author-voice/analyze
export const voiceAnalyzeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sampleText: z.string().min(500, 'Sample text should be at least 500 characters for accurate analysis'),
});

// POST /api/generate/sermon
export const sermonSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  scripture: z.string().min(1, 'Scripture is required'),
  style: z.string().default('expository'),
  audience: z.string().default('general'),
  bibleVersion: z.string().default('NIV'),
  voiceInstructions: z.string().optional(),
});

// POST /api/generate/devotional
export const devotionalSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  scripture: z.string().min(1, 'Scripture is required'),
  tone: z.string().default('encouraging'),
  audience: z.string().default('general'),
  bibleVersion: z.string().default('NIV'),
  voiceInstructions: z.string().optional(),
});

// POST /api/generate/journal-series
export const journalSeriesSchema = z.object({
  mode: z.enum(['devotional', 'journal']).default('devotional'),
  duration: z.number().min(1).default(7),
  topic: z.string().min(1, 'Topic is required'),
  description: z.string().optional(),
  tone: z.string().default('encouraging'),
  audience: z.string().default('general'),
  bibleVersion: z.string().default('NIV'),
  includePrayer: z.boolean().default(true),
  includeReflection: z.boolean().default(true),
});

// POST /api/generate/social
export const socialSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  scripture: z.string().optional(),
  platform: z.string().default('twitter'),
  tone: z.string().default('encouraging'),
  bibleVersion: z.string().default('NIV'),
  voiceInstructions: z.string().optional(),
});
