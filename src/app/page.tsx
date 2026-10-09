'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { OfficeDirectory } from '@/components/offices/OfficeDirectory';
import { OfficeDetailModal } from '@/components/offices/OfficeDetailModal';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { MyBookingsView } from '@/components/booking/MyBookingsView';
import { Office, Service, Booking } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Clock,
  FileCheck,
  Sparkles,
  MapPin,
  CheckCircle2,
  X,
  Phone,
  ArrowRight,
  LogIn,
} from 'lucide-react';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const { t, locale } = useApp();
  const router = useRouter();

  const [currentView, setCurrentView] = useState<'offices' | 'bookings' | 'buddy' | 'admin'>('offices');
  const [selectedOfficeModal, setSelectedOfficeModal] = useState<Office | null>(null);
  const [wizardOffice, setWizardOffice] = useState<Office | null>(null);
  const [wizardService, setWizardService] = useState<Service | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Register PWA Service Worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('QueueBuddy PWA Service Worker registered:', reg.scope))
        .catch((err) => console.log('Service Worker registration failed:', err));
    }
  }, []);

  const handleOpenBooking = (office: Office, service?: Service) => {
    // If user is not authenticated, booking requires login!
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSelectedOfficeModal(null);
    setWizardOffice(office);
    setWizardService(service || null);
    setIsWizardOpen(true);
  };

  const handleBookingComplete = (booking: Booking) => {
    setIsWizardOpen(false);
    setCurrentView('bookings');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 sm:pb-12">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6 space-y-6">
        {/* Auth prompt banner if signed out */}
        {!isAuthenticated && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/20 border border-amber-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Browsing Bengaluru Office Directory:</strong> Sign in to book a verified Queue Buddy.
              </span>
            </div>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-colors shrink-0 flex items-center gap-1 shadow-sm"
            >
              <span>Sign In / Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Bengaluru Launch Hero Banner (Customer view only) */}
        {currentView === 'offices' && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-5 sm:p-7 shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                  <MapPin className="w-3.5 h-3.5" />
                  Launch City: Bengaluru Only
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  RTO • Sub-Registrar • Passport • BBMP
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                {locale === 'kn' ? (
                  <>
                    ಸರ್ಕಾರಿ ಕಚೇರಿಗಳಲ್ಲಿ ಸಾಲಿನಲ್ಲಿ ನಿಲ್ಲಬೇಡಿ.{' '}
                    <span className="text-amber-400">ಕ್ಯೂ ಬಡ್ಡಿ</span> ಸಹಾಯ ಪಡೆಯಿರಿ.
                  </>
                ) : (
                  <>
                    Never stand in government queues again.{' '}
                    <span className="text-amber-400">Arrive when your turn is near.</span>
                  </>
                )}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t.subtitle}
              </p>

              {/* 3 Core Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Verified Buddies: </strong>Language matched
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Honest Crowd Data: </strong>No fake AI claims
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs">
                  <FileCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    <strong>Doc Checklist: </strong>100% counter-ready
                  </span>
                </div>
              </div>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        )}

        {/* Dynamic Views */}
        {currentView === 'offices' && (
          <OfficeDirectory
            onSelectOffice={(office) => setSelectedOfficeModal(office)}
            onBookOffice={(office) => handleOpenBooking(office)}
          />
        )}

        {currentView === 'bookings' && <MyBookingsView />}
      </main>

      {/* Office Detail Modal */}
      {selectedOfficeModal && (
        <OfficeDetailModal
          office={selectedOfficeModal}
          onClose={() => setSelectedOfficeModal(null)}
          onBookService={(office, service) => handleOpenBooking(office, service)}
        />
      )}

      {/* Multi-Step Booking Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl">
            <BookingWizard
              initialOffice={wizardOffice || undefined}
              initialService={wizardService || undefined}
              onBookingComplete={handleBookingComplete}
              onCancel={() => setIsWizardOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav
        currentView={currentView}
        onChangeView={(view) => {
          if (view === 'buddy') router.push('/buddy');
          else if (view === 'admin') router.push('/admin');
          else setCurrentView(view);
        }}
      />
    </div>
  );
}
