'use client';

import { Card, CardContent } from '@/components/ui';
import { BookOpen, Heart, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const values = [
  {
    icon: BookOpen,
    title: 'Scripture-Centered',
    description: 'Every feature is designed to keep the Bible at the heart of content creation.',
  },
  {
    icon: Heart,
    title: 'Pastorally Sensitive',
    description: 'AI trained with theological guardrails to maintain accuracy and compassion.',
  },
  {
    icon: Users,
    title: 'Ministry-Focused',
    description: 'Built by ministry leaders, for ministry leaders. We understand your needs.',
  },
];

export default function AboutPage() {
  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-foreground-muted">
              <Sparkles className="h-4 w-4 text-accent" />
              Our Story
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl sm:text-5xl font-bold text-foreground"
          >
            About ChristianWriter.ai
          </motion.h1>
        </div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <Card variant="glass" className="text-center">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
                To empower Christian content creators with AI tools that enhance their ministry while keeping Scripture at the center of everything they write.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="prose-invert mb-16"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">Why We Built This</h2>
          <p className="text-foreground-muted mb-4">
            ChristianWriter.ai was born from a simple observation: ministry leaders spend countless hours writing content - devotionals, sermons, newsletters, social media posts - often late into the night after their pastoral duties.
          </p>
          <p className="text-foreground-muted mb-4">
            We saw an opportunity to use AI not to replace the pastor&apos;s voice, but to accelerate their creative process. To give them a starting point - an outline, a draft, a spark of inspiration - that they can then refine with their own pastoral wisdom and personal touch.
          </p>
          <p className="text-foreground-muted">
            Our theological guardrails ensure that AI-generated content stays true to Scripture. But we always encourage human review because we believe the best content comes from the combination of AI efficiency and human discernment.
          </p>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="bordered" className="h-full text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-foreground-muted">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Human in the Loop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Card variant="bordered" className="bg-accent/5 border-accent/20">
            <CardContent className="py-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Human-in-the-Loop Philosophy</h2>
              <p className="text-foreground-muted max-w-2xl mx-auto">
                Our AI generates outlines and drafts, not finished products. We believe the pastor&apos;s voice, wisdom, and discernment are irreplaceable. ChristianWriter.ai is a tool to augment your creativity, not replace it.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
