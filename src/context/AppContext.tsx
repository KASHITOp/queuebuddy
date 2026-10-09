'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Load persisted demo data from local storage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedBookings = localStorage.getItem('qb_bookings');
        if (savedBookings) setBookings(JSON.parse(savedBookings));

        const savedDemands = localStorage.getItem('qb_demands');
        if (savedDemands) setDemands(JSON.parse(savedDemands));

        const savedLocale = localStorage.getItem('qb_locale') as Locale;
        if (savedLocale) setLocale(savedLocale);
      } catch (e) {
        console.error('Error loading local state', e);
      }
    }
  }, []);

  // Save changes to local storage
  const persistBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('qb_bookings', JSON.stringify(newBookings));
    }
  };

  const persistDemands = (newDemands: OfficeDemand[]) => {
    setDemands(newDemands);
    if (typeof window !== 'undefined') {
      localStorage.setItem('qb_demands', JSON.stringify(newDemands));
    }
  };

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('qb_locale', newLocale);
    }
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

    const updated = [newBooking, ...bookings];
    persistBookings(updated);
    setActiveBookingId(newBooking.id);
    return newBooking;
  };

  const updateBookingStatus = (
    bookingId: string,
    status: BookingStatus,
    extra?: Partial<Booking>
  ) => {
    const updated = bookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          status,
          ...extra,
          updated_at: new Date().toISOString(),
        };
      }
      return b;
    });
    persistBookings(updated);
  };

  const toggleChecklistItem = (bookingId: string, itemId: string) => {
    const updated = bookings.map((b) => {
      if (b.id === bookingId) {
        const current = b.checklist_progress || [];
        const next = current.includes(itemId)
          ? current.filter((id) => id !== itemId)
          : [...current, itemId];
        return {
          ...b,
          checklist_progress: next,
          updated_at: new Date().toISOString(),
        };
      }
      return b;
    });
    persistBookings(updated);
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
    setCrowdReports([newReport, ...crowdReports]);
  };

  const registerDemand = (officeId: string, contact: string, service?: string) => {
    const newDemand: OfficeDemand = {
      id: `dem-${Date.now()}`,
      office_id: officeId,
      phone_or_email: contact,
      service_interest: service,
      created_at: new Date().toISOString(),
    };
    const updated = [newDemand, ...demands];
    persistDemands(updated);
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
