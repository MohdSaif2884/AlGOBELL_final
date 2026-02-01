import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// Check if running on native platform
export const isNative = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

// Initialize native features
export const initializeNativeApp = async () => {
  if (!isNative()) return;
  
  try {
    // Hide splash screen after app is ready
    await SplashScreen.hide();
    
    // Set status bar style for dark theme
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0f0f0f' });
    
    // Request notification permissions
    await requestNotificationPermission();
  } catch (error) {
    console.log('Native initialization error:', error);
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!isNative()) return true;
  
  try {
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === 'granted';
  } catch (error) {
    console.log('Notification permission error:', error);
    return false;
  }
};

// Schedule a local notification for contest reminder
export const scheduleContestNotification = async (
  contestId: string,
  contestName: string,
  platform: string,
  triggerTime: Date,
  offsetMinutes: number
) => {
  if (!isNative()) return null;
  
  try {
    const notificationId = Math.floor(Math.random() * 100000);
    
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title: `🔔 ${contestName}`,
          body: `Contest starts in ${offsetMinutes} minutes! Get ready on ${platform}`,
          schedule: { at: triggerTime },
          sound: 'alarm.wav',
          extra: {
            contestId,
            platform,
          },
          channelId: 'contest-reminders',
        },
      ],
    });
    
    return notificationId;
  } catch (error) {
    console.log('Schedule notification error:', error);
    return null;
  }
};

// Cancel a scheduled notification
export const cancelContestNotification = async (notificationId: number) => {
  if (!isNative()) return;
  
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: notificationId }],
    });
  } catch (error) {
    console.log('Cancel notification error:', error);
  }
};

// Create notification channel for Android
export const createNotificationChannel = async () => {
  if (!isNative() || getPlatform() !== 'android') return;
  
  try {
    await LocalNotifications.createChannel({
      id: 'contest-reminders',
      name: 'Contest Reminders',
      description: 'Notifications for upcoming coding contests',
      importance: 5, // Max importance
      visibility: 1,
      sound: 'alarm.wav',
      vibration: true,
      lights: true,
      lightColor: '#6366f1',
    });
  } catch (error) {
    console.log('Create channel error:', error);
  }
};
