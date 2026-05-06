import type { Viewport } from 'next';
import { Shippori_Mincho_B1 } from 'next/font/google';
import localFont from 'next/font/local';
import Script from 'next/script';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CompareTray } from '@/components/japandi';
import { ConsentBanner } from '@/components/consent/consent-banner';
import { getJourneyState, ANONYMOUS_INITIAL_STATE } from '@/lib/journey/queries';
import './globals.css';
import '../styles/typography.css';

const shippori = Shippori_Mincho_B1({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-editorial',
  display: 'swap',
});

const satoshi = localFont({
  src: '../fonts/Satoshi-Variable.ttf',
  variable: '--font-ui',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'Japanoma | Your Japan Ski Home Base, Made Clear',
    template: '%s | Japanoma',
  },
  description: 'A decision-aid platform helping Australian ski-lovers confidently decide whether to buy a home base in Northern Japan snow country.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    siteName: 'Japanoma',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

// Default viewport + theme-color for all pages. iOS Safari tints the
// dynamic-island safe area and bottom chrome with theme-color, so
// washi here makes interior pages (about, quiz, areas, content, contact)
// blend their cream background into the safe areas. Home overrides
// this with sumi so the dark hero blends up and down instead.
//
// viewport-fit=cover is set explicitly so env(safe-area-inset-*) is
// meaningful — used by the hero pocket to clear the iPhone home-
// indicator.
export const viewport: Viewport = {
  themeColor: '#F5F0E8',
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const authUser = user
    ? { name: (user.user_metadata?.name as string | undefined) ?? null, email: user.email ?? '' }
    : null;

  // Journey state for the Nav Map chip in the header.
  const journeyState = user
    ? await getJourneyState(user.id)
    : ANONYMOUS_INITIAL_STATE;

  // Analytics consent gate — Plausible only loads after explicit opt-in.
  // ConsentBanner renders if the user hasn't decided yet.
  const cookieStore = await cookies();
  const consent = cookieStore.get('analytics_consent')?.value;
  const analyticsAllowed = consent === 'granted';
  const consentDecided = consent === 'granted' || consent === 'declined';

  return (
    <html lang="en" className={`${shippori.variable} ${satoshi.variable}`}>
      <head>
        {analyticsAllowed && process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-ai focus:text-kinu focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>
        <Header user={authUser} journeyState={journeyState} />
        <main id="main-content" className="flex-1 pt-16">{children}</main>
        <Footer />
        <CompareTray />
        <ConsentBanner initialDecided={consentDecided} />
      </body>
    </html>
  );
}
