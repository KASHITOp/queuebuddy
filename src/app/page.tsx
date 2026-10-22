'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Booking, Office, OfficeType, Service } from '@/types';
import { BackStackProvider } from '@/components/shell/BackStack';
import { TabBar, AppTab } from '@/components/shell/TabBar';
import { Toaster } from '@/components/shell/Toaster';
import { Onboarding } from '@/components/shell/Onboarding';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { ExploreScreen } from '@/components/screens/ExploreScreen';
import { QueueScreen } from '@/components/screens/QueueScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { OfficeSheet } from '@/components/offices/OfficeSheet';
import { BookingFlow } from '@/components/booking/BookingFlow';
import { applyNativeSystemBars } from '@/lib/capacitor';

const ONBOARDED_KEY = 'qb_onboarded';
const TAB_IDS: AppTab[] = ['home', 'explore', 'queue', 'profile'];

interface FlowState {
  office?: Office;
  service?: Service;
}

/** Brand splash: also what the static HTML shows before React takes over, so launch never flashes white. */
const Splash = () => (
  <div className="app-shell bg-night flex flex-col items-center justify-center">
    <div className="w-20 h-20 rounded-[24px] bg-brand text-night font-display font-black text-[40px] flex items-center justify-center shadow-glow">
      Q
    </div>
    <div className="mt-5 font-display font-extrabold text-[22px] text-ink tracking-tight">QueueBuddy</div>
  </div>
);

export default function CustomerApp() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [onboarded, setOnboarded] = useState(true);
  const [tab, setTab] = useState<AppTab>('home');
  const [category, setCategory] = useState<OfficeType | 'all'>('all');
  const [sheetOffice, setSheetOffice] = useState<Office | null>(null);
  const [flow, setFlow] = useState<FlowState | null>(null);
  const [queueId, setQueueId] = useState<string | null>(null);

  useEffect(() => {
    try {
      setOnboarded(localStorage.getItem(ONBOARDED_KEY) === '1');
    } catch {
      setOnboarded(true);
    }
    const hashTab = window.location.hash.replace('#', '') as AppTab;
    if (TAB_IDS.includes(hashTab)) setTab(hashTab);
    applyNativeSystemBars();
    setMounted(true);
  }, []);

  const finishOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDED_KEY, '1');
    } catch {
      // Private mode: onboarding just shows again next launch.
    }
    setOnboarded(true);
  };

  const openBooking = (office?: Office, service?: Service) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSheetOffice(null);
    setFlow({ office: office?.status === 'bookable' ? office : undefined, service });
  };

  const handleBooked = (booking: Booking) => {
    setFlow(null);
    setQueueId(booking.id);
    setTab('queue');
  };

  const browseCategory = (c: OfficeType | 'all') => {
    setCategory(c);
    setTab('explore');
  };

  // Android back with nothing open: return to Home first, then let the app close.
  const onRootBack = useCallback(() => {
    if (tab !== 'home') {
      setTab('home');
      return true;
    }
    return false;
  }, [tab]);

  if (!mounted) return <Splash />;

  const screens: Record<AppTab, React.ReactNode> = {
    home: (
      <HomeScreen
        onBook={() => openBooking()}
        onOpenOffice={setSheetOffice}
        onOpenQueue={(id) => {
          setQueueId(id);
          setTab('queue');
        }}
        onBrowseCategory={browseCategory}
        onOpenProfile={() => setTab('profile')}
      />
    ),
    explore: <ExploreScreen category={category} onCategory={setCategory} onOpenOffice={setSheetOffice} />,
    queue: <QueueScreen selectedId={queueId} onSelect={setQueueId} onBook={() => openBooking()} />,
    profile: <ProfileScreen />,
  };

  return (
    <BackStackProvider onRoot={onRootBack}>
      <div className="app-shell bg-night flex flex-col">
        <main className="relative flex-1 min-h-0 pt-safe">
          <div className="relative h-full max-w-md mx-auto">
            {/* Tabs stay mounted so each keeps its scroll position, like a native tab bar. */}
            {TAB_IDS.map((id) => (
              <motion.section
                key={id}
                aria-hidden={tab !== id}
                initial={false}
                animate={{ opacity: tab === id ? 1 : 0, y: tab === id ? 0 : 8 }}
                transition={{ duration: 0.18 }}
                className={`absolute inset-0 ${id === 'explore' ? '' : 'screen-scroll'} ${tab === id ? '' : 'pointer-events-none invisible'}`}
              >
                {screens[id]}
              </motion.section>
            ))}
          </div>
        </main>

        <TabBar current={tab} onChange={setTab} />
      </div>

      <OfficeSheet office={sheetOffice} onClose={() => setSheetOffice(null)} onBook={openBooking} />

      <AnimatePresence>
        {flow && (
          <BookingFlow
            key="flow"
            initialOffice={flow.office}
            initialService={flow.service}
            onDone={handleBooked}
            onClose={() => setFlow(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{!onboarded && <Onboarding onDone={finishOnboarding} />}</AnimatePresence>

      <Toaster />
    </BackStackProvider>
  );
}
