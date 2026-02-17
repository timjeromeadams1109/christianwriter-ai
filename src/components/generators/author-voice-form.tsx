'use client';

import { useState } from 'react';
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui';
import { User, Loader2, Check } from 'lucide-react';

interface VoiceCharacteristics {
  tone: string[];
  style: string[];
  vocabulary: string[];
  sentenceStructure: string;
  rhetoricalDevices: string[];
  summary: string;
}

export function AuthorVoiceForm() {
  const [name, setName] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<VoiceCharacteristics | null>(null);

  const handleAnalyze = async () => {
    if (!name) {
      setError('Please provide a name for this voice profile');
      return;
    }

    if (sampleText.length < 500) {
      setError('Please provide at least 500 characters of sample text');
      return;
    }

    setError('');
    setResult(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/author-voice/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, sampleText }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze');
      }

      const data = await response.json();
      setResult(data.voiceCharacteristics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <User className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle>Author Voice Analysis</CardTitle>
              <CardDescription>Train the AI to match your writing style</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <Input
            label="Profile Name"
            placeholder="e.g., My Devotional Style"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Textarea
            label="Writing Sample"
            placeholder="Paste a sample of your writing here (at least 500 characters). The more text you provide, the better the analysis."
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            className="min-h-[300px]"
            hint={`${sampleText.length} / 500 characters minimum`}
          />

          <Button
            onClick={handleAnalyze}
            fullWidth
            isLoading={isAnalyzing}
            disabled={sampleText.length < 500}
          >
            {isAnalyzing ? 'Analyzing Your Voice...' : 'Analyze Writing Style'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Voice Profile</CardTitle>
          <CardDescription>
            {result ? 'Analysis complete! Your voice profile has been saved.' : 'Your analysis results will appear here'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-12 text-foreground-muted">
              <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
              <p>Analyzing your writing style...</p>
              <p className="text-sm mt-2">This may take a moment</p>
            </div>
          )}

          {!isAnalyzing && !result && (
            <div className="text-center py-12 text-foreground-muted">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Upload a writing sample to analyze your unique voice</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Success indicator */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-success">
                <Check className="h-5 w-5" />
                <span className="text-sm">Voice profile saved successfully</span>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Summary</h4>
                <p className="text-sm text-foreground-muted">{result.summary}</p>
              </div>

              {/* Tone */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Tone</h4>
                <div className="flex flex-wrap gap-2">
                  {result.tone.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Style Characteristics</h4>
                <ul className="space-y-1">
                  {result.style.map((s) => (
                    <li key={s} className="text-sm text-foreground-muted">• {s}</li>
                  ))}
                </ul>
              </div>

              {/* Rhetorical Devices */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Rhetorical Devices</h4>
                <div className="flex flex-wrap gap-2">
                  {result.rhetoricalDevices.map((d) => (
                    <span
                      key={d}
                      className="px-2 py-1 rounded-full bg-background border border-border text-foreground-muted text-xs"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sentence Structure */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Sentence Structure</h4>
                <p className="text-sm text-foreground-muted">{result.sentenceStructure}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
