import { AuthorVoiceForm } from '@/components/generators';

export default function AuthorVoicePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Author Voice
        </h1>
        <p className="text-foreground-muted">
          Train the AI to match your unique writing style
        </p>
      </div>

      <AuthorVoiceForm />
    </div>
  );
}
