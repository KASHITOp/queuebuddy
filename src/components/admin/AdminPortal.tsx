'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  Users,
  CreditCard,
  FileText,
  MapPin,
  TrendingUp,
  RefreshCw,
  Plus,
  Eye,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    offices,
    services,
    checklists,
    buddies,
    bookings,
    demands,
    disputes,
    verifyBuddy,
    resolveDispute,
    updateBookingStatus,
    addOffice,
    addService,
    addChecklistItem,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'dispatch' | 'verification' | 'offices' | 'disputes' | 'demand'
  >('dispatch');

  // Stats
  const activeBookings = bookings.filter(
    (b) => b.status !== 'handover_completed' && b.status !== 'cancelled'
  );
  const pendingBuddies = buddies.filter((b) => b.verification_status === 'pending');
  const openDisputes = disputes.filter((d) => d.status === 'open');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Admin KPI Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Active Queues</div>
          <div className="text-2xl font-extrabold text-amber-500 mt-1">
            {activeBookings.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across Bengaluru</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Pending Buddies</div>
          <div className="text-2xl font-extrabold text-indigo-500 mt-1">
            {pendingBuddies.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Awaiting verification</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Open Disputes</div>
          <div className="text-2xl font-extrabold text-rose-500 mt-1">
            {openDisputes.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Needs admin action</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Expansion Demand</div>
          <div className="text-2xl font-extrabold text-emerald-500 mt-1">
            {demands.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Notify Me requests</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 pb-1">
        {[
          { id: 'dispatch', label: 'Live Dispatch', count: activeBookings.length },
          { id: 'verification', label: 'Buddy Verification', count: pendingBuddies.length },
          { id: 'offices', label: 'Offices & Checklists', count: offices.length },
          { id: 'disputes', label: 'Disputes & Refunds', count: openDisputes.length },
          { id: 'demand', label: 'Unserved Demand', count: demands.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Live Dispatch */}
      {activeTab === 'dispatch' && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Live Booking Dispatch Monitor
          </div>

          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-amber-500">
                    {b.booking_code}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {b.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {b.service.title}
                </h4>
                <div className="text-xs text-slate-500">
                  {b.office.name} • Customer: {b.customer_name} ({b.customer_phone})
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Language: <strong className="text-amber-500">{b.preferred_language}</strong> •
                  Assigned Buddy: {b.buddy?.full_name || 'None'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateBookingStatus(b.id, 'customer_summoned', {
                      notes: 'Admin manual summon: Head to counter now.',
                    })
                  }
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-colors"
                >
                  Force Summon
                </button>
                <button
                  onClick={() =>
                    updateBookingStatus(b.id, 'handover_completed', {
                      people_ahead: 0,
                    })
                  }
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors"
                >
                  Mark Complete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Buddy Verification */}
      {activeTab === 'verification' && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Buddy Verification Desk (KYC & Language Fluency)
          </div>

          {buddies.map((buddy) => (
            <div
              key={buddy.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {buddy.full_name}
                  </h4>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      buddy.verification_status === 'verified'
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : buddy.verification_status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-500'
                        : 'bg-amber-500/20 text-amber-500'
                    }`}
                  >
                    {buddy.verification_status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Phone: {buddy.phone} • Rating: ⭐ {buddy.rating} ({buddy.total_jobs} jobs)
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Languages: <strong className="text-amber-500">{buddy.languages.join(', ')}</strong> • Zones:{' '}
                  {buddy.preferred_zones.join(', ')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {buddy.verification_status !== 'verified' && (
                  <button
                    onClick={() => verifyBuddy(buddy.id, 'verified')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Buddy</span>
                  </button>
                )}
                {buddy.verification_status !== 'rejected' && (
                  <button
                    onClick={() => verifyBuddy(buddy.id, 'rejected')}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Offices & Checklists */}
      {activeTab === 'offices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Managed Offices ({offices.length})
            </div>
          </div>

          <div className="space-y-3">
            {offices.map((off) => {
              const offServices = services.filter((s) => s.office_id === off.id);
              return (
                <div
                  key={off.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                          {off.office_type}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            off.status === 'bookable'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-purple-500/20 text-purple-400'
                          }`}
                        >
                          {off.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                        {off.name}
                      </h4>
                      <div className="text-xs text-slate-500">{off.address}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    Services Configured ({offServices.length}):
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {offServices.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                        >
                          {s.title} (Govt: ₹{s.government_fee} | Buddy: ₹{s.queue_buddy_base_fee})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Disputes & Refunds */}
      {activeTab === 'disputes' && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Customer Disputes & Refund Requests
          </div>

          {disputes.map((disp) => (
            <div
              key={disp.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-500">
                    Booking: {disp.booking_code}
                  </span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                    Customer: {disp.customer_name}
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    disp.status === 'open'
                      ? 'bg-rose-500/20 text-rose-500'
                      : 'bg-emerald-500/20 text-emerald-500'
                  }`}
                >
                  {disp.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                &ldquo;{disp.reason}&rdquo;
              </p>

              {disp.status === 'open' && (
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => resolveDispute(disp.id, 'refunded', 'Approved 100% test refund via Razorpay.')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                  >
                    Issue 100% Razorpay Refund
                  </button>
                  <button
                    onClick={() => resolveDispute(disp.id, 'resolved', 'Rescheduled booking with priority buddy.')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold transition-colors"
                  >
                    Resolve & Close
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Unserved Demand (Expansion Analytics) */}
      {activeTab === 'demand' && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Demand Capture from Unserved Bengaluru Locations
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-slate-900 to-slate-900 border border-purple-500/30 text-xs text-purple-200">
            Every time a customer visits a &ldquo;Coming Soon&rdquo; office (e.g. Yelahanka Taluk Office, Malleshwaram BWSSB) and clicks &ldquo;Notify Me&rdquo;, their interest is captured here to prioritize our next office launch.
          </div>

          {demands.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              No demand entries yet. Click &ldquo;Notify Me&rdquo; on any Coming Soon office in the directory to test this pipeline!
            </div>
          ) : (
            demands.map((dem) => (
              <div
                key={dem.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Contact: {dem.phone_or_email}
                  </span>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Interest: {dem.service_interest || 'General Office Assistance'}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(dem.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
