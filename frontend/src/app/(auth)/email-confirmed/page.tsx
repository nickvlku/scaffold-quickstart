// frontend/src/app/(auth)/email-confirmed/page.tsx
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path
import { useEffect, Suspense } from 'react';

function EmailConfirmedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchUser, isAuthenticated, user, isLoading } = useAuth(); // fetchUser to refresh state

  // The backend handles actual verification. This page just shows status.
  // If ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION=true, user might already be logged in.
  // We call fetchUser to ensure our AuthContext is up-to-date.
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Optional: Check for specific query params from allauth redirect if needed
  // const verificationStatus = searchParams.get('status'); // e.g. 'success', 'failed_already_active'
  // For now, assume success if they land here.

  const handleContinue = () => {
    // Redirect to a protected page or dashboard
    router.push(isAuthenticated && user ? '/protected' : '/login');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-center text-white">
        <h1 className="text-2xl font-bold">Verifying...</h1>
        <p className="text-slate-300">Please wait while we update your account status.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-center text-white">
       <div className="w-full max-w-md space-y-6 bg-slate-800/70 backdrop-blur-md p-8 shadow-2xl rounded-xl">
        <h1 className="text-2xl font-bold text-green-400">Email Verified Successfully!</h1>
        {isAuthenticated && user ? (
          <p className="text-slate-300">Welcome, {user.email}! You are now logged in.</p>
        ) : (
          <p className="text-slate-300">Your email address has been confirmed. Please log in to continue.</p>
        )}
        <button
          onClick={handleContinue}
          className="mt-6 w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          {isAuthenticated && user ? 'Go to Dashboard' : 'Proceed to Login'}
        </button>
      </div>
    </div>
  );
}


export default function EmailConfirmedPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">Loading status...</div>}>
            <EmailConfirmedContent />
        </Suspense>
    )
}