'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Account lives in the app's Profile tab now.
export default function AccountRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/#profile');
  }, [router]);

  return <div className="app-shell bg-night" />;
}
