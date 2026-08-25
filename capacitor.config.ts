import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.mimon.obiekty',
  appName: 'Ewidencja Obiektów',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#f3f6f9',
    webContentsDebuggingEnabled: true,
    captureInput: true,
  },
}

export default config
