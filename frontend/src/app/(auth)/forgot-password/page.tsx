// frontend/src/app/(auth)/forgot-password/page.tsx
'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path
import Link from 'next/link';

function ForgotPasswordContent() {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (error) clearError();
    setMessage(null);

    try {
      await forgotPassword({ email });
      setMessage(
        'If an account with that email exists, a password reset link has been sent. Please check your inbox (and spam folder).'
      );
    } catch (err) {
      // Error is already set in AuthContext and will be shown by `error` variable,
      // or you can set a custom message here.
      // For this flow, we usually don't want to indicate if the email was found or not.
      // So, the generic message is often preferred even on error.
      setMessage(
        'If an account with that email exists, a password reset link has been sent. Please check your inbox (and spam folder).'
      );
      // Or, if you want to show the specific error from context:
      // setMessage(null); // Clear local message so context error shows
      console.error("Forgot password submission error:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            No worries! Enter your email address below and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="bg-slate-800/70 backdrop-blur-md p-8 shadow-2xl rounded-xl">
          {!message ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-lg border border-slate-600 bg-slate-700 px-3 py-3 text-white placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {error && ( // Display error from AuthContext if any
                <div className="rounded-md bg-red-500/20 p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-lg bg-sky-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-60"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-lg text-green-400">{message}</p>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-slate-400">
            Remember your password?{' '}
            <Link href="/login" className="font-medium text-sky-400 hover:text-sky-300">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


export default function ForgotPasswordPage() {
    return (
        // Suspense isn't strictly needed here as this page doesn't use useSearchParams directly for its core logic
        // but can be kept for consistency if other (auth) pages use it.
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">Loading...</div>}>
            <ForgotPasswordContent />
        </Suspense>
    )
}