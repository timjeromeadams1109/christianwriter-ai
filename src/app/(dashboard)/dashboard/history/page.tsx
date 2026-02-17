'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { BookOpen, Mic, Share2, Calendar, Loader2, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ContentItem {
  id: string;
  type: 'devotional' | 'sermon' | 'social';
  title: string;
  status: string;
  createdAt: string;
  inputParams?: {
    scripture?: string;
    tone?: string;
  };
}

const typeIcons = {
  devotional: BookOpen,
  sermon: Mic,
  social: Share2,
};

const typeColors = {
  devotional: 'bg-blue-500/10 text-blue-400',
  sermon: 'bg-purple-500/10 text-purple-400',
  social: 'bg-green-500/10 text-green-400',
};

export default function HistoryPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/content');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setContent(data);
    } catch {
      setError('Failed to load content history');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">My Content</h1>
        <p className="text-foreground-muted">
          View and manage your generated content
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive mb-6">
          {error}
        </div>
      )}

      {content.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No content yet
            </h3>
            <p className="text-foreground-muted mb-6">
              Start creating devotionals, sermons, or social media posts
            </p>
            <Link href="/dashboard">
              <Button>Get Started</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {content.map((item, index) => {
            const Icon = typeIcons[item.type];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card variant="bordered" hoverable className="cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg ${typeColors[item.type]} flex items-center justify-center shrink-0`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">
                              {item.title}
                            </h3>
                            {item.inputParams?.scripture && (
                              <p className="text-sm text-foreground-muted">
                                {item.inputParams.scripture}
                              </p>
                            )}
                          </div>
                          <Badge variant="default" className="capitalize shrink-0">
                            {item.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-foreground-muted">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(item.createdAt)}
                          </span>
                          {item.inputParams?.tone && (
                            <span className="capitalize">{item.inputParams.tone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
