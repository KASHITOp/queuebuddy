'use client';

import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';

/**
 * Checks if the application is currently running inside the native Android or iOS Capacitor wrapper.
 */
export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

export type HapticKind = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'selection';

/**
 * Tactile feedback for taps and queue events. Native vibration engine inside the APK, navigator.vibrate on the web.
 */
export const haptic = (kind: HapticKind = 'light') => {
  if (isNativeApp()) {
    const run =
      kind === 'success'
        ? Haptics.notification({ type: NotificationType.Success })
        : kind === 'warning'
        ? Haptics.notification({ type: NotificationType.Warning })
        : kind === 'selection'
        ? Haptics.selectionChanged()
        : Haptics.impact({
            style:
              kind === 'heavy' ? ImpactStyle.Heavy : kind === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light,
          });
    run.catch(() => undefined);
    return;
  }
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(kind === 'success' || kind === 'warning' ? [12, 40, 12] : kind === 'heavy' ? 20 : 8);
    } catch {
      // Some browsers block vibration without a user gesture.
    }
  }
};

/**
 * Light status/navigation bar icons over the dark app background.
 */
export const applyNativeSystemBars = () => {
  if (!isNativeApp()) return;
  SystemBars.setStyle({ style: SystemBarsStyle.Dark }).catch(() => undefined);
};

/**
 * Routes the Android hardware back button to `handler`. Returning false from the handler exits the app.
 */
export const onNativeBackButton = (handler: () => boolean) => {
  if (!isNativeApp()) return () => undefined;
  const listener = App.addListener('backButton', () => {
    if (!handler()) App.exitApp();
  });
  return () => {
    listener.then((l) => l.remove()).catch(() => undefined);
  };
};

/**
 * Capture photo via native device camera or file gallery.
 * Used for Buddy ID verification & Counter spot receipt photo.
 */
export const captureDevicePhoto = async (): Promise<string | null> => {
  try {
    const photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt, // Prompts user to pick Camera or Gallery
    });
    return photo.webPath || photo.path || null;
  } catch (error) {
    console.warn('[QueueBuddy Device] Camera canceled or permission denied:', error);
    return null;
  }
};

/**
 * Obtains device GPS coordinates.
 * Used to calculate accurate walking/driving distance to Bengaluru offices.
 */
export const getDeviceLocation = async (): Promise<{ lat: number; lng: number } | null> => {
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  } catch (error) {
    console.warn('[QueueBuddy Device] Geolocation failed or denied:', error);
    // Fallback: Central Bengaluru (Vidhana Soudha / MG Road)
    return { lat: 12.9716, lng: 77.5946 };
  }
};

/**
 * Registers device for native Android Firebase Cloud Messaging push notifications.
 * Used for live queue calls ("Only 3 people ahead! Head to counter now").
 */
export const setupPushNotifications = async (): Promise<string | null> => {
  if (!isNativeApp()) {
    console.log('[QueueBuddy PWA] Using web push notification listener.');
    return null;
  }

  try {
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[QueueBuddy Push] Push notifications permission was denied.');
      return null;
    }

    await PushNotifications.register();

    return new Promise((resolve) => {
      PushNotifications.addListener('registration', (token) => {
        console.log('[QueueBuddy Push] Native FCM Device Token:', token.value);
        resolve(token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('[QueueBuddy Push] FCM Registration error:', error);
        resolve(null);
      });

      // Listen for notifications while app is in foreground
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('[QueueBuddy Push] Push received:', notification);
      });

      // Listen for notification tap
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('[QueueBuddy Push] Push action performed:', notification);
      });
    });
  } catch (error) {
    console.error('[QueueBuddy Push] Setup error:', error);
    return null;
  }
};
