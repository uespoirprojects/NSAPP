import React, { createContext, ReactNode, useContext } from 'react';
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
  const { i18n, t } = useTranslation();

  const changeLanguage = async (language: SupportedLanguage) => {
    try {
      const { changeLanguage: changeI18nLanguage } = await import('@/i18n/config');
      await changeI18nLanguage(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const contextValue: I18nContextType = {
    currentLanguage: ((i18n.language || 'fr') as SupportedLanguage),
    changeLanguage,
    t,
  };

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
