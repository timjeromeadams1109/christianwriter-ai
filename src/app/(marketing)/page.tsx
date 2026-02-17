import { Hero, Features, CTA } from '@/components/marketing';
import { LogoMarquee } from '@/components/marketing/logo-marquee';

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogoMarquee />
      <Features />
      <CTA />
    </>
  );
}
