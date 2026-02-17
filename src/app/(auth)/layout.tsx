import Link from 'next/link';
import { Feather } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple Header */}
      <header className="h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Feather className="w-5 h-5 text-background" />
          </div>
          <span className="text-lg font-bold text-foreground">
            ChristianWriter<span className="text-accent">.ai</span>
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
