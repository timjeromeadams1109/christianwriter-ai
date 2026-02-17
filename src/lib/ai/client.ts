import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export { anthropic };

export async function generateContent(
  prompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
) {
  const response = await anthropic.messages.create({
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

  const textContent = response.content.find((block) => block.type === 'text');
  return textContent?.text ?? '';
}

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
