'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Office,
  Service,
  DocumentChecklistItem,
  CrowdReport,
  BuddyProfile,
  Booking,
  Dispute,
  OfficeDemand,
  UserRole,
  SupportedLanguage,
  BookingStatus,
} from '@/types';
import {
  INITIAL_OFFICES,
  INITIAL_SERVICES,
  INITIAL_CHECKLISTS,
  INITIAL_CROWD_REPORTS,
  INITIAL_BUDDIES,
  INITIAL_BOOKINGS,
  INITIAL_DISPUTES,
} from '@/lib/data';
import { Locale, translations } from '@/lib/i18n';
import { isSupabaseConfigured } from '@/lib/supabase';

const BOOKINGS_KEY = 'qb_bookings_v2';
const DEMANDS_KEY = 'qb_demands';
const LOCALE_KEY = 'qb_locale';

// Demo queue simulation: how often a buddy "reports" the line moving.
const QUEUE_TICK_MS = 9000;
const SUMMON_AT = 3;

export interface AppToast {
  kind: 'info' | 'success' | 'alert';
  title: string;
  body?: string;
}

/** Fire-and-forget toast; the app shell listens for this event and shows a banner. */
export const emitToast = (toast: AppToast) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<AppToast>('qb:toast', { detail: toast }));
  }
};

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof translations)['en'];
  offices: Office[];
  services: Service[];
  checklists: DocumentChecklistItem[];
  crowdReports: CrowdReport[];
  buddies: BuddyProfile[];
  bookings: Booking[];
  demands: OfficeDemand[];
  disputes: Dispute[];
  activeBookingId: string | null;
  setActiveBookingId: (id: string | null) => void;
  createBooking: (data: {
    officeId: string;
    serviceId: string;
    bookingDate: string;
    arrivalTime: string;
    expectedWaitHours: number;
    preferredLanguage: SupportedLanguage;
    backupLanguage?: SupportedLanguage;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    queueBuddyFee: number;
    governmentFee: number;
  }) => Booking;
  updateBookingStatus: (
    bookingId: string,
    status: BookingStatus,
    extra?: Partial<Booking>
  ) => void;
  toggleChecklistItem: (bookingId: string, itemId: string) => void;
  updateQueueLiveStatus: (
    bookingId: string,
    tokenNumber: string,
    peopleAhead: number,
    notes?: string
  ) => void;
  submitCrowdReport: (
    officeId: string,
    peopleAhead: number,
    estimatedWaitMinutes: number,
    notes: string,
    source?: 'buddy_report' | 'customer_report'
  ) => void;
  registerDemand: (officeId: string, contact: string, service?: string) => void;
  verifyBuddy: (buddyId: string, status: 'verified' | 'rejected') => void;
  resolveDispute: (disputeId: string, status: 'resolved' | 'refunded', notes: string) => void;
  addOffice: (office: Omit<Office, 'id' | 'last_verified_date'>) => void;
  addService: (service: Omit<Service, 'id'>) => void;
  addChecklistItem: (item: Omit<DocumentChecklistItem, 'id'>) => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('customer');
  const [locale, setLocale] = useState<Locale>('en');
  const [offices, setOffices] = useState<Office[]>(INITIAL_OFFICES);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [checklists, setChecklists] = useState<DocumentChecklistItem[]>(INITIAL_CHECKLISTS);
  const [crowdReports, setCrowdReports] = useState<CrowdReport[]>(INITIAL_CROWD_REPORTS);
  const [buddies, setBuddies] = useState<BuddyProfile[]>(INITIAL_BUDDIES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [demands, setDemands] = useState<OfficeDemand[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);
  const [activeBookingId, setActiveBookingId] = useState<string | null>('book-1');
  const [hydrated, setHydrated] = useState(false);
  const bookingsRef = useRef(bookings);
  bookingsRef.current = bookings;

  // Load persisted demo data from local storage if available
  useEffect(() => {
    try {
      const savedBookings = localStorage.getItem(BOOKINGS_KEY);
      if (savedBookings) setBookings(JSON.parse(savedBookings));

      const savedDemands = localStorage.getItem(DEMANDS_KEY);
      if (savedDemands) setDemands(JSON.parse(savedDemands));

      const savedLocale = localStorage.getItem(LOCALE_KEY) as Locale;
      if (savedLocale) setLocale(savedLocale);
    } catch (e) {
      console.error('Error loading local state', e);
    }
    setHydrated(true);
  }, []);

  // Persist after hydration so the seed never overwrites saved data.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    } catch {
      // Storage full or blocked: the demo keeps working in memory.
    }
  }, [bookings, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(DEMANDS_KEY, JSON.stringify(demands));
    } catch {
      // Ignore storage errors in demo mode.
    }
  }, [demands, hydrated]);

  // Demo mode: buddies "report" progress so the live token actually moves.
  useEffect(() => {
    if (!hydrated || isSupabaseConfigured()) return;

    const timer = window.setInterval(() => {
      const toasts: AppToast[] = [];
      let changed = false;
      const now = new Date().toISOString();

      const next = bookingsRef.current.map((b) => {
        // Only bookings made in this session start moving on their own; older seeded ones stay put.
        const isFresh = Date.now() - new Date(b.created_at).getTime() < 6 * 3600 * 1000;
        if (b.status === 'assigned' && isFresh) {
          changed = true;
          toasts.push({
            kind: 'info',
            title: `${b.buddy?.full_name || 'Your buddy'} reached the office`,
            body: b.office.name,
          });
          return { ...b, status: 'buddy_arrived' as BookingStatus, updated_at: now };
        }
        if (b.status === 'buddy_arrived') {
          changed = true;
          const token = `${b.office.area.slice(0, 2).toUpperCase()}-${Math.floor(20 + Math.random() * 70)}`;
          const ahead = 9 + Math.floor(Math.random() * 5);
          toasts.push({ kind: 'success', title: `Token ${token} secured`, body: `${ahead} people ahead of you` });
          return { ...b, status: 'in_queue' as BookingStatus, token_number: token, people_ahead: ahead, updated_at: now };
        }
        const live = b.status === 'in_queue' || b.status === 'customer_summoned' || b.status === 'customer_traveling';
        if (!live || (b.people_ahead ?? 0) <= 0) return b;

        changed = true;
        const ahead = (b.people_ahead ?? 1) - 1;
        let status: BookingStatus = b.status;
        if (ahead === 0) {
          status = 'handover_completed';
          toasts.push({ kind: 'success', title: "It's your turn!", body: `Meet your buddy at the counter • ${b.token_number}` });
        } else if (ahead <= SUMMON_AT && b.status === 'in_queue') {
          status = 'customer_summoned';
          toasts.push({ kind: 'alert', title: `Only ${ahead} ahead — head out now`, body: b.office.name });
        }
        return { ...b, people_ahead: ahead, status, updated_at: now };
      });

      if (changed) {
        setBookings(next);
        toasts.forEach(emitToast);
      }
    }, QUEUE_TICK_MS);

    return () => window.clearInterval(timer);
  }, [hydrated]);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    try {
      localStorage.setItem(LOCALE_KEY, newLocale);
    } catch {
      // Ignore storage errors.
    }
  };

  const resetDemo = () => {
    setBookings(INITIAL_BOOKINGS);
    setDemands([]);
    setCrowdReports(INITIAL_CROWD_REPORTS);
    setActiveBookingId('book-1');
  };

  const createBooking = (data: {
    officeId: string;
    serviceId: string;
    bookingDate: string;
    arrivalTime: string;
    expectedWaitHours: number;
    preferredLanguage: SupportedLanguage;
    backupLanguage?: SupportedLanguage;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    queueBuddyFee: number;
    governmentFee: number;
  }): Booking => {
    const selectedOffice = offices.find((o) => o.id === data.officeId) || offices[0];
    const selectedService = services.find((s) => s.id === data.serviceId) || services[0];

    // Match a buddy based on preferred language or backup
    const backupLang = data.backupLanguage;
    const matchedBuddy =
      buddies.find((b) => b.is_active && b.languages.includes(data.preferredLanguage)) ||
      (backupLang
        ? buddies.find((b) => b.is_active && b.languages.includes(backupLang))
        : null) ||
      buddies.find((b) => b.is_active) ||
      buddies[0];

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      booking_code: `QB-BLR-${randomSuffix}`,
      customer_id: 'cust-current',
      customer_name: data.customerName || 'Demo Customer',
      customer_phone: data.customerPhone || '+91 98450 00000',
      buddy_id: matchedBuddy ? matchedBuddy.id : undefined,
      buddy: matchedBuddy,
      office_id: data.officeId,
      office: selectedOffice,
      service_id: data.serviceId,
      service: selectedService,
      booking_date: data.bookingDate,
      arrival_time: data.arrivalTime,
      expected_wait_hours: data.expectedWaitHours,
      preferred_language: data.preferredLanguage,
      backup_language: data.backupLanguage,
      status: 'assigned',
      queue_buddy_fee: data.queueBuddyFee,
      government_fee: data.governmentFee,
      total_amount: data.totalAmount,
      payment_status: 'paid',
      razorpay_payment_id: `pay_test_${Math.random().toString(36).substring(2, 9)}`,
      checklist_progress: [],
      reminder_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    setActiveBookingId(newBooking.id);
    return newBooking;
  };

  const updateBookingStatus = (
    bookingId: string,
    status: BookingStatus,
    extra?: Partial<Booking>
  ) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status, ...extra, updated_at: new Date().toISOString() } : b
      )
    );
  };

  const toggleChecklistItem = (bookingId: string, itemId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        const current = b.checklist_progress || [];
        const next = current.includes(itemId)
          ? current.filter((id) => id !== itemId)
          : [...current, itemId];
        return { ...b, checklist_progress: next, updated_at: new Date().toISOString() };
      })
    );
  };

  const updateQueueLiveStatus = (
    bookingId: string,
    tokenNumber: string,
    peopleAhead: number,
    notes?: string
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // Next status determination: if peopleAhead <= 3, customer should be summoned!
    let nextStatus: BookingStatus = 'in_queue';
    if (peopleAhead <= 3 && peopleAhead > 0) {
      nextStatus = 'customer_summoned';
    } else if (peopleAhead === 0) {
      nextStatus = 'handover_completed';
    }

    updateBookingStatus(bookingId, nextStatus, {
      token_number: tokenNumber,
      people_ahead: peopleAhead,
      notes: notes || booking.notes,
    });

    // Also add to crowd reports
    submitCrowdReport(
      booking.office_id,
      peopleAhead,
      peopleAhead * 5,
      notes || `Buddy reported ${peopleAhead} ahead for token ${tokenNumber}`,
      'buddy_report'
    );
  };

  const submitCrowdReport = (
    officeId: string,
    peopleAhead: number,
    estimatedWaitMinutes: number,
    notes: string,
    source: 'buddy_report' | 'customer_report' = 'customer_report'
  ) => {
    const newReport: CrowdReport = {
      id: `rep-${Date.now()}`,
      office_id: officeId,
      source,
      people_ahead: peopleAhead,
      estimated_wait_minutes: estimatedWaitMinutes,
      reported_at: new Date().toISOString(),
      reporter_name: source === 'buddy_report' ? 'Verified Buddy' : 'App User',
      notes,
    };
    setCrowdReports((prev) => [newReport, ...prev]);
  };

  const registerDemand = (officeId: string, contact: string, service?: string) => {
    const newDemand: OfficeDemand = {
      id: `dem-${Date.now()}`,
      office_id: officeId,
      phone_or_email: contact,
      service_interest: service,
      created_at: new Date().toISOString(),
    };
    setDemands((prev) => [newDemand, ...prev]);
  };

  const verifyBuddy = (buddyId: string, status: 'verified' | 'rejected') => {
    setBuddies((prev) =>
      prev.map((b) => (b.id === buddyId ? { ...b, verification_status: status } : b))
    );
  };

  const resolveDispute = (
    disputeId: string,
    status: 'resolved' | 'refunded',
    notes: string
  ) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === disputeId ? { ...d, status, admin_notes: notes } : d))
    );
  };

  const addOffice = (officeData: Omit<Office, 'id' | 'last_verified_date'>) => {
    const newOffice: Office = {
      ...officeData,
      id: `off-${Date.now()}`,
      last_verified_date: new Date().toISOString(),
    };
    setOffices((prev) => [newOffice, ...prev]);
  };

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: `srv-${Date.now()}`,
    };
    setServices((prev) => [...prev, newService]);
  };

  const addChecklistItem = (itemData: Omit<DocumentChecklistItem, 'id'>) => {
    const newItem: DocumentChecklistItem = {
      ...itemData,
      id: `chk-${Date.now()}`,
    };
    setChecklists((prev) => [...prev, newItem]);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        locale,
        setLocale: handleSetLocale,
        t: translations[locale],
        offices,
        services,
        checklists,
        crowdReports,
        buddies,
        bookings,
        demands,
        disputes,
        activeBookingId,
        setActiveBookingId,
        createBooking,
        updateBookingStatus,
        toggleChecklistItem,
        updateQueueLiveStatus,
        submitCrowdReport,
        registerDemand,
        verifyBuddy,
        resolveDispute,
        addOffice,
        addService,
        addChecklistItem,
        resetDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
