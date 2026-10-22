'use client';

import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Download, Sparkles } from 'lucide-react';
import { isNativeApp } from '@/lib/capacitor';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'other'>('other');

  useEffect(() => {
    // Inside the Android app there is nothing to install, and a service worker would only cache stale bundles.
    if (typeof window === 'undefined' || isNativeApp()) return;

    // 1. Globally register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[QueueBuddy PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[QueueBuddy PWA] Service Worker registration failed:', err);
        });
    }

    // Check if already in standalone mode (installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // 2. Track visit frequency
    let visits = 1;
    try {
      const storedVisits = localStorage.getItem('qb_pwa_visits');
      const sessionCounted = sessionStorage.getItem('qb_pwa_session_counted');

      if (!sessionCounted) {
        visits = storedVisits ? parseInt(storedVisits, 10) + 1 : 1;
        localStorage.setItem('qb_pwa_visits', visits.toString());
        sessionStorage.setItem('qb_pwa_session_counted', 'true');
      } else {
        visits = storedVisits ? parseInt(storedVisits, 10) : 1;
      }
    } catch {
      visits = 2; // fallback if cookies/storage blocked
    }

    // 3. Check 14-day dismissal cooldown
    try {
      const dismissedUntil = localStorage.getItem('qb_pwa_dismissed_until');
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        return; // still in 14-day cooldown
      }
    } catch {
      // ignore
    }

    // Detect OS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    if (isIos) {
      setPlatform('ios');
      // Show on iOS if 2nd visit or more
      if (visits >= 2) {
        setShowPrompt(true);
      }
    } else {
      setPlatform(isAndroid ? 'android' : 'other');
    }

    // 4. Capture Android Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Only show after second visit
      if (visits >= 2) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem(
        'qb_pwa_dismissed_until',
        (Date.now() + DISMISS_DURATION_MS).toString()
      );
    } catch {
      // ignore
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      console.log('[QueueBuddy PWA] User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <aside
      aria-label="Install QueueBuddy Application"
      className="fixed bottom-[calc(64px+var(--sab))] left-0 right-0 z-50 p-3 sm:p-4 animate-in slide-in-from-bottom duration-300 pointer-events-none"
    >
      <div className="max-w-md mx-auto bg-night-700 border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5 pointer-events-auto">
        {/* Header & Dismiss Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
              <span className="font-display font-black text-xl text-ink">Q</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display font-black text-sm text-ink">
                  Install QueueBuddy
                </h3>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand text-night border border-white/10">
                  BLR App
                </span>
              </div>
              <p className="text-[11px] text-ink-mute leading-tight mt-0.5">
                Install for instant live queue pings & counter-ready checklists.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="p-1 rounded-full text-ink-faint hover:text-ink hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Platform-Specific Instruction Body */}
        {platform === 'ios' ? (
          // iOS Safari Step-by-Step Instructions
          <div className="p-3 rounded-2xl bg-night border border-white/10 space-y-2 text-xs text-ink">
            <div className="text-[10px] font-mono font-black uppercase tracking-wider text-ink-mute">
              HOW TO INSTALL ON IPHONE SAFARI:
            </div>
            <ol className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand text-night font-mono font-black text-[10px] flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  Tap the <strong className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/10 text-ink font-bold"><Share className="w-3 h-3 text-mint" /> Share</strong> button in Safari toolbar.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand text-night font-mono font-black text-[10px] flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  Scroll down and tap <strong className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/10 text-ink font-bold"><PlusSquare className="w-3 h-3 text-coral" /> Add to Home Screen</strong>.
                </span>
              </li>
            </ol>
            <div className="pt-1 flex gap-2">
              <button
                onClick={handleDismiss}
                className="w-full py-2.5 px-3 rounded-xl bg-ink text-night font-black text-xs active:scale-95 transition-transform"
              >
                Got It
              </button>
            </div>
          </div>
        ) : (
          // Android Chrome / Desktop Install Button
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="py-2.5 px-3 rounded-xl bg-white/[0.05] text-ink-mute font-bold text-xs hover:text-ink transition-colors"
            >
              Not Now
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2.5 px-4 rounded-xl bg-brand text-night font-black text-xs border border-white/10 shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 touch-target"
            >
              <Download className="w-4 h-4" />
              <span>Install QueueBuddy</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
