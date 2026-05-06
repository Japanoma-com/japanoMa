import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { followUpSurveys } from '@/lib/db/schema';
import { SurveyForm } from './survey-form';

export const metadata = {
  title: 'Japanoma — your check-in',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ token: string }> };

export default async function SurveyPage({ params }: Props) {
  const { token } = await params;
  if (!token || token.length < 10) notFound();

  const rows = await db
    .select({
      id: followUpSurveys.id,
      token: followUpSurveys.token,
      completedAt: followUpSurveys.completedAt,
      recipientName: followUpSurveys.recipientName,
      context: followUpSurveys.context,
    })
    .from(followUpSurveys)
    .where(eq(followUpSurveys.token, token))
    .limit(1);
  const survey = rows[0];

  if (!survey) notFound();

  return (
    <div className="ma-page px-ma-6 py-ma-24">
      <div className="ma-content mx-auto">
        <p className="label-overline text-stone mb-ma-4">Japanoma check-in</p>
        <h1 className="text-3xl font-editorial text-sumi mb-ma-6">
          {survey.completedAt
            ? 'Thanks — we already have your answers.'
            : `How did it go${survey.recipientName ? `, ${survey.recipientName}` : ''}?`}
        </h1>

        {survey.completedAt ? (
          <p className="text-sumi-light leading-relaxed">
            This link has already been used. If you&apos;d like to add more context,
            reply to the original email and we&apos;ll pick it up from there.
          </p>
        ) : (
          <>
            <p className="text-sumi-light leading-relaxed mb-ma-12 max-w-2xl">
              A quick two minutes on how your conversation with the local agent
              went. Your responses stay private; we use them only to improve
              matchmaking for future buyers.
            </p>
            <SurveyForm token={survey.token} />
          </>
        )}
      </div>
    </div>
  );
}
