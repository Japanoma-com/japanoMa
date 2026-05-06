'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  recordConsentAndCreateLead,
  createLeadWithExistingConsent,
  withdrawLead,
} from '../lead-actions';
import type { ProfileSnapshot } from '@/lib/validations/lead-capture';
import { AreaCardFrame } from '@/components/japandi/area-card-frame';
import { Spinner } from '@/components/japandi/spinner';
import { ConsentModal } from './consent-modal';
import { useInterestHash } from './interest-hash-handler';

type CardState =
  | { kind: 'default' }
  | { kind: 'submitting' }
  | { kind: 'active'; leadId: string }
  | { kind: 'withdrawing' }
  | { kind: 'error'; message: string };

type Props = {
  variant: 'hero' | 'half';
  topMatchBadge?: boolean;
  cityName: string;
  prefectureName: string;
  citySlug: string;
  prefectureSlug: string;
  score: number;
  explanation: string;
  heroImagePath: string | null;
  profileSnapshot: ProfileSnapshot;

  // Server-provided state
  hasActiveConsent: boolean;
  initialLead: { id: string } | null; // non-null if an active lead already exists for this area
  consentVersion: string;
  consentBody: string;
};

function errorMessageFor(error: string): string {
  switch (error) {
    case 'not_authenticated':
      return 'Please sign in to continue.';
    case 'invalid_input':
      return 'Something went wrong with your request. Please refresh and try again.';
    case 'no_active_consent':
      return 'Your consent has expired. Please re-consent to continue.';
    case 'consent_version_not_found':
      return 'The consent form has been updated. Please refresh the page.';
    case 'already_interested':
      return "You've already expressed interest in this area.";
    case 'database_error':
      return 'We could not record your interest. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

function CheckmarkIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-ai)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function AreaCard(props: Props) {
  const router = useRouter();
  const [state, setState] = useState<CardState>(() =>
    props.initialLead ? { kind: 'active', leadId: props.initialLead.id } : { kind: 'default' }
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hashSlug = useInterestHash();
  const autoOpen = hashSlug === props.citySlug;

  // Auto-open the modal when hash matches and the user has NO active consent.
  useEffect(() => {
    if (autoOpen && !props.hasActiveConsent && state.kind === 'default') {
      setModalOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  // Auto-fire path: when #interest matches AND user already has active consent,
  // fire createLeadWithExistingConsent directly. No modal needed.
  useEffect(() => {
    if (autoOpen && props.hasActiveConsent && state.kind === 'default' && !isPending) {
      // setState BEFORE startTransition so the spinner state is an urgent
      // update and renders immediately. Inside startTransition it would be
      // marked non-urgent and React would skip it — the UI would stay on the
      // default button until the server action returned, giving no feedback.
      setState({ kind: 'submitting' });
      startTransition(async () => {
        const result = await createLeadWithExistingConsent({
          areaSlug: props.citySlug,
          prefectureSlug: props.prefectureSlug,
          profileSnapshot: props.profileSnapshot,
        });
        if ('success' in result) {
          setState({ kind: 'active', leadId: result.leadId });
          router.refresh();
        } else {
          setState({ kind: 'error', message: errorMessageFor(result.error) });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  const areaLabel = `${props.cityName}, ${props.prefectureName}`;

  const handleExpressInterest = () => {
    if (props.hasActiveConsent) {
      // setState BEFORE startTransition so the spinner shows immediately
      // (urgent update). Inside startTransition, React would defer the
      // state update until the transition resolved, so the user would see
      // no feedback during the ~200ms server action — making it feel like
      // the click did nothing. The fix: flip to 'submitting' synchronously,
      // THEN start the async work as a transition.
      setState({ kind: 'submitting' });
      startTransition(async () => {
        const result = await createLeadWithExistingConsent({
          areaSlug: props.citySlug,
          prefectureSlug: props.prefectureSlug,
          profileSnapshot: props.profileSnapshot,
        });
        if ('success' in result) {
          setState({ kind: 'active', leadId: result.leadId });
          router.refresh();
        } else {
          setState({ kind: 'error', message: errorMessageFor(result.error) });
        }
      });
    } else {
      setModalError(null);
      setModalOpen(true);
    }
  };

  const handleConsentConfirm = () => {
    startTransition(async () => {
      setModalError(null);
      const result = await recordConsentAndCreateLead({
        areaSlug: props.citySlug,
        prefectureSlug: props.prefectureSlug,
        profileSnapshot: props.profileSnapshot,
        consentTextVersion: props.consentVersion,
      });
      if ('success' in result) {
        setModalOpen(false);
        setState({ kind: 'active', leadId: result.leadId });
        router.refresh();
      } else {
        setModalError(errorMessageFor(result.error));
      }
    });
  };

  const handleWithdraw = () => {
    if (state.kind !== 'active') return;
    const confirmed = window.confirm(
      `Withdraw your interest in ${areaLabel}? We will not contact you about this area.`
    );
    if (!confirmed) return;

    const leadId = state.leadId;
    // Same urgency fix as handleExpressInterest — flip to 'withdrawing'
    // synchronously so the Withdrawing… spinner shows immediately, then
    // run the server action inside startTransition.
    setState({ kind: 'withdrawing' });
    startTransition(async () => {
      const result = await withdrawLead(leadId);
      if ('success' in result) {
        setState({ kind: 'default' });
        router.refresh();
      } else {
        setState({ kind: 'error', message: errorMessageFor(result.error) });
      }
    });
  };

  const borderColor = state.kind === 'active' ? 'active' : 'default';

  // Use inline-flex from the start so spinner + text always align correctly,
  // including in the submitting state. Hero variant fills the card width;
  // half variant hugs its content.
  const baseButtonClass =
    'inline-flex items-center justify-center gap-ma-2 bg-ai text-kinu text-sm font-semibold tracking-wide rounded-lg hover:bg-ai-deep transition-colors disabled:opacity-80 disabled:cursor-wait';
  const buttonClass =
    props.variant === 'hero'
      ? `${baseButtonClass} w-full h-12`
      : `${baseButtonClass} px-ma-6 h-10`;

  return (
    <>
      <AreaCardFrame
        variant={props.variant}
        cityName={props.cityName}
        prefectureName={props.prefectureName}
        score={props.score}
        explanation={props.explanation}
        topMatchBadge={props.topMatchBadge}
        borderColor={borderColor}
        heroImagePath={props.heroImagePath}
        citySlug={props.citySlug}
        id={`area-card-${props.citySlug}`}
      >
        {state.kind === 'default' && (
          <button
            type="button"
            onClick={handleExpressInterest}
            className={`${buttonClass} animate-fade-in`}
          >
            <span>Express interest →</span>
          </button>
        )}

        {state.kind === 'submitting' && (
          <button type="button" disabled className={`${buttonClass} animate-fade-in`}>
            <Spinner size="md" />
            <span>Recording…</span>
          </button>
        )}

        {(state.kind === 'active' || state.kind === 'withdrawing') && (
          <div
            role="status"
            className="flex items-start gap-ma-3 pt-1 animate-fade-in"
          >
            <CheckmarkIcon />
            <div>
              <p className="text-sm font-medium text-sumi">Interest recorded</p>
              <p className="mt-[2px] text-[11px] text-stone leading-relaxed">
                We&apos;ll introduce you within 48 hours.
              </p>
              {state.kind === 'active' && (
                <button
                  type="button"
                  onClick={handleWithdraw}
                  className="mt-ma-2 text-[10px] text-stone underline underline-offset-[3px] hover:text-beni transition-colors duration-base ease-settle"
                >
                  Withdraw
                </button>
              )}
              {state.kind === 'withdrawing' && (
                <span className="mt-ma-2 inline-flex items-center gap-ma-2 text-[10px] text-stone">
                  <Spinner size="sm" />
                  Withdrawing…
                </span>
              )}
            </div>
          </div>
        )}

        {state.kind === 'error' && (
          <div className="animate-fade-in">
            <p className="mb-ma-3 text-[11px] text-beni">{state.message}</p>
            <button
              type="button"
              onClick={() => setState({ kind: 'default' })}
              className={buttonClass}
            >
              <span>Try again</span>
            </button>
          </div>
        )}
      </AreaCardFrame>

      <ConsentModal
        isOpen={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConsentConfirm}
        consentBody={props.consentBody}
        consentVersion={props.consentVersion}
        areaLabel={areaLabel}
        isSubmitting={isPending}
        errorMessage={modalError}
      />
    </>
  );
}
