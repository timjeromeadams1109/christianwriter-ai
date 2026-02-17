import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getTierFromPriceId, type SubscriptionTier } from '@/lib/stripe/config';
import Stripe from 'stripe';

// Disable body parsing for webhook signature verification
export const runtime = 'nodejs';

async function updateUserSubscription(
  customerId: string,
  subscriptionId: string | null,
  tier: SubscriptionTier,
  status: string | null
) {
  await db
    .update(users)
    .set({
      stripeSubscriptionId: subscriptionId,
      subscriptionTier: tier,
      subscriptionStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(users.stripeCustomerId, customerId));
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${errorMessage}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription' && session.subscription && session.customer) {
          const subscriptionId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;

          const customerId = typeof session.customer === 'string'
            ? session.customer
            : session.customer.id;

          // Get subscription details to find the tier
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          const tier = priceId ? getTierFromPriceId(priceId) : 'pro';

          await updateUserSubscription(
            customerId,
            subscriptionId,
            tier,
            subscription.status
          );

          console.log(`Checkout completed: Customer ${customerId} subscribed to ${tier}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;

        const priceId = subscription.items.data[0]?.price.id;
        const tier = priceId ? getTierFromPriceId(priceId) : 'free';

        await updateUserSubscription(
          customerId,
          subscription.id,
          tier,
          subscription.status
        );

        console.log(`Subscription updated: Customer ${customerId} now on ${tier} (${subscription.status})`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;

        // Downgrade to free tier
        await updateUserSubscription(
          customerId,
          null,
          'free',
          'canceled'
        );

        console.log(`Subscription deleted: Customer ${customerId} downgraded to free`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id;

        if (customerId) {
          await db
            .update(users)
            .set({
              subscriptionStatus: 'past_due',
              updatedAt: new Date(),
            })
            .where(eq(users.stripeCustomerId, customerId));

          console.log(`Payment failed for customer ${customerId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
