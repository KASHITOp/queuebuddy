'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFFCF2] text-[#111111] flex items-center justify-center p-4">
      <div className="flex items-center gap-2 font-mono text-xs font-bold">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FFD60A] animate-ping" />
        <span>Loading QueueBuddy...</span>
      </div>
    </div>
  );
}
