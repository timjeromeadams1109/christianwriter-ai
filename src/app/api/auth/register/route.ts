import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { validate, registerSchema } from '@/lib/validation';
import { registerRatelimit, checkRateLimit } from '@/lib/ratelimit';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      'unknown';

    const rateLimitResponse = await checkRateLimit(registerRatelimit, ip);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const parsed = validate(registerSchema, body);
    if ('error' in parsed) return parsed.error;
    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        hashedPassword,
      })
      .returning();

    return NextResponse.json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
