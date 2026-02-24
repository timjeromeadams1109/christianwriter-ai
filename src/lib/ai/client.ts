/**
 * AI Client for ChristianWriter.ai
 *
 * Features:
 * - Claude integration for content generation
 * - Circuit breaker protection (via @stack/core)
 * - Streaming support
 */

import Anthropic from '@anthropic-ai/sdk';
import { createCircuitBreaker } from '@stack/core';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export { anthropic };

// Circuit breaker for Claude API calls
const claudeBreaker = createCircuitBreaker(
  'claude-christianwriter',
  async (
    model: string,
    maxTokens: number,
    temperature: number,
    messages: Anthropic.MessageParam[]
  ) => {
    return anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages,
    });
  },
  {
    timeout: 60000,       // 60s timeout
    errorThreshold: 50,   // Trip after 50% failures
    resetTimeout: 30000,  // Try again after 30s
    volumeThreshold: 3,   // Need 3 requests before tripping
  }
);

/**
 * Generate content with circuit breaker protection
 *
 * If Claude is down:
 * - First few failures: retries
 * - After threshold: circuit opens, fails instantly
 * - After resetTimeout: tries one request to test recovery
 */
export async function generateContent(
  prompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
) {
  const response = await claudeBreaker.fire(
    'claude-sonnet-4-20250514',
    options?.maxTokens ?? 4096,
    options?.temperature ?? 0.7,
    [{ role: 'user', content: prompt }]
  );

  const textContent = response.content.find((block) => block.type === 'text');
  return textContent?.text ?? '';
}

/**
 * Stream content (not protected by circuit breaker - streaming has its own timeout)
 */
export async function* streamContent(
  prompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): AsyncGenerator<string> {
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: options?.maxTokens ?? 4096,
    temperature: options?.temperature ?? 0.7,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}

/**
 * Check if Claude service is healthy
 */
export function isClaudeHealthy(): boolean {
  return claudeBreaker.isHealthy();
}

/**
 * Get circuit breaker stats
 */
export function getClaudeStats() {
  return claudeBreaker.getStats();
}
