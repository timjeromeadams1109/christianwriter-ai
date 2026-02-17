'use client';

import Link from 'next/link';
import { Feather } from 'lucide-react';
import { motion } from 'framer-motion';

const footerLinks = {
  product: [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
  ],
  resources: [
    { href: '/blog', label: 'Blog' },
    { href: '/tutorials', label: 'Tutorials' },
    { href: '/support', label: 'Support' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

const socialLinks = [
  { href: 'https://twitter.com', label: 'Twitter', icon: 'X' },
  { href: 'https://facebook.com', label: 'Facebook', icon: 'FB' },
  { href: 'https://instagram.com', label: 'Instagram', icon: 'IG' },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: 'LI' },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                <Feather className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">
                ChristianWriter<span className="text-accent">.ai</span>
              </span>
            </Link>
            <p className="text-sm text-foreground-muted max-w-xs mb-6">
              AI-powered writing tools for Christian content creators. Create devotionals, sermons, and social media content with Scripture at the center.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-lg bg-background-elevated border border-border flex items-center justify-center text-foreground-muted hover:text-foreground hover:border-accent/50 transition-colors"
                >
                  <span className="text-xs font-bold">{link.icon}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <p className="text-sm text-foreground-muted text-center">
            &copy; {new Date().getFullYear()} ChristianWriter.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
