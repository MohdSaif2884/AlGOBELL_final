import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fcee7594677f44ddbc4ecf5e2b905be6',
  appName: 'AlgoBell',
  webDir: 'dist',
  server: {
    url: 'https://fcee7594-677f-44dd-bc4e-cf5e2b905be6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f0f0f',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f0f0f',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#6366f1',
      sound: 'alarm.wav',
    },
  },
};

export default config;
