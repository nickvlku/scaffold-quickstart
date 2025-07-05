// frontend/src/app/(auth)/reset-password/[uid]/[token]/page.tsx
'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // useParams for dynamic route segments
import { useAuth } from '../../../../../contexts/AuthContext'; // Adjust path
import Link from 'next/link';

// Helper component to access params, as useParams is a hook
function ResetPasswordConfirmContent() {
  const router = useRouter();
  const params = useParams(); // Gets { uid: '...', token: '...' }
  const { resetPasswordConfirm, isLoading, error, clearError } = useAuth();

  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const uid = typeof params.uid === 'string' ? params.uid : '';
  const token = typeof params.token === 'string' ? params.token : '';

  useEffect(() => {
    if (!uid || !token) {
      // This case should ideally not happen if route matching is correct
      setFormError('Invalid password reset link. UID or Token is missing.');
    }
  }, [uid, token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (error) clearError();
    setFormError(null);
    setSuccessMessage(null);

    if (!uid || !token) {
      setFormError('Invalid password reset link. Please request a new one.');
      return;
    }

    if (newPassword1 !== newPassword2) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      await resetPasswordConfirm({
        uid,
        token,
        password1: newPassword1,
        password2: newPassword2,
      });
      setSuccessMessage(
        'Your password has been reset successfully! Redirecting to login...'
      );
      setTimeout(() => {
        router.push('/login?password_reset_success=true');
      }, 3000); // Redirect after 3 seconds
    } catch (err) {
      // Error is already set in AuthContext (e.g., "link invalid or expired")
      // setFormError("Failed to reset password. The link might be invalid or expired.");
      console.error('Reset password confirm error:', err);
    }
  };

  if (successMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-center">
        <div className="w-full max-w-md space-y-6  bg-slate-800/70 backdrop-blur-md p-8 shadow-2xl rounded-xl">
          <h2 className="text-2xl font-bold text-green-400">
            Password Reset Successful!
          </h2>
          <p className="text-slate-300">{successMessage}</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const displayError = formError || error; // Prioritize local form error

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Reset Your Password
          </h2>
        </div>

        <div className="bg-slate-800/70 backdrop-blur-md p-8 shadow-2xl rounded-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="new_password1"
                className="block text-sm font-medium text-slate-300"
              >
                New Password
              </label>
              <input
                id="new_password1"
                name="new_password1"
                type="password"
                required
                value={newPassword1}
                onChange={(e) => setNewPassword1(e.target.value)}
                className="mt-1 block w-full appearance-none rounded-lg border border-slate-600 bg-slate-700 px-3 py-3 text-white placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label
                htmlFor="new_password2"
                className="block text-sm font-medium text-slate-300"
              >
                Confirm New Password
              </label>
              <input
                id="new_password2"
                name="new_password2"
                type="password"
                required
                value={newPassword2}
                onChange={(e) => setNewPassword2(e.target.value)}
                className="mt-1 block w-full appearance-none rounded-lg border border-slate-600 bg-slate-700 px-3 py-3 text-white placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            {displayError && (
              <div className="rounded-md bg-red-500/20 p-3">
                <p className="text-sm text-red-400">{displayError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !uid || !token}
              className="flex w-full justify-center rounded-lg bg-sky-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-60"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  // This page uses dynamic route params, so Suspense for `useParams` is good practice
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
          Loading form...
        </div>
      }
    >
      <ResetPasswordConfirmContent />
    </Suspense>
  );
}
