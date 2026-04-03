'use client';

import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, ChevronDown } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input } from '@/components/ui';

export default function MFAVerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBackup, setShowBackup] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Verification failed. Please try again.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <Card variant="elevated" className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              {showBackup
                ? 'Enter one of your backup codes.'
                : 'Enter the 6-digit code from your authenticator app.'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              ref={inputRef}
              type="text"
              inputMode={showBackup ? 'text' : 'numeric'}
              autoComplete="one-time-code"
              maxLength={showBackup ? 10 : 6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))}
              placeholder={showBackup ? 'XXXXXXXXXX' : '000000'}
              className="text-center text-2xl tracking-[0.3em] font-mono"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading || code.length < 6}
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Verify
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setShowBackup((v) => !v);
            setCode('');
            setError('');
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showBackup ? 'rotate-180' : ''}`} />
          {showBackup ? 'Use authenticator app instead' : 'Use a backup code instead'}
        </button>
      </CardContent>
    </Card>
  );
}
