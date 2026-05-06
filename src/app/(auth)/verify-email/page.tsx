import Link from 'next/link';
import { AuthShell } from '../components/auth-shell';

export const metadata = { title: 'Check your email' };

interface VerifyEmailPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const error = params.error;

  if (error) {
    return (
      <AuthShell
        overline="Verify email"
        heading="Verification failed"
        subtitle={error}
        footerLinks={
          <p className="text-xs text-stone">
            Want to start over?{' '}
            <Link href="/signup" className="text-ai underline underline-offset-[3px]">
              Sign up again →
            </Link>
          </p>
        }
      >
        <p className="text-sm text-sumi-light leading-body">
          The verification link may have expired or already been used. Try signing up
          again, or sign in if you already verified your email.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      overline="Verify email"
      heading="Check your email"
      subtitle="We sent a verification link to your inbox."
      footerLinks={
        <p className="text-xs text-stone">
          Didn&apos;t receive it? Check your spam folder, or{' '}
          <Link href="/signup" className="text-ai underline underline-offset-[3px]">
            try signing up again →
          </Link>
        </p>
      }
    >
      <p className="text-sm text-sumi-light leading-body">
        Click the link in your email to confirm your account and start exploring.
      </p>
    </AuthShell>
  );
}
