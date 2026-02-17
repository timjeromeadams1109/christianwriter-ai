import { DashboardLayout } from '@/components/layout';

// Note: Add SessionProvider wrapper here when database is configured
// import { SessionProvider } from 'next-auth/react';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
