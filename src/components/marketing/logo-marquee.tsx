'use client';

import { motion } from 'framer-motion';

// Church/ministry logo placeholders - in production these would be real logos
const logos = [
  { name: 'Grace Community', initials: 'GC' },
  { name: 'Saddleback Church', initials: 'SC' },
  { name: 'Life Church', initials: 'LC' },
  { name: 'Elevation Church', initials: 'EC' },
  { name: 'Hillsong', initials: 'HS' },
  { name: 'Bethel Church', initials: 'BC' },
  { name: 'North Point', initials: 'NP' },
  { name: 'Gateway Church', initials: 'GW' },
];

function LogoItem({ name, initials }: { name: string; initials: string }) {
  return (
    <div className="flex items-center gap-3 px-6 logo-grayscale">
      <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
        <span className="text-sm font-bold text-foreground/60">{initials}</span>
      </div>
      <span className="text-sm font-medium text-foreground/40 whitespace-nowrap">{name}</span>
    </div>
  );
}

export function LogoMarquee() {
  return (
    <section className="py-16 bg-background border-y border-border/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-sm font-medium text-foreground-muted uppercase tracking-wider"
        >
          Trusted by churches and ministries worldwide
        </motion.p>
      </div>

      <div className="marquee-container">
        <motion.div
          className="flex animate-marquee"
          style={{ width: 'fit-content' }}
        >
          {/* First set of logos */}
          {logos.map((logo, index) => (
            <LogoItem key={`first-${index}`} {...logo} />
          ))}
          {/* Duplicate for seamless loop */}
          {logos.map((logo, index) => (
            <LogoItem key={`second-${index}`} {...logo} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
