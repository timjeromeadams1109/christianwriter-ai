'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui';
import { BookOpen, Mic, Share2, User, ArrowRight, Sparkles, BookHeart } from 'lucide-react';
import { motion } from 'framer-motion';

const quickActions = [
  {
    icon: BookOpen,
    title: 'Devotional',
    description: 'Create a Scripture-centered daily devotional',
    href: '/dashboard/devotionals',
    color: 'bg-blue-500/10 text-blue-400',
  },
  {
    icon: BookHeart,
    title: 'Prayer Journal',
    description: 'Create multi-day devotional or journal series',
    href: '/dashboard/journal',
    color: 'bg-rose-500/10 text-rose-400',
  },
  {
    icon: Mic,
    title: 'Sermon Outline',
    description: 'Generate a structured sermon outline',
    href: '/dashboard/sermons',
    color: 'bg-purple-500/10 text-purple-400',
  },
  {
    icon: Share2,
    title: 'Social Media',
    description: 'Craft engaging posts for any platform',
    href: '/dashboard/social',
    color: 'bg-green-500/10 text-green-400',
  },
  {
    icon: User,
    title: 'Author Voice',
    description: 'Train AI to match your writing style',
    href: '/dashboard/author-voice',
    color: 'bg-orange-500/10 text-orange-400',
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome to ChristianWriter.ai
        </h1>
        <p className="text-foreground-muted">
          Create impactful Christian content with AI assistance
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
            >
              <Link href={action.href}>
                <Card
                  variant="bordered"
                  hoverable
                  className="h-full group cursor-pointer"
                >
                  <CardContent className="pt-6">
                    <div
                      className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}
                    >
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-foreground-muted">
                      {action.description}
                    </p>
                    <ArrowRight className="h-4 w-4 text-foreground-muted mt-3 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card variant="glass" className="border border-accent/20">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Getting Started Tips
                </h3>
                <ul className="space-y-2 text-sm text-foreground-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-accent">1.</span>
                    Start with a clear topic and Scripture reference for best results
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">2.</span>
                    Use Prayer Journal to create 7, 30, 60, or 90-day devotional series
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">3.</span>
                    AI generates outlines and drafts - always add your personal touch
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">4.</span>
                    Save your content to access it later from the History page
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
