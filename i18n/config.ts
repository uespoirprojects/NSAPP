import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ht from './locales/ht.json';

const LANGUAGE_STORAGE_KEY = '@app_language';

// Detect device locale and map to supported languages
const detectDeviceLanguage = (): string => {
  try {
    const locales = Localization.getLocales();
    const deviceLocale = locales?.[0]?.languageCode || 'fr';
    
    // Map device locale to supported languages
    const languageMap: { [key: string]: string } = {
      'fr': 'fr',
      'ht': 'ht', // Haitian Creole
      'en': 'en',
      'es': 'es',
      'en-US': 'en',
      'en-GB': 'en',
      'fr-FR': 'fr',
      'fr-CA': 'fr',
      'es-ES': 'es',
      'es-MX': 'es',
      'es-US': 'es',
    };
    
    return languageMap[deviceLocale] || 'fr'; // Default to French
  } catch (error) {
    console.error('Failed to detect device language:', error);
    return 'fr'; // Default to French on error
  }
};

// Initialize i18n
export const initI18n = async () => {
  try {
    // Try to load saved language preference
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    const language = savedLanguage || detectDeviceLanguage();

    await i18n
      .use(initReactI18next)
      .init({
        compatibilityJSON: 'v3',
        resources: {
          fr: { translation: fr },
          ht: { translation: ht },
          en: { translation: en },
          es: { translation: es },
        },
        lng: language,
        fallbackLng: 'fr', // Default to French
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
    // Initialize with French as fallback
    await i18n.use(initReactI18next).init({
      compatibilityJSON: 'v3',
      resources: {
        fr: { translation: fr },
        ht: { translation: ht },
        en: { translation: en },
        es: { translation: es },
      },
      lng: 'fr',
      fallbackLng: 'fr',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
  }
};

export const changeLanguage = async (language: 'fr' | 'ht' | 'en' | 'es') => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Failed to change language:', error);
  }
};

export default i18n;
