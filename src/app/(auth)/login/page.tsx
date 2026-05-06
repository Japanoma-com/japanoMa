import Link from 'next/link';
import { LoginForm } from './login-form';
import { AuthShell } from '../components/auth-shell';

export const metadata = { title: 'Sign in' };

interface LoginPageProps {
  searchParams: Promise<{ next?: string; message?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next ?? null;
  const message = params.message ?? null;

  return (
    <AuthShell
      overline="Sign in"
      heading="Welcome back"
      footerLinks={
        <div className="space-y-ma-3">
          <p className="text-xs text-stone">
            Need an account?{' '}
            <Link
              href={next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'}
              className="text-ai underline underline-offset-[3px]"
            >
              Create one →
            </Link>
          </p>
          <p className="text-xs text-stone">
            <Link href="/forgot-password" className="text-ai underline underline-offset-[3px]">
              Forgot password?
            </Link>
          </p>
        </div>
      }
    >
      {message === 'password-updated' && (
        <p className="mb-ma-4 text-xs text-matsu">
          Password updated. Sign in with your new password.
        </p>
      )}
      <LoginForm next={next} />
    </AuthShell>
  );
}
