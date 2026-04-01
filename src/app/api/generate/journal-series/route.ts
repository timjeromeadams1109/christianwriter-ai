import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';
import { validate, journalSeriesSchema } from '@/lib/validation';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const JOURNAL_SERIES_PROMPT = (params: {
  mode: 'devotional' | 'journal';
  duration: number;
  topic: string;
  description?: string;
  tone: string;
  audience: string;
  bibleVersion: string;
  includePrayer: boolean;
  includeReflection: boolean;
}) => `You are a Christian writing assistant creating a ${params.duration}-day ${params.mode === 'devotional' ? 'devotional series' : 'prayer journal'}.

## Theological Guidelines
- All content must be grounded in Scripture
- Affirm core Christian doctrine (Trinity, deity of Christ, salvation by grace)
- Write with pastoral sensitivity and compassion
- Generate OUTLINES that humans will expand, not final polished content

## Series Parameters
**Type**: ${params.mode === 'devotional' ? 'Devotional Series' : 'Prayer Journal'}
**Duration**: ${params.duration} days
**Topic/Theme**: ${params.topic}
${params.description ? `**Description**: ${params.description}` : ''}
**Tone**: ${params.tone}
**Target Audience**: ${params.audience}
**Bible Version**: ${params.bibleVersion}

## CRITICAL FORMAT REQUIREMENTS

1. **Use "Day 1", "Day 2", "Day 3" format - NEVER use "Chapter" or other numbering**
2. **Introduction and Conclusion are OUTSIDE the day numbering**
3. Each day entry MUST follow this exact structure:

---

## Introduction
[Overview of the series theme, how to use this ${params.mode}, and what readers will gain]

---

## Day 1: [Title]

### Scripture
[Full scripture passage from ${params.bibleVersion}]

### Teaching
[2-3 full paragraphs of teaching/exposition - not bullet points, but flowing prose that unpacks the Scripture and connects it to the theme]

### Application
[Specific, practical ways to apply this teaching today - 2-3 concrete actions or mindset shifts]

${params.includePrayer ? `### Prayer
[A sample prayer related to the day's teaching that readers can pray or use as a starting point]` : ''}

${params.includeReflection ? `### Reflection
[1-2 thoughtful questions for personal reflection or journaling]` : ''}

---

## Day 2: [Title]
[Same structure as Day 1]

---

[Continue for all ${params.duration} days]

---

## Conclusion
[Reflection on the journey completed, encouragement for continued growth, and suggested next steps]

---

## IMPORTANT NOTES:
- Each day should build on previous days while being able to stand alone
- Vary the Scripture passages to cover different aspects of the theme
- Teaching sections should be FULL PARAGRAPHS, not bullet points
- Make the content practical and relatable to daily life
- For a ${params.duration}-day series, provide substantive content for EVERY day

Now generate the complete ${params.duration}-day ${params.mode} series on "${params.topic}":`;

export async function POST(request: Request) {
  try {
    // Skip auth check if no database configured
    if (process.env.DATABASE_URL) {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    const parsed = validate(journalSeriesSchema, body);
    if ('error' in parsed) return parsed.error;
    const {
      mode,
      duration,
      topic,
      description,
      tone,
      audience,
      bibleVersion,
      includePrayer,
      includeReflection,
    } = parsed.data;

    const prompt = JOURNAL_SERIES_PROMPT({
      mode,
      duration,
      topic,
      description,
      tone,
      audience,
      bibleVersion,
      includePrayer,
      includeReflection,
    });

    // Calculate max tokens based on duration
    // Each day needs roughly 500-800 tokens, plus intro/conclusion
    const maxTokens = Math.min(duration * 800 + 1500, 8192);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = await anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: maxTokens,
            temperature: 0.7,
            messages: [{ role: 'user', content: prompt }],
          });

          for await (const event of messageStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
