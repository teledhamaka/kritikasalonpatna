// app/providers.tsx
'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { BookingProvider } from '../context/BookingContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <BookingProvider>
        {children}
      </BookingProvider>
    </AuthProvider>
  );
}