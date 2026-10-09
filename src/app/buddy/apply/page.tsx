'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SupportedLanguage } from '@/types';
import Link from 'next/link';
import {
  User,
  Phone,
  Globe,
  MapPin,
  FileText,
  Camera,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Upload,
} from 'lucide-react';

const ALL_LANGUAGES: SupportedLanguage[] = [
  'Kannada',
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
];

const BENGALURU_ZONES = [
  'Indiranagar & East',
  'Koramangala & HSR',
  'Jayanagar & South',
  'Bellandur & Outer Ring Road',
  'Central Bengaluru (MG Road/Double Road)',
  'Malleshwaram & Rajajinagar',
  'Yelahanka & North Bengaluru',
];

export default function BuddyApplyPage() {
  const { submitBuddyApplication } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [selectedLanguages, setSelectedLanguages] = useState<SupportedLanguage[]>([
    'Kannada',
    'English',
  ]);
  const [selectedZones, setSelectedZones] = useState<string[]>(['Indiranagar & East']);
  const [idType, setIdType] = useState('Aadhaar Card');
  const [idFileName, setIdFileName] = useState('aadhaar_card_front_back.pdf');
  const [selfieTaken, setSelfieTaken] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleLanguage = (lang: SupportedLanguage) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleZone = (zone: string) => {
    setSelectedZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || phone.length < 10) {
      setErrorMsg('Please enter your full name and a valid phone number.');
      return;
    }
    if (selectedLanguages.length === 0) {
      setErrorMsg('Please select at least one language you speak.');
      return;
    }
    if (selectedZones.length === 0) {
      setErrorMsg('Please select at least one Bengaluru zone where you can wait in queues.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitBuddyApplication({
        fullName,
        phone,
        languages: selectedLanguages,
        preferredZones: selectedZones,
        idType,
        idUrl: `/uploads/${idFileName}`,
        selfieUrl: '/uploads/selfie_sample.jpg',
      });
      if (res.error) setErrorMsg(res.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              Q
            </div>
            <div className="text-left">
              <span className="font-extrabold text-xl tracking-tight text-white block">
                QueueBuddy
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Bengaluru Partner Network
              </span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-3">
            Apply to Become a Queue Buddy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Earn ₹350–₹500 per queue helping Bengaluru citizens hold their spots at government offices.
            Must be verified by our admin team before accepting jobs.
          </p>
        </div>

        {/* Application Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Personal & Contact Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Legal Name (as on Govt ID)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Manjunath Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2.5 pl-9 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  WhatsApp Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 pl-9 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Languages */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>2. Languages You Can Speak Fluently</span>
            </div>
            <p className="text-xs text-slate-400">
              Government office counters in Bengaluru require smooth conversation with desk clerks.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ALL_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400 ring-2 ring-amber-500/20'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{lang}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Bengaluru Zones */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>3. Preferred Active Zones in Bengaluru</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BENGALURU_ZONES.map((zone) => {
                const isSelected = selectedZones.includes(zone);
                return (
                  <button
                    key={zone}
                    type="button"
                    onClick={() => toggleZone(zone)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all text-left ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{zone}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: KYC & ID Verification */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4. Identity Verification (KYC Document & Selfie)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Type
                </label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Voter ID Card">Voter ID Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                </select>

                <div className="mt-2 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 truncate">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate text-[11px]">{idFileName}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">Attached</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Live Verification Selfie
                </label>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-amber-400">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200 text-xs">Clear Front Selfie</span>
                      <span className="block text-[10px] text-slate-400">Captured via camera</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit Buddy Application (Status: Pending)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              Our operations team reviews submissions within 24–48 hours. You will receive an SMS upon approval.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
