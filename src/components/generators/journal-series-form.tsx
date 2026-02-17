'use client';

import { useState } from 'react';
import { Button, Input, Textarea, Select, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { StreamingOutput } from './streaming-output';
import { BookHeart, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const durationOptions = [
  { value: '7', label: '7 Days' },
  { value: '30', label: '30 Days' },
  { value: '60', label: '60 Days' },
  { value: '90', label: '90 Days' },
];

const modeOptions = [
  { value: 'devotional', label: 'Devotional Series' },
  { value: 'journal', label: 'Prayer Journal' },
];

const toneOptions = [
  { value: 'encouraging', label: 'Encouraging' },
  { value: 'reflective', label: 'Reflective' },
  { value: 'challenging', label: 'Challenging' },
  { value: 'comforting', label: 'Comforting' },
  { value: 'transformative', label: 'Transformative' },
];

const audienceOptions = [
  { value: 'general', label: 'General Audience' },
  { value: 'new-believers', label: 'New Believers' },
  { value: 'mature-believers', label: 'Mature Believers' },
  { value: 'youth', label: 'Youth/Teens' },
  { value: 'women', label: "Women's Devotional" },
  { value: 'men', label: "Men's Devotional" },
];

const bibleVersionOptions = [
  { value: 'NIV', label: 'NIV (New International Version)' },
  { value: 'ESV', label: 'ESV (English Standard Version)' },
  { value: 'KJV', label: 'KJV (King James Version)' },
  { value: 'NLT', label: 'NLT (New Living Translation)' },
  { value: 'NKJV', label: 'NKJV (New King James Version)' },
];

type Step = 'mode' | 'duration' | 'details' | 'generating';

export function JournalSeriesForm() {
  const [step, setStep] = useState<Step>('mode');
  const [mode, setMode] = useState<'devotional' | 'journal'>('devotional');
  const [duration, setDuration] = useState('7');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('encouraging');
  const [audience, setAudience] = useState('general');
  const [bibleVersion, setBibleVersion] = useState('NIV');
  const [includePrayer, setIncludePrayer] = useState(true);
  const [includeReflection, setIncludeReflection] = useState(true);

  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic) {
      setError('Please provide a topic or theme for your series');
      return;
    }

    setError('');
    setContent('');
    setStep('generating');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/journal-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          duration: parseInt(duration),
          topic,
          description,
          tone,
          audience,
          bibleVersion,
          includePrayer,
          includeReflection,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        setContent((prev) => prev + text);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('details');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'devotional',
          title: `${duration}-Day ${mode === 'devotional' ? 'Devotional' : 'Prayer Journal'}: ${topic}`,
          inputParams: {
            mode,
            duration,
            topic,
            description,
            tone,
            audience,
            bibleVersion,
          },
          generatedContent: content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setStep('mode');
    setContent('');
    setError('');
  };

  // Mode Selection Step
  if (step === 'mode') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card variant="bordered">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <BookHeart className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">Create a Series</CardTitle>
            <CardDescription>
              Choose the type of series you want to create
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setMode('devotional');
                  setStep('duration');
                }}
                className={cn(
                  'p-6 rounded-xl border-2 text-left transition-all hover:border-accent hover:bg-accent/5',
                  mode === 'devotional' ? 'border-accent bg-accent/5' : 'border-border'
                )}
              >
                <BookHeart className="h-8 w-8 text-accent mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Devotional Series</h3>
                <p className="text-sm text-foreground-muted">
                  Daily Scripture-based teachings with application and reflection
                </p>
              </button>
              <button
                onClick={() => {
                  setMode('journal');
                  setStep('duration');
                }}
                className={cn(
                  'p-6 rounded-xl border-2 text-left transition-all hover:border-accent hover:bg-accent/5',
                  mode === 'journal' ? 'border-accent bg-accent/5' : 'border-border'
                )}
              >
                <Calendar className="h-8 w-8 text-accent mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Prayer Journal</h3>
                <p className="text-sm text-foreground-muted">
                  Guided prayer prompts and spiritual reflection exercises
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Duration Selection Step
  if (step === 'duration') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card variant="bordered">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">Select Duration</CardTitle>
            <CardDescription>
              How many days should your {mode === 'devotional' ? 'devotional' : 'prayer journal'} series be?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setDuration(option.value);
                    setStep('details');
                  }}
                  className={cn(
                    'p-6 rounded-xl border-2 text-center transition-all hover:border-accent hover:bg-accent/5',
                    duration === option.value ? 'border-accent bg-accent/5' : 'border-border'
                  )}
                >
                  <span className="text-3xl font-bold text-accent">{option.value}</span>
                  <p className="text-sm text-foreground-muted mt-1">Days</p>
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setStep('mode')} className="mt-4">
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Details Form Step
  if (step === 'details') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="bordered">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BookHeart className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle>
                    {duration}-Day {mode === 'devotional' ? 'Devotional' : 'Prayer Journal'}
                  </CardTitle>
                  <CardDescription>Configure your series details</CardDescription>
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
                label="Topic/Theme"
                placeholder={mode === 'devotional'
                  ? "e.g., Walking in Faith, The Beatitudes, Psalms of Comfort"
                  : "e.g., Cultivating Gratitude, Hearing God's Voice, Spiritual Growth"
                }
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />

              <Textarea
                label="Description (Optional)"
                placeholder="Describe the focus and goals of this series..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Tone"
                  options={toneOptions}
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                />

                <Select
                  label="Audience"
                  options={audienceOptions}
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>

              <Select
                label="Bible Version"
                options={bibleVersionOptions}
                value={bibleVersion}
                onChange={(e) => setBibleVersion(e.target.value)}
              />

              {/* Optional Elements */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Include in each entry:</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePrayer}
                      onChange={(e) => setIncludePrayer(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-background-card text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-foreground">Prayer</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeReflection}
                      onChange={(e) => setIncludeReflection(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-background-card text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-foreground">Reflection Prompt</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep('duration')}>
                  Back
                </Button>
                <Button
                  onClick={handleGenerate}
                  fullWidth
                  withArrow
                  className="group"
                >
                  Generate Series
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card variant="bordered" className="bg-background-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Series Structure Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <span className="font-medium text-accent">Introduction</span>
                  <p className="text-foreground-muted mt-1">Overview and how to use this {mode}</p>
                </div>

                {[1, 2, 3].map((day) => (
                  <div key={day} className="p-3 rounded-lg border border-border">
                    <span className="font-medium text-foreground">Day {day}</span>
                    <ul className="mt-2 space-y-1 text-foreground-muted">
                      <li>• Title</li>
                      <li>• Scripture Block</li>
                      <li>• Teaching</li>
                      <li>• Application</li>
                      {includePrayer && <li>• Prayer</li>}
                      {includeReflection && <li>• Reflection Prompt</li>}
                    </ul>
                  </div>
                ))}

                <div className="p-3 rounded-lg border border-dashed border-border text-center text-foreground-muted">
                  ... Day 4 through Day {duration} ...
                </div>

                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <span className="font-medium text-accent">Conclusion</span>
                  <p className="text-foreground-muted mt-1">Reflection on the journey and next steps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Generating/Output Step
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {duration}-Day {mode === 'devotional' ? 'Devotional' : 'Prayer Journal'}: {topic}
          </h2>
          <p className="text-sm text-foreground-muted">
            {isGenerating ? 'Generating your series...' : 'Generation complete'}
          </p>
        </div>
        {!isGenerating && (
          <Button variant="outline" onClick={resetForm}>
            Create Another
          </Button>
        )}
      </div>

      <StreamingOutput
        content={content}
        isStreaming={isGenerating}
        onSave={handleSave}
        isSaving={isSaving}
        title={`${duration}-Day ${mode === 'devotional' ? 'Devotional' : 'Prayer Journal'}: ${topic}`}
        contentType="devotional"
      />
    </div>
  );
}
