import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { authorVoiceProfiles } from '@/lib/db/schema';
import Anthropic from '@anthropic-ai/sdk';
import { validate, voiceAnalyzeSchema } from '@/lib/validation';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const VOICE_ANALYSIS_PROMPT = `Analyze the following writing sample and extract the author's unique voice characteristics. Provide a structured analysis that can be used to generate content matching this style.

## Writing Sample:
{SAMPLE_TEXT}

## Required Analysis:

Provide your analysis in the following JSON format:
{
  "tone": ["list of tone descriptors, e.g., warm, authoritative, conversational"],
  "style": ["list of style characteristics, e.g., uses short sentences, includes personal anecdotes"],
  "vocabulary": ["notable vocabulary patterns, e.g., uses academic terms, prefers simple words"],
  "sentenceStructure": "description of typical sentence patterns",
  "rhetoricalDevices": ["commonly used devices, e.g., rhetorical questions, metaphors, triads"],
  "summary": "A 2-3 sentence summary of how to write in this voice"
}

Return ONLY the JSON object, no additional text.`;

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
    const parsed = validate(voiceAnalyzeSchema, body);
    if ('error' in parsed) return parsed.error;
    const { name, sampleText } = parsed.data;

    // Analyze the writing sample
    const prompt = VOICE_ANALYSIS_PROMPT.replace('{SAMPLE_TEXT}', sampleText);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Parse the JSON response
    let voiceCharacteristics;
    try {
      voiceCharacteristics = JSON.parse(textContent.text);
    } catch {
      throw new Error('Failed to parse voice analysis');
    }

    // Save to database
    const [profile] = await db
      .insert(authorVoiceProfiles)
      .values({
        userId: session.user.id!,
        name,
        sampleText,
        voiceCharacteristics,
      })
      .returning();

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Voice analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze voice' },
      { status: 500 }
    );
  }
}
