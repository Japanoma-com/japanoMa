import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ScrollReveal } from '@/components/japandi';
import { LocalStorageSync } from './local-storage-sync';
import { InterestHashProvider } from './components/interest-hash-handler';
import { AccountShell } from './components/account-shell';
import { ConciergeSidebar } from './components/concierge-sidebar';
import { AccountHero } from './components/account-hero';
import { RecommendedAreasGrid } from './components/recommended-areas-grid';
import { SavedItemsSection } from './components/saved-items-section';
import { QuizPromptCard } from './components/quiz-prompt-card';
import {
  getUserQuizProfile,
  getUserSavesCount,
  getUserSaves,
} from '@/lib/account/queries';
import { getJourneyState } from '@/lib/journey/queries';
import { NotesByPhase } from '@/components/journey/notes-by-phase';
import { ExternalBookmarks } from '@/components/journey/external-bookmarks';
import { JourneyExport } from '@/components/journey/journey-export';
import {
  getActiveConsent,
  getActiveLeads,
  getActiveConsentTextVersion,
} from '@/lib/lead-capture/queries';
import { getLatestAcknowledgments } from '@/lib/policies/queries';

export const metadata = {
  title: 'Your account',
};

// Force dynamic rendering so revalidatePath('/account') from server actions
// (recordConsentAndCreateLead, withdrawLead, etc.) actually invalidates the
// page on every successful mutation.
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/account');
  }

  const displayName = (user.user_metadata?.name as string | undefined) ?? '';
  const email = user.email ?? '';
  const firstName = displayName.split(' ')[0] || 'there';
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
    : '';

  const [
    quizProfile,
    activeConsent,
    activeLeads,
    consentTextVersion,
    savesCount,
    savedItems,
    journeyState,
    acknowledgments,
  ] = await Promise.all([
    getUserQuizProfile(user.id),
    getActiveConsent(user.id),
    getActiveLeads(user.id),
    getActiveConsentTextVersion(),
    getUserSavesCount(user.id),
    getUserSaves(user.id),
    getJourneyState(user.id),
    getLatestAcknowledgments(user.id),
  ]);

  const activeLeadsByArea = new Map(activeLeads.map((lead) => [lead.areaSlug, lead]));
  const hasActiveConsent = activeConsent !== null;
  const quizComplete = quizProfile !== null;
  const recommendedCount = quizProfile?.recommendedAreas.length ?? 0;
  const interestCount = activeLeads.length;

  const sidebar = (
    <ConciergeSidebar
      name={displayName}
      email={email}
      memberSince={memberSince}
      quizComplete={quizComplete}
      recommendedCount={recommendedCount}
      interestCount={interestCount}
      savesCount={savesCount}
      hasActiveConsent={hasActiveConsent}
      acknowledgments={acknowledgments}
    />
  );

  const main = (
    <>
      {/* Hero — combines welcome + journey state + primary CTA + stepper */}
      <AccountHero
        firstName={firstName}
        quizComplete={quizComplete}
        recommendedCount={recommendedCount}
        journeyState={journeyState}
      />

      {/* Recommendations — anchor for "Express interest" hero CTA */}
      <ScrollReveal index={0}>
        <section id="recommendations" className="mb-ma-16 scroll-mt-24">
          <p className="label-overline text-stone mb-ma-2">Your matches</p>
          <h2 className="font-editorial text-2xl text-sumi leading-tight mb-ma-2">
            {quizComplete ? 'Recommended areas' : 'Discover your areas'}
          </h2>
          <p className="text-sm text-sumi-light leading-relaxed mb-ma-6 max-w-md">
            {quizComplete
              ? 'Ranked by fit. Express interest in any to be introduced to a Japanese partner within 48 hours.'
              : 'The five-minute quiz unlocks personalised recommendations grounded in your goals and trade-offs.'}
          </p>
          {quizProfile ? (
            <RecommendedAreasGrid
              areas={quizProfile.recommendedAreas}
              profile={quizProfile.profile}
              hasActiveConsent={hasActiveConsent}
              activeLeadsByArea={activeLeadsByArea}
              consentVersion={consentTextVersion.version}
              consentBody={consentTextVersion.body}
            />
          ) : (
            <QuizPromptCard />
          )}
        </section>
      </ScrollReveal>

      <ScrollReveal index={1}>
        <SavedItemsSection items={savedItems} />
      </ScrollReveal>

      <ScrollReveal index={2}>
        <NotesByPhase userId={user.id} currentPhase={journeyState.phase} />
      </ScrollReveal>

      <ScrollReveal index={3}>
        <ExternalBookmarks userId={user.id} />
      </ScrollReveal>

      <ScrollReveal index={4}>
        <JourneyExport />
      </ScrollReveal>
    </>
  );

  return (
    <InterestHashProvider>
      <LocalStorageSync />
      <AccountShell sidebar={sidebar} main={main} />
    </InterestHashProvider>
  );
}
