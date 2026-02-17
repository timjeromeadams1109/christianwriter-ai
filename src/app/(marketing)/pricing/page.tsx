'use client';

import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out ChristianWriter.ai',
    features: [
      '5 generations per month',
      'Devotional generator',
      'Basic Scripture integration',
      'PDF export',
      'Community support',
    ],
    cta: 'Get Started Free',
    href: '/sign-up',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'For active content creators and ministry leaders',
    features: [
      'Unlimited generations',
      'All content types (devotionals, sermons, social)',
      'Author Voice matching',
      'All Bible versions',
      'PDF & Word export',
      'Priority support',
      'Content history',
    ],
    cta: 'Start Pro Trial',
    href: '/sign-up?plan=pro',
    popular: true,
  },
  {
    name: 'Ministry',
    price: '$49',
    period: 'per month',
    description: 'For churches and ministry teams',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Shared voice profiles',
      'Team content library',
      'Priority generation queue',
      'Dedicated support',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
  },
];

export default function PricingPage() {
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
              Simple Pricing
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl sm:text-5xl font-bold text-foreground"
          >
            Choose Your Plan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg text-foreground-muted max-w-2xl mx-auto"
          >
            Start free and upgrade as your ministry grows. All plans include our core AI writing tools.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="accent">Most Popular</Badge>
                </div>
              )}
              <Card
                variant="bordered"
                className={`h-full flex flex-col ${
                  plan.popular ? 'border-accent ring-1 ring-accent' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-foreground-muted ml-2">/{plan.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-foreground-muted">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="mt-8 block">
                    <Button
                      variant={plan.popular ? 'primary' : 'outline'}
                      fullWidth
                      withArrow={plan.popular}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-foreground-muted">
                Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                What counts as a generation?
              </h3>
              <p className="text-foreground-muted">
                Each time you generate a devotional, sermon outline, or social media post counts as one generation. Editing and exporting existing content does not count.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Do you offer discounts for nonprofits?
              </h3>
              <p className="text-foreground-muted">
                Yes! Registered 501(c)(3) organizations receive 20% off all plans. Contact us to apply.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
