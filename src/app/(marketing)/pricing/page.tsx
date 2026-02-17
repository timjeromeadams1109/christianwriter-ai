'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Badge } from '@/components/ui';
import { Check, Sparkles, Loader2, Zap, Crown, Building2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SubscriptionTier } from '@/lib/stripe/config';

const plans: Array<{
  name: string;
  tier: SubscriptionTier;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  icon: typeof Zap;
  gradient: string;
}> = [
  {
    name: 'Free',
    tier: 'free',
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
    popular: false,
    icon: Zap,
    gradient: 'from-gray-500 to-gray-600',
  },
  {
    name: 'Pro',
    tier: 'pro',
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
    popular: true,
    icon: Crown,
    gradient: 'from-accent to-purple-500',
  },
  {
    name: 'Ministry',
    tier: 'ministry',
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
    cta: 'Start Ministry Trial',
    popular: false,
    icon: Building2,
    gradient: 'from-blue-500 to-indigo-600',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const featureVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [hoveredTier, setHoveredTier] = useState<SubscriptionTier | null>(null);

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    if (loadingTier !== null || status === 'loading') return;

    if (tier === 'free') {
      if (session) {
        router.push('/dashboard');
      } else {
        router.push('/sign-up');
      }
      return;
    }

    if (!session) {
      router.push(`/sign-up?plan=${tier}&redirect=checkout`);
      return;
    }

    setLoadingTier(tier);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-20 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-16 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <motion.span
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-foreground-muted"
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4 text-accent" />
              </motion.span>
              Simple Pricing
            </motion.span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground"
          >
            Choose Your{' '}
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Plan
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg text-foreground-muted max-w-2xl mx-auto"
          >
            Start free and upgrade as your ministry grows. All plans include our core AI writing tools.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative"
        >
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isLoading = loadingTier === plan.tier;
            const isHovered = hoveredTier === plan.tier;
            const isDisabled = loadingTier !== null || status === 'loading';

            return (
              <motion.div
                key={plan.name}
                variants={cardVariants}
                className="relative"
                onMouseEnter={() => setHoveredTier(plan.tier)}
                onMouseLeave={() => setHoveredTier(null)}
              >
                {/* Popular Badge */}
                <AnimatePresence>
                  {plan.popular && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                    >
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Badge variant="accent" className="shadow-lg shadow-accent/30">
                          Most Popular
                        </Badge>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Card */}
                <motion.div
                  onClick={() => handleSelectPlan(plan.tier)}
                  whileHover={{
                    scale: 1.03,
                    y: -8,
                    transition: { type: 'spring', stiffness: 300, damping: 20 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative h-full flex flex-col cursor-pointer
                    bg-background-card rounded-2xl border-2 p-6
                    transition-all duration-300
                    ${plan.popular
                      ? 'border-accent shadow-xl shadow-accent/20'
                      : 'border-border hover:border-accent/50'
                    }
                    ${isDisabled && !isLoading ? 'opacity-70' : ''}
                  `}
                >
                  {/* Glow Effect on Hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${plan.gradient} opacity-5 pointer-events-none`}
                  />

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <motion.div
                      animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </motion.div>
                  </motion.div>

                  {/* Plan Name & Price */}
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <motion.span
                      key={plan.price}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl font-bold text-foreground"
                    >
                      {plan.price}
                    </motion.span>
                    <span className="text-foreground-muted">/{plan.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-foreground-muted">{plan.description}</p>

                  {/* Features */}
                  <ul className="mt-6 space-y-3 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={feature}
                        custom={featureIndex}
                        variants={featureVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="flex items-start gap-2"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Check className={`h-5 w-5 shrink-0 mt-0.5 ${plan.popular ? 'text-accent' : 'text-green-500'}`} />
                        </motion.div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <motion.div
                    className="mt-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={plan.popular ? 'primary' : 'outline'}
                      fullWidth
                      disabled={isDisabled}
                      className={`group ${plan.popular ? 'shadow-lg shadow-accent/30' : ''}`}
                    >
                      {isLoading ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center"
                        >
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </motion.div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {plan.cta}
                          <motion.span
                            animate={isHovered ? { x: [0, 5, 0] } : {}}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </motion.span>
                        </span>
                      )}
                    </Button>
                  </motion.div>

                  {/* Click hint */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 0.7 : 0 }}
                    className="text-xs text-center text-foreground-muted mt-3"
                  >
                    Click anywhere to select
                  </motion.p>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24 max-w-3xl mx-auto"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-foreground text-center mb-8"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.',
              },
              {
                q: 'What counts as a generation?',
                a: 'Each time you generate a devotional, sermon outline, or social media post counts as one generation. Editing and exporting existing content does not count.',
              },
              {
                q: 'Do you offer discounts for nonprofits?',
                a: 'Yes! Registered 501(c)(3) organizations receive 20% off all plans. Contact us to apply.',
              },
            ].map((faq, index) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
                className="p-4 rounded-lg hover:bg-background-elevated transition-colors"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {faq.q}
                </h3>
                <p className="text-foreground-muted">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
