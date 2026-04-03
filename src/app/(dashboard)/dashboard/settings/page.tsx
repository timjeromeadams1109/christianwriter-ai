'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { Settings, CreditCard, User, Crown, Loader2, ExternalLink, Check, Shield, Copy, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
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

type MFAState = 'idle' | 'loading' | 'setup' | 'backup-codes' | 'confirm-disable';

interface SetupData {
  uri: string;
  secret: string;
}

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

  // MFA state
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaState, setMfaState] = useState<MFAState>('idle');
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [mfaError, setMfaError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in');
      return;
    }

    if (session?.user?.id) {
      fetchSubscription();
      fetchMfaStatus();
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

  const fetchMfaStatus = async () => {
    try {
      const res = await fetch('/api/user/mfa-status');
      if (res.ok) {
        const data = await res.json();
        setMfaEnabled(data.mfaEnabled ?? false);
      }
    } catch {
      // Non-fatal — MFA status defaults to false
    }
  };

  const startMfaSetup = async () => {
    setMfaState('loading');
    setMfaError('');
    const res = await fetch('/api/auth/mfa/setup', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      setMfaError(data.error ?? 'Failed to start MFA setup.');
      setMfaState('idle');
      return;
    }
    setSetupData(data);
    const encoded = encodeURIComponent(data.uri);
    setQrUrl(`https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encoded}`);
    setMfaState('setup');
  };

  const submitVerifySetup = async () => {
    setMfaError('');
    const res = await fetch('/api/auth/mfa/verify-setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: verifyCode.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMfaError(data.error ?? 'Invalid code.');
      return;
    }
    setBackupCodes(data.backupCodes);
    setMfaEnabled(true);
    setMfaState('backup-codes');
    setVerifyCode('');
    setSetupData(null);
  };

  const submitDisable = async () => {
    setMfaError('');
    const res = await fetch('/api/auth/mfa/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: disableCode.trim().toUpperCase() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMfaError(data.error ?? 'Failed to disable MFA.');
      return;
    }
    setMfaEnabled(false);
    setMfaState('idle');
    setDisableCode('');
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* MFA Section */}
        <Card variant="bordered" className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                <CardTitle>Two-Factor Authentication</CardTitle>
              </div>
              {mfaEnabled && (
                <Badge variant="accent">Enabled</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {mfaError && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{mfaError}</p>
              </div>
            )}

            {mfaState === 'idle' && !mfaEnabled && (
              <div>
                <p className="text-foreground-muted text-sm mb-4">
                  Protect your account with a second verification step each time you sign in.
                </p>
                <Button variant="outline" onClick={startMfaSetup}>
                  Set Up Two-Factor Authentication
                </Button>
              </div>
            )}

            {mfaState === 'loading' && (
              <div className="flex items-center gap-2 text-foreground-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Generating secret...</span>
              </div>
            )}

            {mfaState === 'setup' && setupData && (
              <div className="space-y-5">
                <p className="text-foreground-muted text-sm">
                  Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code.
                </p>
                {qrUrl && (
                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-lg inline-block">
                      <Image src={qrUrl} alt="TOTP QR code" width={200} height={200} unoptimized />
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-xs text-foreground-muted mb-1">Or enter manually:</p>
                  <code className="text-xs text-accent bg-background-subtle px-3 py-1 rounded font-mono break-all">
                    {setupData.secret}
                  </code>
                </div>
                <div>
                  <label className="block text-sm text-foreground-muted mb-2">Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-lg bg-background-subtle border border-border text-foreground placeholder-foreground-muted text-center text-2xl tracking-[0.3em] font-mono focus:outline-none focus:border-accent transition-colors"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={submitVerifySetup}
                    disabled={verifyCode.length !== 6}
                    className="flex-1"
                  >
                    Activate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setMfaState('idle'); setMfaError(''); setVerifyCode(''); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {mfaState === 'backup-codes' && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Save these backup codes now. Each code can be used once if you lose access to your authenticator.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((c) => (
                    <code key={c} className="text-sm font-mono text-foreground bg-background-subtle px-3 py-2 rounded text-center border border-border">
                      {c}
                    </code>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={copyBackupCodes}>
                    {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy codes'}
                  </Button>
                  <Button variant="primary" onClick={() => setMfaState('idle')} className="flex-1">
                    Done
                  </Button>
                </div>
              </div>
            )}

            {mfaState === 'idle' && mfaEnabled && (
              <div>
                <p className="text-foreground-muted text-sm mb-4">
                  Two-factor authentication is active on your account.
                </p>
                <Button
                  variant="outline"
                  onClick={() => { setMfaState('confirm-disable'); setMfaError(''); }}
                  className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                >
                  Disable Two-Factor Authentication
                </Button>
              </div>
            )}

            {mfaState === 'confirm-disable' && (
              <div className="space-y-4">
                <p className="text-foreground-muted text-sm">
                  Enter your current authenticator code (or a backup code) to confirm.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\s/g, ''))}
                  placeholder="000000"
                  className="w-full px-4 py-3 rounded-lg bg-background-subtle border border-border text-foreground placeholder-foreground-muted text-center text-xl tracking-[0.2em] font-mono focus:outline-none focus:border-red-500 transition-colors"
                  autoFocus
                />
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={submitDisable}
                    disabled={disableCode.length < 6}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Disable 2FA
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setMfaState('idle'); setDisableCode(''); setMfaError(''); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
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
