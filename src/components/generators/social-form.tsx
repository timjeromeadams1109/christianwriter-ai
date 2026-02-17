'use client';

import { useState } from 'react';
import { Button, Input, Textarea, Select, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { StreamingOutput } from './streaming-output';
import { Share2 } from 'lucide-react';

const platformOptions = [
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
];

const toneOptions = [
  { value: 'encouraging', label: 'Encouraging' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'thoughtful', label: 'Thoughtful' },
  { value: 'celebratory', label: 'Celebratory' },
  { value: 'educational', label: 'Educational' },
];

const bibleVersionOptions = [
  { value: 'NIV', label: 'NIV' },
  { value: 'ESV', label: 'ESV' },
  { value: 'KJV', label: 'KJV' },
  { value: 'NLT', label: 'NLT' },
];

export function SocialForm() {
  const [topic, setTopic] = useState('');
  const [scripture, setScripture] = useState('');
  const [platform, setPlatform] = useState('twitter');
  const [tone, setTone] = useState('encouraging');
  const [bibleVersion, setBibleVersion] = useState('NIV');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic) {
      setError('Please provide a topic');
      return;
    }

    setError('');
    setContent('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          scripture: scripture || undefined,
          platform,
          tone,
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
          type: 'social',
          title: topic,
          inputParams: {
            topic,
            scripture,
            platform,
            tone,
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-accent" />
            </div>
            <CardTitle>Social Media Generator</CardTitle>
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
            placeholder="e.g., Sunday motivation, gratitude post"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <Input
            label="Scripture Reference (Optional)"
            placeholder="e.g., Psalm 23:1"
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Platform"
              options={platformOptions}
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            />

            <Select
              label="Tone"
              options={toneOptions}
              value={tone}
              onChange={(e) => setTone(e.target.value)}
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
            placeholder="Specific hashtags, call to action, target audience..."
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
          />

          <Button
            onClick={handleGenerate}
            fullWidth
            isLoading={isGenerating}
            withArrow={!isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Post'}
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
