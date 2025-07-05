// frontend/src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

export default function Navbar() {
  // CORRECT: Call useAuth() at the top level of the function component.
  // Make sure you are destructuring `logout` (and renamed it if needed).
  const { isAuthenticated, user, logout: contextLogout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // CORRECT: Use `contextLogout` which was obtained from the top-level useAuth() call.
      await contextLogout();
      router.push('/');
    } catch (error) {
      console.error('Navbar: Error during handleLogout:', error);
      router.push('/'); // Still redirect
    }
  };

  return (
    <nav className="bg-slate-800 text-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-sky-400 hover:text-sky-300"
            >
              MyAppScaffold
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isLoading ? (
                <div className="animate-pulse h-6 w-24 bg-slate-700 rounded"></div>
              ) : isAuthenticated && user ? (
                <>
                  <span className="mr-4 text-sm text-slate-300">
                    Welcome, {user.email}
                  </span>
                  <button
                    onClick={handleLogout} // Calls the handleLogout defined above
                    className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-x-2">
                  <Link
                    href="/login"
                    className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
