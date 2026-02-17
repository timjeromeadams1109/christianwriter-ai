import { DevotionalForm } from '@/components/generators';

export default function DevotionalsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Devotional Generator
        </h1>
        <p className="text-foreground-muted">
          Create meaningful daily devotionals with Scripture at the center
        </p>
      </div>

      <DevotionalForm />
    </div>
  );
}
