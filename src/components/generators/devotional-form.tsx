'use client';

import { useState } from 'react';
import { Button, Input, Textarea, Select, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { StreamingOutput } from './streaming-output';
import { BookOpen } from 'lucide-react';

const toneOptions = [
  { value: 'encouraging', label: 'Encouraging' },
  { value: 'challenging', label: 'Challenging' },
  { value: 'reflective', label: 'Reflective' },
  { value: 'comforting', label: 'Comforting' },
  { value: 'convicting', label: 'Convicting' },
];

const audienceOptions = [
  { value: 'general', label: 'General Audience' },
  { value: 'youth', label: 'Youth/Teens' },
  { value: 'young-adults', label: 'Young Adults' },
  { value: 'seniors', label: 'Seniors' },
  { value: 'new-believers', label: 'New Believers' },
  { value: 'mature-believers', label: 'Mature Believers' },
];

const bibleVersionOptions = [
  { value: 'NIV', label: 'NIV (New International Version)' },
  { value: 'ESV', label: 'ESV (English Standard Version)' },
  { value: 'KJV', label: 'KJV (King James Version)' },
  { value: 'NKJV', label: 'NKJV (New King James Version)' },
  { value: 'NLT', label: 'NLT (New Living Translation)' },
];

export function DevotionalForm() {
  const [topic, setTopic] = useState('');
  const [scripture, setScripture] = useState('');
  const [tone, setTone] = useState('encouraging');
  const [audience, setAudience] = useState('general');
  const [bibleVersion, setBibleVersion] = useState('NIV');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic || !scripture) {
      setError('Please provide both a topic and Scripture reference');
      return;
    }

    setError('');
    setContent('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/devotional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          scripture,
          tone,
          audience,
          bibleVersion,
          voiceInstructions: additionalInstructions || undefined,
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
          title: topic,
          inputParams: {
            topic,
            scripture,
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

      // Could show a success toast here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-accent" />
            </div>
            <CardTitle>Devotional Generator</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <Input
            label="Topic"
            placeholder="e.g., Finding peace in difficult times"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <Input
            label="Scripture Reference"
            placeholder="e.g., Philippians 4:6-7"
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
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

          <Textarea
            label="Additional Instructions (Optional)"
            placeholder="Any specific style, themes, or points to include..."
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
          />

          <Button
            onClick={handleGenerate}
            fullWidth
            isLoading={isGenerating}
            withArrow={!isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Devotional'}
          </Button>
        </CardContent>
      </Card>

      {/* Output */}
      <StreamingOutput
        content={content}
        isStreaming={isGenerating}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
