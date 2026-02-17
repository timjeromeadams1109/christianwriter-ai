import { SermonForm } from '@/components/generators';

export default function SermonsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Sermon Outline Generator
        </h1>
        <p className="text-foreground-muted">
          Generate structured sermon outlines with theological accuracy
        </p>
      </div>

      <SermonForm />
    </div>
  );
}
