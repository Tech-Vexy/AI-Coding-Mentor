'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Suspense } from 'react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      setError("No authorization code found.");
      return;
    }

    const exchangeCode = async () => {
      try {
        // Critical Fix: include credentials to ensure the state cookie is sent for CSRF verification
        const response = await fetch(`http://localhost:8000/auth/callback?code=${code}&state=${state || ''}`, {
           credentials: 'include'
        });

        if (!response.ok) {
           const errText = await response.text();
           throw new Error(`Failed to authenticate with backend: ${errText}`);
        }

        const data = await response.json();

        if (data.session_token) {
           setSession(data.session_token, data.user);
           router.push('/');
        } else {
           throw new Error("No session token received.");
        }
      } catch (e: any) {
         setError(e.message || "An error occurred during authentication.");
      }
    };

    exchangeCode();
  }, [searchParams, router, setSession]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-red-500">
         Error: {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Authenticating...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}
