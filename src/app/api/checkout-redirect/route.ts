import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getPriceIdForTier, type SubscriptionTier } from '@/lib/stripe/config';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const searchParams = request.nextUrl.searchParams;
    const plan = searchParams.get('plan') as SubscriptionTier | null;

    if (!session?.user?.id) {
      // Not logged in, redirect to sign up
      return NextResponse.redirect(
        new URL(`/sign-up${plan ? `?plan=${plan}&redirect=checkout` : ''}`, request.url)
      );
    }

    if (!plan || plan === 'free' || !['pro', 'ministry'].includes(plan)) {
      // No valid plan, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const priceId = getPriceIdForTier(plan);
    if (!priceId) {
      // Price not configured, redirect to dashboard with error
      return NextResponse.redirect(new URL('/dashboard?error=price_not_configured', request.url));
    }

    // Get or create Stripe customer
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.redirect(new URL('/sign-up', request.url));
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      // Save customer ID to database
      await db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, user.id));
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        tier: plan,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier: plan,
        },
      },
    });

    if (checkoutSession.url) {
      return NextResponse.redirect(checkoutSession.url);
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Checkout redirect error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=checkout_failed', request.url));
  }
}
