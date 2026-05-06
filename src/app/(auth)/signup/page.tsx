import Link from 'next/link';
import { SignupForm } from './signup-form';
import { AuthShell } from '../components/auth-shell';

export const metadata = { title: 'Create your account' };

interface SignupPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const next = params.next ?? null;

  return (
    <AuthShell
      overline="Create account"
      heading="Get started"
      subtitle="Five minutes, no payment details."
      footerLinks={
        <p className="text-xs text-stone">
          Already have one?{' '}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
            className="text-ai underline underline-offset-[3px]"
          >
            Sign in →
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
