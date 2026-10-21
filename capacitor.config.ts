import type { CapacitorConfig } from '@capacitor/cli';

// Pointing to deployed Vercel URL ensures Supabase Auth, Google OAuth,
// API routes (/api/webhooks/razorpay), and Realtime work without broken WebView schemes.
const isLiveServer = process.env.CAPACITOR_LIVE !== 'false';
const vercelUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://queuebuddy.vercel.app';

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
