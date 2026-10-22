import type { CapacitorConfig } from '@capacitor/cli';

// Pointing to deployed Vercel URL ensures Supabase Auth, Google OAuth,
// API routes (/api/webhooks/razorpay), and Realtime work without broken WebView schemes.
// CAPACITOR_SERVER_URL overrides the target for local testing, e.g. http://10.0.2.2:3000
// (10.0.2.2 is the host machine's localhost as seen from the Android emulator).
const isLiveServer = process.env.CAPACITOR_LIVE !== 'false';
const vercelUrl =
  process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://queuebuddy-amber.vercel.app';

const config: CapacitorConfig = {
  appId: 'com.queuebuddy.app',
  appName: 'QueueBuddy',
  webDir: 'public',
  server: isLiveServer
    ? {
        url: vercelUrl,
        cleartext: true,
      }
    : undefined,
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
