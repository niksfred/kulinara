import type { ExpoConfig } from 'expo/config';
import appJson from './app.json';

export default (): ExpoConfig => ({
  ...(appJson.expo as ExpoConfig),
  // Local proof of concept only: extra is public and is embedded in app builds.
  // A distributed app must call a backend that keeps the provider key server-side.
  extra: {
    openaiApiKey: process.env.OPENAI_API_KEY?.trim() ?? '',
  },
});
