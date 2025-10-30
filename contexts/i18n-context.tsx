import i18n, { changeLanguage as changeI18nLanguage } from '@/i18n/config';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type SupportedLanguage = 'fr' | 'ht' | 'en' | 'es';

interface I18nContextType {
  currentLanguage: SupportedLanguage;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  // useTranslation automatically subscribes to language changes and triggers re-renders
  const { t: i18nT, i18n: i18nInstance } = useTranslation();
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>((i18n.language as SupportedLanguage) || 'fr');

  // Update currentLang when language changes - this ensures UI reflects the change
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      const newLang = (lng as SupportedLanguage) || 'fr';
      setCurrentLang(newLang);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    // Also set initial language
    setCurrentLang((i18n.language as SupportedLanguage) || 'fr');

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  // Use i18nT directly from useTranslation - it's already reactive
  const t = React.useCallback((key: string): string => {
    if (i18n.isInitialized) {
      return i18nT(key);
    }
    return key; // Return key if not initialized yet
  }, [i18nT]); // Remove currentLang dependency - i18nT already handles reactivity

  const changeLanguage = React.useCallback(async (language: SupportedLanguage) => {
    try {
      await changeI18nLanguage(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, []);

  const contextValue: I18nContextType = React.useMemo(
    () => ({
      currentLanguage: currentLang,
      changeLanguage,
      t,
    }),
    [currentLang, changeLanguage, t]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }

  // Also subscribe to react-i18next's translation hook to ensure reactivity
  // This will cause components to re-render when language changes
  useTranslation();

  return context;
}
