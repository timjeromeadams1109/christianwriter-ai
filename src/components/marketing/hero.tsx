'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { Play, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background grid pattern */}
      <div className="absolute inset-0 grid-pattern" />

      {/* Glow orbs */}
      <div className="glow-orb glow-orb-indigo w-[600px] h-[600px] -top-40 -left-40" />
      <div className="glow-orb glow-orb-purple w-[500px] h-[500px] top-1/2 -right-40" />
      <div className="glow-orb glow-orb-pink w-[400px] h-[400px] bottom-0 left-1/3" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">AI-Powered Writing for Ministry</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-tight mb-6"
          >
            The AI platform that{' '}
            <span className="gradient-text">transforms your ministry</span>{' '}
            into impactful content
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-foreground-muted max-w-3xl mx-auto mb-8"
          >
            Create devotionals, sermon outlines, social media posts, and prayer journals—all grounded in Scripture with theological accuracy.
          </motion.p>

          {/* Testimonial Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-10"
          >
            <blockquote className="text-xl sm:text-2xl text-foreground italic font-medium mb-3">
              "Every ministry leader should be using ChristianWriter.ai"
            </blockquote>
            <cite className="text-foreground-muted text-sm not-italic">
              — Pastor Michael Thompson, Grace Community Church
            </cite>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/sign-up">
              <Button size="lg" className="btn-arrow text-base px-8 py-6 animate-pulse-glow">
                Try for Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="text-base px-8 py-6">
                View Pricing
              </Button>
            </Link>
          </motion.div>

          {/* Video Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="video-mockup aspect-video rounded-2xl shadow-2xl">
              {/* Mockup content - Dashboard preview */}
              <div className="absolute inset-0 p-4 sm:p-8">
                {/* Fake browser chrome */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 h-6 bg-background-elevated/50 rounded-md mx-4" />
                </div>

                {/* Dashboard layout mockup */}
                <div className="flex gap-4 h-[calc(100%-40px)]">
                  {/* Sidebar mockup */}
                  <div className="hidden sm:block w-48 bg-background/50 rounded-lg p-3">
                    <div className="w-full h-8 bg-accent/20 rounded mb-3" />
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-full h-6 bg-background-elevated/30 rounded" />
                      ))}
                    </div>
                  </div>

                  {/* Main content mockup */}
                  <div className="flex-1 bg-background/30 rounded-lg p-4">
                    <div className="w-48 h-8 bg-foreground/10 rounded mb-4" />
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-background-elevated/40 rounded-lg" />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-4 bg-foreground/5 rounded" />
                      <div className="w-3/4 h-4 bg-foreground/5 rounded" />
                      <div className="w-5/6 h-4 bg-foreground/5 rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-background/20">
                <button className="play-button hover-glow">
                  <Play className="w-8 h-8 text-background fill-background" />
                </button>
              </div>
            </div>

            {/* Floating elements around video */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 hidden lg:block"
            >
              <div className="px-4 py-2 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-lg">
                <span className="text-sm font-medium text-accent">Sermon Outlines</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-4 -left-6 hidden lg:block"
            >
              <div className="px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg">
                <span className="text-sm font-medium text-purple-400">Daily Devotionals</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/2 -right-10 hidden xl:block"
            >
              <div className="px-4 py-2 bg-pink-500/20 backdrop-blur-sm border border-pink-500/30 rounded-lg">
                <span className="text-sm font-medium text-pink-400">Social Media</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
