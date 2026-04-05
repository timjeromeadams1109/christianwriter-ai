import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        subscriptionTier: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscriptionTier: user.subscriptionTier || 'free',
      subscriptionStatus: user.subscriptionStatus,
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
