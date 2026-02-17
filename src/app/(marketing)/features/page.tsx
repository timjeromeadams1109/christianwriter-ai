'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui';
import { BookOpen, Mic, Share2, User, BookMarked, Download, Sparkles, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const mainFeatures = [
  {
    icon: BookOpen,
    title: 'Devotional Generator',
    description: 'Create meaningful daily devotionals with Scripture references, reflection questions, and practical applications. Perfect for personal use, church newsletters, or ministry blogs.',
    details: [
      'Topic-based or Scripture-based generation',
      'Multiple tone options (encouraging, challenging, reflective)',
      'Audience targeting (youth, adults, seniors)',
      'Automatic reflection questions',
      'Prayer prompts and action steps',
    ],
  },
  {
    icon: Mic,
    title: 'Sermon Outline Generator',
    description: 'Generate structured sermon outlines in expository, topical, or narrative styles with theological accuracy and practical application points.',
    details: [
      'Three sermon styles: expository, topical, narrative',
      'Automatic illustration suggestions',
      'Head-heart-hands application framework',
      'Cross-reference recommendations',
      'Introduction and conclusion hooks',
    ],
  },
  {
    icon: Share2,
    title: 'Social Media Content',
    description: 'Craft engaging posts optimized for each platform with integrated Scripture and hashtag suggestions.',
    details: [
      'Platform-specific formatting',
      'Character count optimization',
      'Hashtag recommendations',
      'Engagement prompts',
      'Image suggestions',
    ],
  },
  {
    icon: User,
    title: 'Author Voice Matching',
    description: 'Train the AI to match your unique writing style by analyzing samples of your existing content.',
    details: [
      'Upload writing samples for analysis',
      'AI learns your vocabulary and tone',
      'Multiple voice profiles',
      'Apply your voice to any generation',
      'Continuous learning from feedback',
    ],
  },
];

const additionalFeatures = [
  {
    icon: BookMarked,
    title: 'Scripture Integration',
    description: 'Access NIV, ESV, and KJV with automatic citation formatting.',
  },
  {
    icon: Download,
    title: 'Export Options',
    description: 'Download as PDF or Word documents with professional formatting.',
  },
  {
    icon: Shield,
    title: 'Theological Guardrails',
    description: 'AI trained to maintain biblical accuracy and pastoral sensitivity.',
  },
  {
    icon: Zap,
    title: 'Real-time Streaming',
    description: 'Watch your content generate in real-time with streaming responses.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-foreground-muted">
              <Sparkles className="h-4 w-4 text-accent" />
              Platform Features
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl sm:text-5xl font-bold text-foreground"
          >
            Powerful Tools for Ministry
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg text-foreground-muted max-w-2xl mx-auto"
          >
            Everything you need to create impactful Christian content, with Scripture at the foundation.
          </motion.p>
        </div>

        {/* Main Features */}
        <div className="space-y-12 mb-24">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="bordered" className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 md:p-8">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">{feature.title}</h2>
                    <p className="text-foreground-muted">{feature.description}</p>
                  </div>
                  <div className="bg-background-card/50 p-6 md:p-8">
                    <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider mb-4">
                      Capabilities
                    </h3>
                    <ul className="space-y-3">
                      {feature.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span className="text-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            And Much More
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {additionalFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="bordered" hoverable className="h-full text-center">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
