'use client';

import { useState } from 'react';
import { Button, Input, Textarea, Select, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { StreamingOutput } from './streaming-output';
import { Mic } from 'lucide-react';

const styleOptions = [
  { value: 'expository', label: 'Expository (verse-by-verse)' },
  { value: 'topical', label: 'Topical (theme-based)' },
  { value: 'narrative', label: 'Narrative (story-driven)' },
];

const audienceOptions = [
  { value: 'general', label: 'General Congregation' },
  { value: 'youth', label: 'Youth Service' },
  { value: 'mens', label: "Men's Ministry" },
  { value: 'womens', label: "Women's Ministry" },
  { value: 'seekers', label: 'Seeker-Friendly' },
];

const bibleVersionOptions = [
  { value: 'NIV', label: 'NIV (New International Version)' },
  { value: 'ESV', label: 'ESV (English Standard Version)' },
  { value: 'KJV', label: 'KJV (King James Version)' },
  { value: 'NKJV', label: 'NKJV (New King James Version)' },
  { value: 'NLT', label: 'NLT (New Living Translation)' },
];

export function SermonForm() {
  const [topic, setTopic] = useState('');
  const [scripture, setScripture] = useState('');
  const [style, setStyle] = useState('expository');
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
      const response = await fetch('/api/generate/sermon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          scripture,
          style,
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
          type: 'sermon',
          title: topic,
          inputParams: {
            topic,
            scripture,
            style,
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Mic className="h-5 w-5 text-accent" />
            </div>
            <CardTitle>Sermon Outline Generator</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <Input
            label="Sermon Topic"
            placeholder="e.g., The Power of Forgiveness"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <Input
            label="Scripture Reference"
            placeholder="e.g., Matthew 18:21-35"
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Sermon Style"
              options={styleOptions}
              value={style}
              onChange={(e) => setStyle(e.target.value)}
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
            placeholder="Specific illustrations to include, theological emphases, time constraints..."
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
          />

          <Button
            onClick={handleGenerate}
            fullWidth
            isLoading={isGenerating}
            withArrow={!isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Sermon Outline'}
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
