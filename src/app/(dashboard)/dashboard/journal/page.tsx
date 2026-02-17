import { JournalSeriesForm } from '@/components/generators/journal-series-form';

export default function JournalPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Devotional & Prayer Journal Series
        </h1>
        <p className="text-foreground-muted">
          Create multi-day devotional series or guided prayer journals
        </p>
      </div>

      <JournalSeriesForm />
    </div>
  );
}
