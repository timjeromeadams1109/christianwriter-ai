import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Fails open: if Redis is unavailable, requests are allowed through.
// This prevents a Redis outage from locking users out of auth.
function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedisClient();

// 5 attempts per minute per IP — credentials login
export const loginRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      prefix: 'rl:login',
    })
  : null;

// MFA verify: 10 attempts per 15 minutes per user — prevents brute-force of 6-digit codes
export const mfaRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '15 m'),
      prefix: 'rl:mfa',
    })
  : null;

// 10 attempts per hour per IP — new account registration
export const registerRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      prefix: 'rl:register',
    })
  : null;

/**
 * Checks the given ratelimit for the provided identifier.
 * Returns a 429 NextResponse with Retry-After header if the limit is exceeded,
 * or null if the request is allowed (including when Redis is unavailable).
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<NextResponse | null> {
  if (!limiter) return null;

  try {
    const { success, reset } = await limiter.limit(identifier);
    if (!success) {
      const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSeconds),
          },
        }
      );
    }
  } catch (err) {
    // Fails open — log but do not block the request
    console.error('[ratelimit] Redis check failed, failing open:', err);
  }

  return null;
}
