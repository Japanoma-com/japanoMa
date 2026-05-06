import Link from 'next/link';
import { ForgotPasswordForm } from './forgot-password-form';
import { AuthShell } from '../components/auth-shell';

export const metadata = { title: 'Reset password' };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      overline="Reset password"
      heading="Forgot your password?"
      subtitle="We'll send you a reset link."
      footerLinks={
        <p className="text-xs text-stone">
          Remember it?{' '}
          <Link href="/login" className="text-ai underline underline-offset-[3px]">
            Sign in →
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
