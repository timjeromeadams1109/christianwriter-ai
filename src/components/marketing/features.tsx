'use client';

import { BookOpen, Mic, Share2, User, BookMarked, Download, MessageSquare, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: BookOpen,
    title: 'Devotional Generator',
    description: 'Create meaningful daily devotionals with Scripture references, reflection questions, and practical applications.',
  },
  {
    icon: Mic,
    title: 'Sermon Outlines',
    description: 'Generate structured sermon outlines in expository, topical, or narrative styles with theological accuracy.',
  },
  {
    icon: Share2,
    title: 'Social Media Content',
    description: 'Craft engaging posts for any platform with integrated Scripture and hashtag suggestions.',
  },
  {
    icon: User,
    title: 'Author Voice',
    description: 'Train the AI to match your unique writing style by analyzing your existing content.',
  },
  {
    icon: Calendar,
    title: 'Prayer Journals',
    description: 'Create guided prayer journal series for 7, 30, 60, or 90-day spiritual journeys.',
  },
  {
    icon: MessageSquare,
    title: 'Discussion Guides',
    description: 'Generate small group discussion questions and study guides from any sermon or topic.',
  },
  {
    icon: BookMarked,
    title: 'Scripture Integration',
    description: 'Access multiple Bible versions (NIV, ESV, KJV) with automatic citation and formatting.',
  },
  {
    icon: Download,
    title: 'Export Options',
    description: 'Download your content as professionally formatted PDF or Word documents.',
  },
];

export function Features() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="glow-orb glow-orb-indigo w-[400px] h-[400px] top-0 right-0" />
      <div className="glow-orb glow-orb-purple w-[300px] h-[300px] bottom-0 left-0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
          >
            <span className="text-sm font-medium text-accent">Powerful Features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            Everything You Need to{' '}
            <span className="gradient-text">Create</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-foreground-muted max-w-2xl mx-auto"
          >
            Powerful AI tools designed specifically for Christian content creation, with Scripture at the foundation.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="group h-full p-6 rounded-2xl bg-background-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 card-interactive">
                <div className="feature-icon-box mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
