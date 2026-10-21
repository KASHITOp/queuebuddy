'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav, MainNavTab } from '@/components/layout/BottomNav';
import { LiveTokenHeroCard } from '@/components/home/LiveTokenHeroCard';
import { OfficeDirectory } from '@/components/offices/OfficeDirectory';
import { OfficeDetailModal } from '@/components/offices/OfficeDetailModal';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { MyBookingsView } from '@/components/booking/MyBookingsView';
import { CrowdStatusCard } from '@/components/offices/CrowdStatusCard';
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
  ChevronRight,
  FileText,
  Building,
  Car,
  FileSpreadsheet,
  Compass,
  User,
  Moon,
  Sun,
  Trash2,
  Bell,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const { user, isAuthenticated, signOut, deleteAccountAndData } = useAuth();
  const { t, locale, setLocale, offices, bookings, checklists } = useApp();
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState<MainNavTab>('home');
  const [selectedOfficeModal, setSelectedOfficeModal] = useState<Office | null>(null);
  const [wizardOffice, setWizardOffice] = useState<Office | null>(null);
  const [wizardService, setWizardService] = useState<Service | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Active in-progress booking (if any)
  const activeBooking = bookings.find(
    (b) =>
      b.status === 'in_queue' ||
      b.status === 'customer_summoned' ||
      b.status === 'customer_traveling' ||
      b.status === 'buddy_arrived'
  ) || bookings[0];

  // Popular offices for quick home showcase
  const popularOffices = offices.slice(0, 3);

  // Register PWA Service Worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('QueueBuddy PWA Service Worker active:', reg.scope))
        .catch((err) => console.log('Service Worker registration skipped:', err));
    }
  }, []);

  const handleOpenBooking = (office?: Office, service?: Service) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSelectedOfficeModal(null);
    setWizardOffice(office || offices[0]);
    setWizardService(service || null);
    setIsWizardOpen(true);
  };

  const handleBookingComplete = (booking: Booking) => {
    setIsWizardOpen(false);
    setCurrentTab('bookings');
  };

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (typeof document !== 'undefined') {
      if (nextMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF2] text-[#111111] flex flex-col antialiased selection:bg-[#FFD60A] selection:text-[#111111]">
      {/* Sleek Mobile Header */}
      <Navbar onAccountClick={() => setCurrentTab('account')} />

      {/* Main View Container (Designed for 390px Phone First) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-3 pb-32 sm:pb-28 space-y-4">
        {/* ============================================================ */}
        {/* TAB 1: HOME SCREEN                                           */}
        {/* ============================================================ */}
        {currentTab === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* HERO: One Big Live Token Card */}
            <LiveTokenHeroCard
              booking={activeBooking}
              onTrackClick={() => setCurrentTab('bookings')}
              onBookClick={() => handleOpenBooking()}
            />

            {/* Quick Actions Grid (4 Large Touch-Target Tiles) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono font-black uppercase text-[#555555] tracking-wider">
                  {t.common.quickActions}
                </span>
                <span className="text-[10px] text-[#0B7A4B] font-bold">Verified Line Prep</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Tile 1: RTO */}
                <button
                  onClick={() => setCurrentTab('offices')}
                  className="p-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#111111]/15 hover:border-[#111111] text-left shadow-sm active:scale-95 transition-all touch-target space-y-1.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FFD60A] border border-[#111111] flex items-center justify-center text-[#111111]">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#111111] font-display">
                      RTO Driving & RC
                    </h4>
                    <p className="text-[10px] text-[#555555] line-clamp-1">
                      Indiranagar, Jayanagar
                    </p>
                  </div>
                </button>

                {/* Tile 2: Sub-Registrar */}
                <button
                  onClick={() => setCurrentTab('offices')}
                  className="p-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#111111]/15 hover:border-[#111111] text-left shadow-sm active:scale-95 transition-all touch-target space-y-1.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0B7A4B] border border-[#111111] flex items-center justify-center text-white">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#111111] font-display">
                      Sub-Registrar
                    </h4>
                    <p className="text-[10px] text-[#555555] line-clamp-1">
                      Sale deed, Khata token
                    </p>
                  </div>
                </button>

                {/* Tile 3: Passport PSK */}
                <button
                  onClick={() => setCurrentTab('offices')}
                  className="p-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#111111]/15 hover:border-[#111111] text-left shadow-sm active:scale-95 transition-all touch-target space-y-1.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#F4F0E6] border border-[#111111] flex items-center justify-center text-[#111111]">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#111111] font-display">
                      Passport Seva PSK
                    </h4>
                    <p className="text-[10px] text-[#555555] line-clamp-1">
                      Lalbagh, Bellandur
                    </p>
                  </div>
                </button>

                {/* Tile 4: Doc Checklist */}
                <button
                  onClick={() => setCurrentTab('bookings')}
                  className="p-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#111111]/15 hover:border-[#111111] text-left shadow-sm active:scale-95 transition-all touch-target space-y-1.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FF5A36] border border-[#111111] flex items-center justify-center text-white">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#111111] font-display">
                      Doc Checklist
                    </h4>
                    <p className="text-[10px] text-[#555555] line-clamp-1">
                      100% counter-ready
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Popular Bengaluru Offices Preview (Large Tappable Cards) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono font-black uppercase text-[#555555] tracking-wider">
                  {t.common.popularOffices}
                </span>
                <button
                  onClick={() => setCurrentTab('offices')}
                  className="text-[11px] font-bold text-[#111111] flex items-center gap-0.5 hover:underline"
                >
                  <span>See all</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {popularOffices.map((office) => (
                  <div
                    key={office.id}
                    onClick={() => setSelectedOfficeModal(office)}
                    className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#111111]/15 hover:border-[#111111] shadow-sm space-y-2.5 cursor-pointer active:scale-[0.99] transition-all touch-target"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F4F0E6] text-[#111111]">
                            {office.area}
                          </span>
                          <span className="text-[10px] font-bold text-[#0B7A4B]">
                            ~2.4 km away
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-[#111111] font-display mt-1 truncate">
                          {locale === 'kn' ? office.name_kn : office.name}
                        </h4>
                      </div>

                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E6F5ED] text-[#0B7A4B] border border-[#0B7A4B]/20 shrink-0">
                        ● Bookable
                      </span>
                    </div>

                    <CrowdStatusCard officeId={office.id} compact={true} />
                  </div>
                ))}
              </div>
            </div>

            {/* Bengaluru Trust Banner */}
            <div className="p-3.5 rounded-2xl bg-[#F4F0E6] border border-[#E5E0D5] flex items-start gap-2.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#0B7A4B] shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#555555] leading-relaxed">
                <strong className="text-[#111111]">Bengaluru Verified Buddy Guarantee: </strong>
                All Queue Buddies are verified in-person, matched by language preference, and adhere to strict privacy rules. Buddies never handle your confidential documents.
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: OFFICES DIRECTORY                                     */}
        {/* ============================================================ */}
        {currentTab === 'offices' && (
          <OfficeDirectory
            onSelectOffice={(office) => setSelectedOfficeModal(office)}
            onBookOffice={(office) => handleOpenBooking(office)}
          />
        )}

        {/* ============================================================ */}
        {/* TAB 3: MY BOOKING (TAXI-METER QUEUE TRACKER)                  */}
        {/* ============================================================ */}
        {currentTab === 'bookings' && (
          <MyBookingsView onBookNew={() => handleOpenBooking()} />
        )}

        {/* ============================================================ */}
        {/* TAB 4: ACCOUNT                                               */}
        {/* ============================================================ */}
        {currentTab === 'account' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* User Profile Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#111111] shadow-md space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD60A] border-2 border-[#111111] text-[#111111] font-black text-xl flex items-center justify-center shadow-sm">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-black text-[#111111] font-display truncate">
                      {user?.full_name || 'Customer'}
                    </h2>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E6F5ED] text-[#0B7A4B] border border-[#0B7A4B]/20 uppercase">
                      Verified
                    </span>
                  </div>
                  <div className="text-xs text-[#555555] truncate">
                    {user?.email || 'arjun.mehta@example.com'}
                  </div>
                  <div className="text-[11px] font-mono text-[#777777]">
                    {user?.phone || '+91 98451 99887'}
                  </div>
                </div>
              </div>
            </div>

            {/* Language Selection */}
            <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#111111]/15 space-y-2.5">
              <label className="text-xs font-mono font-black uppercase tracking-wider text-[#555555]">
                App Language / ಭಾಷೆ
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setLocale('en')}
                  className={`py-2 px-3 rounded-xl border-2 font-bold text-xs transition-all touch-target ${
                    locale === 'en'
                      ? 'bg-[#FFD60A] text-[#111111] border-[#111111]'
                      : 'bg-[#F4F0E6] text-[#555555] border-[#E5E0D5]'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLocale('kn')}
                  className={`py-2 px-3 rounded-xl border-2 font-bold text-xs transition-all touch-target ${
                    locale === 'kn'
                      ? 'bg-[#FFD60A] text-[#111111] border-[#111111]'
                      : 'bg-[#F4F0E6] text-[#555555] border-[#E5E0D5]'
                  }`}
                >
                  ಕನ್ನಡ
                </button>
                <button
                  onClick={() => setLocale('hi')}
                  className={`py-2 px-3 rounded-xl border-2 font-bold text-xs transition-all touch-target ${
                    locale === 'hi'
                      ? 'bg-[#FFD60A] text-[#111111] border-[#111111]'
                      : 'bg-[#F4F0E6] text-[#555555] border-[#E5E0D5]'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            {/* Theme Settings (Optional Dark Mode) */}
            <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#111111]/15 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#111111]">
                  Dark Mode (Optional)
                </div>
                <div className="text-[10px] text-[#555555]">
                  Default theme is Chalk & Yellow
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                aria-label="Toggle theme mode"
                className="p-2.5 rounded-xl bg-[#F4F0E6] border border-[#E5E0D5] text-[#111111] touch-target flex items-center gap-1.5 text-xs font-bold"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-[#FFD60A]" /> : <Moon className="w-4 h-4" />}
                <span>{isDarkMode ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            {/* DPDP Compliance & Data Privacy */}
            <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#111111]/15 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0B7A4B]" />
                <h3 className="text-xs font-bold text-[#111111]">
                  Data Privacy & DPDP Compliance
                </h3>
              </div>
              <p className="text-[11px] text-[#555555] leading-relaxed">
                In compliance with the Digital Personal Data Protection Act, no customer documents are stored on QueueBuddy servers. You can erase your profile anytime.
              </p>
              <button
                onClick={() => deleteAccountAndData()}
                className="w-full py-2.5 px-3 rounded-xl bg-[#FFEBE6] text-[#FF5A36] border border-[#FF5A36]/30 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Erase My Account & Stored Data</span>
              </button>
            </div>

            {/* Developer Cockpit Link */}
            <div className="pt-2 text-center">
              <Link
                href="/demo"
                className="text-[11px] font-mono text-[#777777] hover:text-[#111111] underline"
              >
                Hidden Developer & Role Switcher (/demo)
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Office Detail Bottom Sheet Modal */}
      {selectedOfficeModal && (
        <OfficeDetailModal
          office={selectedOfficeModal}
          onClose={() => setSelectedOfficeModal(null)}
          onBookService={(office, service) => handleOpenBooking(office, service)}
        />
      )}

      {/* Multi-Step Progressive Booking Wizard */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <BookingWizard
            initialOffice={wizardOffice || undefined}
            initialService={wizardService || undefined}
            onBookingComplete={handleBookingComplete}
            onCancel={() => setIsWizardOpen(false)}
          />
        </div>
      )}

      {/* Mobile Bottom Tab Bar with Large 44px+ Touch Targets & Sticky Button */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={(tab) => setCurrentTab(tab)}
        onQuickBook={() => handleOpenBooking()}
      />
    </div>
  );
}
