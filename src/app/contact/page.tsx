import { ContactForm } from './contact-form';
import { MaDivider, ScrollReveal } from '@/components/japandi';

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with Go&C Partners. No pressure, no sales pitch. Just practical guidance about Japan ski properties.',
};

// Area slug → display name mapping for context banner
const AREA_NAMES: Record<string, string> = {
  niseko: 'Niseko',
  hakuba: 'Hakuba',
  nozawa: 'Nozawa Onsen',
  myoko: 'Myoko',
  furano: 'Furano',
  rusutsu: 'Rusutsu',
  shiga: 'Shiga Kogen',
  madarao: 'Madarao',
  togari: 'Togari Onsen',
};

interface ContactPageProps {
  searchParams: Promise<{ area?: string; source?: string }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const area = params.area ?? null;
  const source = params.source ?? null;

  const areaName = area ? (AREA_NAMES[area] ?? area) : null;

  return (
    <div className="ma-page px-ma-6 py-ma-24">
      <div className="ma-content mx-auto">
        <ScrollReveal>
          <p className="label-overline text-stone mb-ma-4">Contact</p>
          <h1 className="mb-ma-6">Start a conversation.</h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-sumi-light leading-body mb-ma-3 max-w-xl">
            Have questions about owning a ski home base in Northern Japan?
            We&apos;re here with practical guidance. No pressure, no sales pitch.
          </p>
          <p className="text-[13px] text-stone leading-relaxed mb-ma-12 max-w-xl">
            Replies within 48 hours. You choose when (and whether) to engage further.
          </p>
        </ScrollReveal>

        {source && source !== 'quiz' && areaName && (
          <ScrollReveal delay={150}>
            <div className="mb-ma-8 inline-flex items-center gap-ma-2 bg-ai/8 px-ma-4 py-ma-2 rounded-full">
              <span className="w-[5px] h-[5px] rounded-full bg-ai" aria-hidden />
              <p className="text-[12px] font-medium text-ai-deep tracking-tight">
                Enquiring about {areaName}
              </p>
            </div>
          </ScrollReveal>
        )}

        <MaDivider size="breath" line />

        <ScrollReveal delay={200}>
          <ContactForm
            defaultArea={area}
            defaultAreaName={areaName}
            source={source ?? undefined}
          />
        </ScrollReveal>
      </div>
    </div>
  );
}
