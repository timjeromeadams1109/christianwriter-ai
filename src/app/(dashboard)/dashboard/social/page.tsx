import { SocialForm } from '@/components/generators';

export default function SocialPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Social Media Generator
        </h1>
        <p className="text-foreground-muted">
          Craft engaging posts optimized for each platform
        </p>
      </div>

      <SocialForm />
    </div>
  );
}
