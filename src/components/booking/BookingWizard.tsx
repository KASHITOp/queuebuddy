'use client';

import React, { useState } from 'react';
import { Office, Service, SupportedLanguage, Booking } from '@/types';
import { useApp } from '@/context/AppContext';
import { SuccessIllustration } from '@/components/illustrations/SuccessIllustration';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Globe,
  IndianRupee,
  ShieldCheck,
  CreditCard,
  QrCode,
  Sparkles,
  AlertCircle,
  FileText,
  User,
  Phone,
  ArrowRight,
  X,
  MapPin,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingWizardProps {
  initialOffice?: Office;
  initialService?: Service;
  onBookingComplete: (booking: Booking) => void;
  onCancel: () => void;
}

const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'Kannada',
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
];

const TIME_SLOTS = [
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '02:00 PM',
  '02:30 PM',
];

export const BookingWizard: React.FC<BookingWizardProps> = ({
  initialOffice,
  initialService,
  onBookingComplete,
  onCancel,
}) => {
  const { offices, services, checklists, createBooking, t, locale } = useApp();

  const [step, setStep] = useState<number>(initialOffice && initialService ? 3 : 1);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(initialOffice || null);
  const [selectedService, setSelectedService] = useState<Service | null>(initialService || null);
  const [bookingDate, setBookingDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [arrivalTime, setArrivalTime] = useState<string>('10:00 AM');
  const [expectedWaitHours, setExpectedWaitHours] = useState<number>(2.0);
  const [preferredLang, setPreferredLang] = useState<SupportedLanguage>('Kannada');
  const [backupLang, setBackupLang] = useState<SupportedLanguage | ''>('English');
  const [customerName, setCustomerName] = useState<string>('Arjun Mehta');
  const [customerPhone, setCustomerPhone] = useState<string>('+91 98451 99887');
  const [paymentMethod, setPaymentMethod] = useState<'upi_gpay' | 'upi_phonepe' | 'upi_qr' | 'card'>('upi_gpay');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const availableOffices = offices.filter((o) => o.status === 'bookable');
  const availableServices = selectedOffice
    ? services.filter((s) => s.office_id === selectedOffice.id)
    : [];

  // Fee calculations
  const buddyBaseFee = selectedService?.queue_buddy_base_fee || 349;
  const additionalHours = Math.max(0, expectedWaitHours - 2);
  const extraWaitFee = additionalHours * 100;
  const queueBuddyFee = buddyBaseFee + extraWaitFee;
  const govtFee = selectedService?.government_fee || 0;
  const platformFee = 29;
  const totalAmountPayable = queueBuddyFee + platformFee;

  const handleNext = () => {
    if (step === 1 && !selectedOffice) return;
    if (step === 2 && !selectedService) return;
    setStep((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePayAndConfirm = () => {
    if (!selectedOffice || !selectedService) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      const newBooking = createBooking({
        officeId: selectedOffice.id,
        serviceId: selectedService.id,
        bookingDate,
        arrivalTime,
        expectedWaitHours,
        preferredLanguage: preferredLang,
        backupLanguage: backupLang ? (backupLang as SupportedLanguage) : undefined,
        customerName,
        customerPhone,
        totalAmount: totalAmountPayable,
        queueBuddyFee,
        governmentFee: govtFee,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setIsProcessingPayment(false);
      setConfirmedBooking(newBooking);
      setStep(6);
    }, 1100);
  };

  const stepTitles = [
    { num: 1, title: 'Choose Office', subtitle: 'Select government office' },
    { num: 2, title: 'Choose Service', subtitle: 'Select token service & checklist' },
    { num: 3, title: 'Date & Arrival Time', subtitle: 'When should buddy hold spot?' },
    { num: 4, title: 'Language Preference', subtitle: 'Languages spoken with staff' },
    { num: 5, title: 'Price & Payment', subtitle: 'Transparent breakdown & Razorpay' },
    { num: 6, title: 'Booking Confirmed!', subtitle: 'Live token ready' },
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-[#FFFFFF] rounded-3xl border-2 border-[#111111] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      {/* Big Step Progress Header */}
      <div className="p-4 bg-[#FFFCF2] border-b-2 border-[#111111] space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && step < 6 && (
              <button
                onClick={handleBack}
                aria-label="Previous step"
                className="p-1.5 rounded-xl bg-[#FFFFFF] border border-[#E5E0D5] text-[#111111] hover:bg-[#F4F0E6] active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <span className="text-[10px] font-mono font-black uppercase text-[#0B7A4B] tracking-wider">
                Step {step} of 5
              </span>
              <h2 className="text-sm sm:text-base font-black text-[#111111] font-display tracking-tight leading-none mt-0.5">
                {stepTitles[step - 1]?.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onCancel}
            aria-label="Cancel booking"
            className="p-1.5 rounded-full hover:bg-[#F4F0E6] text-[#777777]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full h-1.5 bg-[#E5E0D5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFD60A] transition-all duration-300"
            style={{ width: `${(Math.min(step, 5) / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Wizard Step Content (One Decision Per Screen) */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 text-[#111111]">
        {/* Step 1: Choose Office */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-xs text-[#555555]">
              Select the office in Bengaluru where you want a verified Queue Buddy to hold your counter spot.
            </p>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {availableOffices.map((off) => {
                const isSelected = selectedOffice?.id === off.id;
                return (
                  <div
                    key={off.id}
                    onClick={() => setSelectedOffice(off)}
                    className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between touch-target active:scale-[0.99] ${
                      isSelected
                        ? 'border-[#111111] bg-[#FFD60A]/15 ring-2 ring-[#FFD60A]'
                        : 'border-[#E5E0D5] bg-[#FFFFFF] hover:border-[#111111]/40'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F4F0E6] text-[#111111]">
                          {off.area}
                        </span>
                        <span className="text-[10px] text-[#0B7A4B] font-semibold">
                          ~2.4 km away
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-[#111111] mt-1 font-display truncate">
                        {locale === 'kn' ? off.name_kn : off.name}
                      </h4>
                      <p className="text-[11px] text-[#666666] truncate mt-0.5">
                        {off.address}
                      </p>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-[#111111] bg-[#111111] text-[#FFD60A]'
                          : 'border-[#CCCCCC] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Choose Service */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-[#F4F0E6] border border-[#E5E0D5] text-xs">
              <span className="text-[#555555]">Office: </span>
              <strong className="text-[#111111]">{selectedOffice?.name}</strong>
            </div>

            <p className="text-xs text-[#555555]">
              Select the service counter you need assistance with. Document checklists will be attached automatically.
            </p>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {availableServices.map((srv) => {
                const isSelected = selectedService?.id === srv.id;
                const checklistCount = checklists.filter((c) => c.service_id === srv.id).length;

                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all space-y-2.5 touch-target active:scale-[0.99] ${
                      isSelected
                        ? 'border-[#111111] bg-[#FFD60A]/15 ring-2 ring-[#FFD60A]'
                        : 'border-[#E5E0D5] bg-[#FFFFFF] hover:border-[#111111]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-[#111111] font-display">
                          {locale === 'kn' ? srv.title_kn : srv.title}
                        </h4>
                        <p className="text-[11px] text-[#555555] line-clamp-2 mt-0.5">
                          {srv.description}
                        </p>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-[#111111] bg-[#111111] text-[#FFD60A]'
                            : 'border-[#CCCCCC] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    {/* Government Fee vs QueueBuddy Base Fee Badges */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#E5E0D5]/60 text-xs flex-wrap">
                      <span className="px-2 py-0.5 rounded-lg bg-[#FFFFFF] text-[#111111] font-bold border border-[#E5E0D5]">
                        Govt Fee: ₹{srv.government_fee}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-[#FFD60A] text-[#111111] font-black border border-[#111111]">
                        Buddy: ₹{srv.queue_buddy_base_fee}
                      </span>
                      <span className="text-[11px] text-[#0B7A4B] font-bold ml-auto">
                        📋 {checklistCount} docs required
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Date & Buddy Arrival Time */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Booking Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-[#555555] tracking-wider font-mono">
                Booking Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-3 pl-10 rounded-2xl bg-[#FFFFFF] border-2 border-[#E5E0D5] text-xs sm:text-sm font-mono font-bold text-[#111111] focus:border-[#111111] focus:outline-none"
                />
                <Calendar className="w-4 h-4 text-[#777777] absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Buddy Arrival Time Slot */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-[#555555] tracking-wider font-mono">
                {t.bookingWizard.arrivalTimeLabel}
              </label>
              <p className="text-[11px] text-[#555555]">
                What time should your Queue Buddy reach the office to grab your token?
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setArrivalTime(slot)}
                    className={`py-2.5 px-3 rounded-xl border-2 font-mono font-bold text-xs transition-all touch-target ${
                      arrivalTime === slot
                        ? 'bg-[#FFD60A] text-[#111111] border-[#111111] shadow-sm'
                        : 'bg-[#F4F0E6] text-[#555555] border-[#E5E0D5] hover:text-[#111111]'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Expected Wait Hours */}
            <div className="p-3.5 rounded-2xl bg-[#F4F0E6] border border-[#E5E0D5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#111111]">
                  Expected Queue Duration to Hold
                </span>
                <span className="font-mono font-extrabold text-sm text-[#0B7A4B]">
                  {expectedWaitHours} hrs
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={expectedWaitHours}
                onChange={(e) => setExpectedWaitHours(parseFloat(e.target.value))}
                className="w-full accent-[#0B7A4B]"
              />
              <p className="text-[10px] text-[#666666]">
                First 2 hours included in base fee. Additional wait: ₹100/hr.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Language Preference */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-black text-[#111111] font-display">
                {t.bookingWizard.preferredLangTitle}
              </h3>
              <p className="text-xs text-[#555555] mt-0.5">
                {t.bookingWizard.preferredLangDesc}
              </p>
            </div>

            {/* Primary Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-[#555555] tracking-wider font-mono">
                {t.bookingWizard.primaryLang}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setPreferredLang(lang)}
                    className={`p-3 rounded-2xl border-2 font-bold text-xs flex items-center justify-between transition-all touch-target ${
                      preferredLang === lang
                        ? 'bg-[#FFD60A] text-[#111111] border-[#111111] shadow-sm'
                        : 'bg-[#FFFFFF] text-[#555555] border-[#E5E0D5] hover:text-[#111111]'
                    }`}
                  >
                    <span>{lang}</span>
                    {preferredLang === lang && <Check className="w-4 h-4 text-[#111111]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Backup Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-[#555555] tracking-wider font-mono">
                {t.bookingWizard.backupLang}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_LANGUAGES.filter((l) => l !== preferredLang).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setBackupLang(backupLang === lang ? '' : lang)}
                    className={`p-2.5 rounded-xl border font-semibold text-xs flex items-center justify-between transition-all touch-target ${
                      backupLang === lang
                        ? 'bg-[#111111] text-[#FFFCF2] border-[#111111]'
                        : 'bg-[#F4F0E6] text-[#555555] border-[#E5E0D5] hover:text-[#111111]'
                    }`}
                  >
                    <span>{lang}</span>
                    {backupLang === lang && <Check className="w-3.5 h-3.5 text-[#FFD60A]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Transparent Price Breakdown & Payment */}
        {step === 5 && (
          <div className="space-y-4">
            {/* Price Breakdown (Strict Distinction between QueueBuddy and Govt fees) */}
            <div className="rounded-2xl border-2 border-[#111111] bg-[#FFFCF2] p-4 space-y-3">
              <h4 className="text-xs font-mono font-black uppercase text-[#111111] tracking-wider">
                TRANSPARENT PRICE SUMMARY
              </h4>

              <div className="space-y-2 text-xs">
                {/* QueueBuddy Fee */}
                <div className="flex items-center justify-between">
                  <span className="text-[#555555]">
                    QueueBuddy Line Assistance (Base 2 hrs)
                  </span>
                  <span className="font-mono font-bold text-[#111111]">
                    ₹{buddyBaseFee}
                  </span>
                </div>

                {extraWaitFee > 0 && (
                  <div className="flex items-center justify-between text-[#555555]">
                    <span>Additional Queue Hours ({additionalHours} hrs @ ₹100/hr)</span>
                    <span className="font-mono font-bold text-[#111111]">
                      +₹{extraWaitFee}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[#555555]">
                  <span>Safety, Verified Buddy Match & Platform</span>
                  <span className="font-mono font-bold text-[#111111]">
                    ₹{platformFee}
                  </span>
                </div>

                {/* Government Counter Fee Highlight (Paid at Counter) */}
                <div className="p-2.5 rounded-xl bg-[#E6F5ED] border border-[#0B7A4B]/30 flex items-start justify-between text-xs text-[#0B7A4B]">
                  <div>
                    <div className="font-black">Official Govt Counter Fee: ₹{govtFee}</div>
                    <div className="text-[10px] text-[#0B7A4B]/80 leading-tight mt-0.5">
                      ⚠️ Paid directly at the government desk upon handover. NOT charged online.
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase bg-white px-2 py-0.5 rounded border border-[#0B7A4B]/20">
                    Pay at Desk
                  </span>
                </div>

                {/* Total Payable Online Now */}
                <div className="flex items-center justify-between pt-2 border-t-2 border-[#111111] text-sm font-black">
                  <span>Total Payable Online Now:</span>
                  <span className="font-mono text-base text-[#111111]">
                    ₹{totalAmountPayable}
                  </span>
                </div>
              </div>
            </div>

            {/* Test Payment Methods (Razorpay Test Mode) */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#555555] tracking-wider font-mono">
                Pay via Razorpay (UPI / Card - Test Mode)
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_gpay')}
                  className={`p-3 rounded-xl border-2 font-bold flex items-center gap-2 transition-all touch-target ${
                    paymentMethod === 'upi_gpay'
                      ? 'border-[#111111] bg-[#FFD60A] text-[#111111]'
                      : 'border-[#E5E0D5] bg-[#F4F0E6] text-[#555555]'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Google Pay / UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border-2 font-bold flex items-center gap-2 transition-all touch-target ${
                    paymentMethod === 'card'
                      ? 'border-[#111111] bg-[#FFD60A] text-[#111111]'
                      : 'border-[#E5E0D5] bg-[#F4F0E6] text-[#555555]'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Test Card</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Confirmation & Success Celebration */}
        {step === 6 && (
          <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-center">
              <SuccessIllustration className="w-36 h-36" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#111111] font-display">
                Spot Secured in Bengaluru!
              </h3>
              <p className="text-xs text-[#555555]">
                Your Queue Buddy has been scheduled. Your spot token is active.
              </p>
            </div>

            {/* Live Token Details */}
            <div className="p-4 rounded-2xl bg-[#111111] text-[#FFFCF2] text-left space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <span className="text-[10px] font-mono text-[#FFD60A] font-bold uppercase">
                  ACTIVE BOOKING CODE
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {confirmedBooking?.booking_code || 'QB-BLR-8492'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] text-white/60">Office</div>
                  <div className="font-bold text-white truncate">
                    {selectedOffice?.name}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-white/60">Token Number</div>
                  <div className="font-mono font-black text-[#FFD60A]">
                    {confirmedBooking?.token_number || 'KA03-B42'}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirmedBooking) onBookingComplete(confirmedBooking);
                else onCancel();
              }}
              className="w-full py-4 px-4 rounded-2xl bg-[#FFD60A] text-[#111111] font-black text-sm border-2 border-[#111111] shadow-lg active:scale-95 transition-transform touch-target flex items-center justify-center gap-2"
            >
              <span>Track Live Queue & View Buddy</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Wizard Bottom Action Bar */}
      {step < 6 && (
        <div className="p-4 bg-[#FFFCF2] border-t-2 border-[#111111] flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs">
            <span className="text-[#555555]">Total: </span>
            <span className="font-mono font-black text-sm text-[#111111]">
              ₹{totalAmountPayable}
            </span>
          </div>

          <div className="flex gap-2">
            {step < 5 ? (
              <button
                onClick={handleNext}
                disabled={(step === 1 && !selectedOffice) || (step === 2 && !selectedService)}
                className="py-3 px-6 rounded-xl bg-[#FFD60A] text-[#111111] font-black text-xs border-2 border-[#111111] shadow-sm active:scale-95 transition-all touch-target flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handlePayAndConfirm}
                disabled={isProcessingPayment}
                className="py-3 px-6 rounded-xl bg-[#0B7A4B] text-white font-black text-xs shadow-md active:scale-95 transition-all touch-target flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <span>Verifying Payment...</span>
                ) : (
                  <>
                    <IndianRupee className="w-4 h-4" />
                    <span>Pay ₹{totalAmountPayable} & Confirm</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
