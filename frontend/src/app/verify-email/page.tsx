// frontend/src/app/(auth)/verify-email/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const {
    resendVerificationEmail,
    isLoading,
    error,
    clearError,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  // Effect to redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isAuthLoading, router, searchParams]);

  // If already authenticated and redirecting, show a loading message
  if (isAuthenticated && !isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
        Redirecting...
      </div>
    );
  }

  if (!email) {
    // Maybe redirect to signup or show an error
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-slate-300 mb-6">
          No email address provided for verification.
        </p>
        <Link
          href="/signup"
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          Go to Signup
        </Link>
      </div>
    );
  }

  const handleResend = async () => {
    if (error) clearError();
    setMessage(null);
    try {
      await resendVerificationEmail({ email });
      setMessage(
        `A new verification email has been sent to ${email}. Please check your inbox (and spam folder).`
      );
    } catch (_e) {
      // Error is set in AuthContext, but we can show a generic message here too
      setMessage('Failed to resend email. Please try again later.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-center text-white">
      <div className="w-full max-w-md space-y-6 bg-slate-800/70 backdrop-blur-md p-8 shadow-2xl rounded-xl">
        <h1 className="text-2xl font-bold">Verify Your Email</h1>
        <p className="text-slate-300">
          Thanks for signing up! A verification email has been sent to{' '}
          <strong className="text-sky-400">{decodeURIComponent(email)}</strong>.
        </p>
        <p className="text-slate-300">
          Please click the link in the email to activate your account.
        </p>

        {message && (
          <p
            className={`mt-4 text-sm ${error ? 'text-red-400' : 'text-green-400'}`}
          >
            {message}
          </p>
        )}
        {error && !message && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}

        <button
          onClick={handleResend}
          disabled={isLoading}
          className="mt-6 w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
        >
          {isLoading ? 'Sending...' : 'Resend Verification Email'}
        </button>
        <p className="mt-4 text-sm text-slate-400">
          Already verified or link expired?{' '}
          <Link
            href="/login"
            className="font-medium text-sky-400 hover:text-sky-300"
          >
            Try Logging In
          </Link>
        </p>
        <p className="mt-2 text-sm text-slate-400">
          <Link
            href="/"
            className="font-medium text-sky-400 hover:text-sky-300"
          >
            Back to Homepage
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
          Loading email...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
