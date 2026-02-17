'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Mic,
  Share2,
  User,
  History,
  Settings,
  LogOut,
  Feather,
  Home,
  BookHeart,
} from 'lucide-react';
import { motion } from 'framer-motion';

const sidebarLinks = [
  {
    section: 'Create',
    links: [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/dashboard/devotionals', label: 'Devotionals', icon: BookOpen },
      { href: '/dashboard/journal', label: 'Prayer Journal', icon: BookHeart },
      { href: '/dashboard/sermons', label: 'Sermons', icon: Mic },
      { href: '/dashboard/social', label: 'Social Media', icon: Share2 },
    ],
  },
  {
    section: 'Personalize',
    links: [
      { href: '/dashboard/author-voice', label: 'Author Voice', icon: User },
    ],
  },
  {
    section: 'History',
    links: [
      { href: '/dashboard/history', label: 'My Content', icon: History },
    ],
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-background-card border-r border-border">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center"
          >
            <Feather className="w-5 h-5 text-white" />
          </motion.div>
          <span className="text-lg font-bold text-foreground">
            ChristianWriter<span className="text-accent">.ai</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {sidebarLinks.map((section, sectionIndex) => (
          <div key={section.section} className="mb-6">
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="px-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2"
            >
              {section.section}
            </motion.h3>
            <ul className="space-y-1">
              {section.links.map((link, linkIndex) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sectionIndex * 0.1 + linkIndex * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-accent to-purple-500 text-white shadow-lg shadow-accent/20'
                          : 'text-foreground-muted hover:text-foreground hover:bg-background-elevated'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-indicator"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                        />
                      )}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border">
        <ul className="space-y-1">
          <li>
            <Link
              href="/dashboard/settings"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </li>
          <li>
            <button
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors"
              onClick={() => {
                // Handle sign out
              }}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
