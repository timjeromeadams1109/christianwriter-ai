import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { SOCIAL_PROMPT } from '@/lib/ai';
import Anthropic from '@anthropic-ai/sdk';
import { validate, socialSchema } from '@/lib/validation';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = validate(socialSchema, body);
    if ('error' in parsed) return parsed.error;
    const {
      topic,
      scripture,
      platform,
      tone,
      bibleVersion,
      voiceInstructions,
    } = parsed.data;

    const prompt = SOCIAL_PROMPT(
      topic,
      scripture,
      platform,
      tone,
      bibleVersion,
      voiceInstructions
    );

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = await anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
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
