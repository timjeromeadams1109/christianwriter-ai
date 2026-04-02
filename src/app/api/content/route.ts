import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { content } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { validate, contentSaveSchema } from '@/lib/validation';
import type { NewContent } from '@/lib/db/schema';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userContent = await db
      .select()
      .from(content)
      .where(eq(content.userId, session.user.id!))
      .orderBy(desc(content.createdAt));

    return NextResponse.json(userContent);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

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
    const parsed = validate(contentSaveSchema, body);
    if ('error' in parsed) return parsed.error;
    const {
      type,
      title,
      inputParams,
      generatedContent,
      scriptureReferences,
      authorVoiceId,
    } = parsed.data;

    const insertValues: NewContent = {
      userId: session.user.id!,
      type,
      title,
      inputParams,
      generatedContent,
      scriptureReferences,
      authorVoiceId,
      status: 'generated',
    };

    const [newContent] = await db
      .insert(content)
      .values(insertValues)
      .returning();

    return NextResponse.json(newContent);
  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}
