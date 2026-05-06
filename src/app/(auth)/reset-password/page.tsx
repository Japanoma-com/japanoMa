import Link from 'next/link';
import { ResetPasswordForm } from './reset-password-form';
import { AuthShell } from '../components/auth-shell';

export const metadata = { title: 'Choose a new password' };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      overline="Reset password"
      heading="Choose a new password"
      footerLinks={
        <p className="text-xs text-stone">
          Remembered it?{' '}
          <Link href="/login" className="text-ai underline underline-offset-[3px]">
            Sign in →
          </Link>
        </p>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
