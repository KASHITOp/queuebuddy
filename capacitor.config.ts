import type { CapacitorConfig } from '@capacitor/cli';

// By default the APK bundles the static export in dist-mobile/ (npm run build:mobile), so it opens instantly and works offline.
// Set CAPACITOR_SERVER_URL to load a live site instead, e.g. http://10.0.2.2:3000 for the emulator
// (10.0.2.2 is the host machine's localhost) or https://queuebuddy-amber.vercel.app for real Supabase Auth/OAuth.
const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.queuebuddy.app',
  appName: 'QueueBuddy',
  webDir: 'dist-mobile',
  backgroundColor: '#09090B',
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith('http://'),
      }
    : {
        androidScheme: 'https',
      },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SystemBars: {
      insetsHandling: 'css',
    },
  },
  android: {
    allowMixedContent: !!serverUrl,
    captureInput: true,
    webContentsDebuggingEnabled: !!serverUrl,
  },
};

export default config;
