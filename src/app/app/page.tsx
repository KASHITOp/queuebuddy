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
  MapPin,
  ShieldCheck,
  Clock,
  FileCheck,
  User,
  ArrowRight,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, locale } = useApp();
  const router = useRouter();

  const [currentView, setCurrentView] = useState<'offices' | 'bookings' | 'buddy' | 'admin'>('offices');
  const [selectedOfficeModal, setSelectedOfficeModal] = useState<Office | null>(null);
  const [wizardOffice, setWizardOffice] = useState<Office | null>(null);
  const [wizardService, setWizardService] = useState<Service | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // If buddy or admin lands here, offer quick link to their portal
  const handleOpenBooking = (office: Office, service?: Service) => {
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
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6 space-y-6">
        {/* Welcome bar with quick account link */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">
              Logged in as <strong className="text-white">{user?.full_name || 'Customer'}</strong>
            </span>
          </div>
          <Link
            href="/account"
            className="text-amber-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Account Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* View switcher content */}
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
