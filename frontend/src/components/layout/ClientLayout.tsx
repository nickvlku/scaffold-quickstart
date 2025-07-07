// frontend/src/components/layout/ClientLayout.tsx
'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from '../../contexts/ToastContext';
import Navbar from './Navbar';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  email_verified_at?: string | null;
  // Add other user fields as needed
}

interface InitialAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface ClientLayoutProps {
  children: ReactNode;
  initialAuthState: InitialAuthState;
}

export default function ClientLayout({ children, initialAuthState }: ClientLayoutProps) {
  console.log('[ClientLayout] Rendering with initial auth state:', {
    isAuthenticated: initialAuthState.isAuthenticated,
    hasUser: !!initialAuthState.user,
    isLoading: initialAuthState.isLoading
  });

  return (
    <AuthProvider initialAuthState={initialAuthState}>
      <ToastProvider>
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </ToastProvider>
    </AuthProvider>
  );
}