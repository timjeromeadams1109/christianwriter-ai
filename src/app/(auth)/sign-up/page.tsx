'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Badge } from '@/components/ui';
import { Chrome, Crown } from 'lucide-react';
import { TIER_NAMES, type SubscriptionTier } from '@/lib/stripe/config';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      // If checkout fails, just go to dashboard
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
      } else {
        // Auto sign in after registration
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          router.push('/sign-in');
        } else if (redirectParam === 'checkout' && selectedPlan) {
          // Redirect to checkout with selected plan
          await handleCheckout(selectedPlan);
        } else {
          router.push('/dashboard');
        }
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
        <CardTitle className="text-2xl">Create Your Account</CardTitle>
        <CardDescription>Start creating with ChristianWriter.ai</CardDescription>

        {/* Show selected plan */}
        {selectedPlan && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Crown className="h-4 w-4 text-accent" />
            <span className="text-sm text-foreground-muted">
              Signing up for the{' '}
              <Badge variant="accent">{TIER_NAMES[selectedPlan]}</Badge>{' '}
              plan
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            type="text"
            placeholder="John Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="Must be at least 8 characters"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            {selectedPlan ? `Create Account & Continue to Payment` : 'Create Account'}
          </Button>
        </form>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-sm text-foreground-muted">
          Already have an account?{' '}
          <Link
            href={selectedPlan ? `/sign-in?plan=${selectedPlan}&redirect=checkout` : '/sign-in'}
            className="text-accent hover:underline"
          >
            Sign in
          </Link>
        </p>

        {/* Terms */}
        <p className="mt-4 text-center text-xs text-foreground-muted">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-accent hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-accent hover:underline">
            Privacy Policy
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
