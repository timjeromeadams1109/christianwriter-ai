'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-background-card border-b border-border flex items-center px-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-foreground-muted hover:text-foreground rounded-lg hover:bg-background-elevated"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </motion.button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-64"
          >
            <div className="absolute top-4 right-4 z-10">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-foreground-muted hover:text-foreground rounded-lg hover:bg-background-elevated"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className={cn(
        'min-h-screen pt-16 lg:pt-0',
        'lg:pl-64'
      )}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 sm:p-6 lg:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
