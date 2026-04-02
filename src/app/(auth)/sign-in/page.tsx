'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Badge } from '@/components/ui';
import { Chrome, Crown } from 'lucide-react';
import { TIER_NAMES, type SubscriptionTier } from '@/lib/stripe/config';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get plan from URL params
  const planParam = searchParams.get('plan') as SubscriptionTier | null;
  const redirectParam = searchParams.get('redirect');
  const selectedPlan = planParam && ['pro', 'ministry'].includes(planParam) ? planParam : null;

  const handleCheckout = async (tier: SubscriptionTier) => {
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
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (redirectParam === 'checkout' && selectedPlan) {
        // Redirect to checkout with selected plan
        await handleCheckout(selectedPlan);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Preserve plan and redirect in callback URL
    let callbackUrl = '/dashboard';
    if (redirectParam === 'checkout' && selectedPlan) {
      callbackUrl = `/api/checkout-redirect?plan=${selectedPlan}`;
    }
    signIn('google', { callbackUrl });
  };

  return (
    <Card variant="bordered" className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in to continue to ChristianWriter.ai</CardDescription>

        {/* Show selected plan */}
        {selectedPlan && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Crown className="h-4 w-4 text-accent" />
            <span className="text-sm text-foreground-muted">
              Continue to{' '}
              <Badge variant="accent">{TIER_NAMES[selectedPlan]}</Badge>{' '}
              checkout
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Google Sign In */}
        <Button
          variant="outline"
          fullWidth
          onClick={handleGoogleSignIn}
          className="mb-6"
        >
          <Chrome className="h-5 w-5 mr-2" />
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background-card px-2 text-foreground-muted">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            {selectedPlan ? 'Sign In & Continue to Payment' : 'Sign In'}
          </Button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-foreground-muted">
          Don&apos;t have an account?{' '}
          <Link
            href={selectedPlan ? `/sign-up?plan=${selectedPlan}&redirect=checkout` : '/sign-up'}
            className="text-accent hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <Card variant="bordered" className="w-full max-w-md">
        <CardContent className="py-12 text-center text-foreground-muted">
          Loading...
        </CardContent>
      </Card>
    }>
      <SignInForm />
    </Suspense>
  );
}
