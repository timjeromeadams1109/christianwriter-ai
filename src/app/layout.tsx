import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ChristianWriter.ai - AI-Powered Christian Writing Tools',
  description: 'Create devotionals, sermons, and social media content with AI that keeps Scripture at the center. Built for pastors, ministry leaders, and Christian content creators.',
  keywords: ['Christian writing', 'AI writing assistant', 'devotional generator', 'sermon outline', 'ministry tools'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-background`}>
        {children}
      </body>
    </html>
  );
}
