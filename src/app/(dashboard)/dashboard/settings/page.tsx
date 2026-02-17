'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { Settings, CreditCard, User, Crown, Loader2, ExternalLink, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { TIER_NAMES, TIER_PRICES, type SubscriptionTier } from '@/lib/stripe/config';

interface UserSubscription {
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
}

const tierFeatures: Record<SubscriptionTier, string[]> = {
  free: [
    '5 generations per month',
    'Devotional generator',
    'Basic Scripture integration',
    'PDF export',
  ],
  pro: [
    'Unlimited generations',
    'All content types',
    'Author Voice matching',
    'All Bible versions',
    'PDF & Word export',
    'Priority support',
  ],
  ministry: [
    'Everything in Pro',
    'Up to 5 team members',
    'Shared voice profiles',
    'Team content library',
    'Priority queue',
    'Dedicated support',
  ],
};

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState<SubscriptionTier | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription>({
    subscriptionTier: 'free',
    subscriptionStatus: null,
    stripeCustomerId: null,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in');
      return;
    }

    if (session?.user?.id) {
      fetchSubscription();
    }
  }, [session, status, router]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      alert(error instanceof Error ? error.message : 'Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleUpgrade = async (tier: SubscriptionTier) => {
    setUpgradeLoading(tier);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setUpgradeLoading(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const currentTier = subscription.subscriptionTier || 'free';
  const isActive = subscription.subscriptionStatus === 'active' || currentTier === 'free';

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-accent" />
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>

        {/* Account Section */}
        <Card variant="bordered" className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              <CardTitle>Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-foreground-muted">Email</label>
                <p className="text-foreground font-medium">{session?.user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-foreground-muted">Name</label>
                <p className="text-foreground font-medium">{session?.user?.name || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Section */}
        <Card variant="bordered" className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-accent" />
                <CardTitle>Subscription</CardTitle>
              </div>
              <Badge variant={isActive ? 'accent' : 'default'}>
                {isActive ? 'Active' : subscription.subscriptionStatus || 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="p-4 rounded-lg bg-background-subtle border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {TIER_NAMES[currentTier]} Plan
                    </h3>
                    <p className="text-foreground-muted">
                      ${TIER_PRICES[currentTier]}/month
                    </p>
                  </div>
                  {currentTier !== 'free' && subscription.stripeCustomerId && (
                    <Button
                      variant="outline"
                      onClick={handleManageBilling}
                      disabled={portalLoading}
                    >
                      {portalLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      Manage Billing
                    </Button>
                  )}
                </div>

                <ul className="space-y-2">
                  {tierFeatures[currentTier].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Upgrade Options */}
              {currentTier !== 'ministry' && (
                <div>
                  <h4 className="text-sm font-medium text-foreground-muted mb-3">
                    Upgrade Your Plan
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentTier === 'free' && (
                      <Card variant="bordered" className="p-4">
                        <h5 className="font-semibold text-foreground mb-1">Pro Plan</h5>
                        <p className="text-sm text-foreground-muted mb-3">$19/month</p>
                        <Button
                          variant="primary"
                          fullWidth
                          onClick={() => handleUpgrade('pro')}
                          disabled={upgradeLoading !== null}
                        >
                          {upgradeLoading === 'pro' ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Upgrade to Pro
                        </Button>
                      </Card>
                    )}
                    <Card variant="bordered" className="p-4">
                      <h5 className="font-semibold text-foreground mb-1">Ministry Plan</h5>
                      <p className="text-sm text-foreground-muted mb-3">$49/month</p>
                      <Button
                        variant={currentTier === 'free' ? 'outline' : 'primary'}
                        fullWidth
                        onClick={() => handleUpgrade('ministry')}
                        disabled={upgradeLoading !== null}
                      >
                        {upgradeLoading === 'ministry' ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Upgrade to Ministry
                      </Button>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Billing History Link */}
        {subscription.stripeCustomerId && (
          <Card variant="bordered">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-accent" />
                <CardTitle>Billing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-muted mb-4">
                View your billing history, update payment methods, and download invoices.
              </p>
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Open Billing Portal
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
