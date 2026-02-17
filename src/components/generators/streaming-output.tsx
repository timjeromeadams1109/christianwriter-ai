'use client';

import { cn } from '@/lib/utils';
import { Copy, Check, Save, FileDown, FileText, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui';
import { exportToWord, exportToText } from '@/lib/export';
import { motion } from 'framer-motion';

interface StreamingOutputProps {
  content: string;
  isStreaming: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  title?: string;
  contentType?: 'devotional' | 'sermon' | 'social';
  scripture?: string;
  className?: string;
}

export function StreamingOutput({
  content,
  isStreaming,
  onSave,
  isSaving,
  title = 'Generated Content',
  contentType = 'devotional',
  scripture,
  className,
}: StreamingOutputProps) {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportWord = async () => {
    setIsExporting(true);
    try {
      await exportToWord({
        title,
        content,
        type: contentType,
        scripture,
      });
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportText = () => {
    exportToText({
      title,
      content,
      type: contentType,
      scripture,
    });
  };

  if (!content && !isStreaming) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn('rounded-xl bg-background-card border border-border', className)}
      >
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center mb-4"
          >
            <Sparkles className="h-8 w-8 text-accent" />
          </motion.div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Generate</h3>
          <p className="text-foreground-muted max-w-sm">
            Fill in the form and click generate to create your content. It will appear here in real-time.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl bg-background-card border border-border', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {isStreaming && (
            <span className="flex items-center gap-2 text-sm text-accent font-medium">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-accent"
              />
              Generating...
            </span>
          )}
          {!isStreaming && content && (
            <span className="text-sm text-foreground-muted font-medium">Generated Content</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!content || isStreaming}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1 text-success" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportWord}
            disabled={!content || isStreaming || isExporting}
          >
            <FileDown className="h-4 w-4 mr-1" />
            Word
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportText}
            disabled={!content || isStreaming}
          >
            <FileText className="h-4 w-4 mr-1" />
            Text
          </Button>
          {onSave && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onSave}
              disabled={!content || isStreaming || isSaving}
              isLoading={isSaving}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 max-h-[600px] overflow-y-auto">
        <div
          className={cn(
            'prose-content whitespace-pre-wrap text-foreground',
            isStreaming && 'streaming-cursor'
          )}
        >
          {content}
        </div>
      </div>
    </motion.div>
  );
}
