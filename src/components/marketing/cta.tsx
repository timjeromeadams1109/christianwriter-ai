'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function CTA() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="glow-orb glow-orb-indigo w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-8 sm:p-12 rounded-3xl bg-background-card border border-border relative overflow-hidden"
        >
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-purple-500/5" />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-purple-500 mb-6"
            >
              <Zap className="w-8 h-8 text-white" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Ready to Transform Your{' '}
              <span className="gradient-text">Ministry Writing?</span>
            </h2>
            <p className="text-lg text-foreground-muted max-w-xl mx-auto mb-8">
              Join thousands of pastors and ministry leaders using AI to create impactful, Scripture-centered content.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="btn-arrow text-base px-8 py-6 animate-pulse-glow">
                  Start Writing Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="text-base px-8 py-6">
                  View Pricing
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-foreground-muted">
              No credit card required. Start with 5 free generations.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
