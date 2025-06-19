// frontend/src/app/page.tsx
'use client'; // If you need to use useAuth or other client hooks directly on this page

import { useAuth } from '../contexts/AuthContext'; // Adjust path if needed
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
        Welcome to MyAppScaffold
      </h1>
      <p className="mt-6 text-lg leading-8 text-slate-300">
        This is your starting point for something amazing.
      </p>

      {isLoading ? (
        <p className="mt-10 text-slate-400">Loading user status...</p>
      ) : isAuthenticated && user ? (
        <div className="mt-10">
          <p className="text-xl text-sky-400">
            You are logged in as {user.email}.
          </p>
          <Link
            href="/protected" // Example protected page
            className="mt-6 inline-block rounded-md bg-sky-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            Go to Protected Page
          </Link>
        </div>
      ) : (
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/login"
            className="rounded-md bg-sky-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            Get started <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/about" // Example "Learn more" page
            className="text-sm font-semibold leading-6 text-slate-300 hover:text-white"
          >
            Learn more <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
