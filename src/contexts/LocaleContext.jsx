/* eslint-disable react-refresh/only-export-components -- this context file intentionally exports the LocaleProvider and useLocale hook together. */
import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';
import AuthContext from './AuthContext';
import { useGeneralSettings } from './generalSettings';

// Constants
const STORAGE_KEY = 'userLocale';
const DEFAULT_LOCALE = 'es';
const FALLBACK_LOCALE = 'en';

// Supported locales configuration
const SUPPORTED_LOCALES = {
  en: 'English',
  es: 'Español'
};

const translations = {
  en: enTranslations,
  es: esTranslations
};

// Utility functions
const getNestedValue = (obj, path) => {
  return path.reduce((current, key) => current?.[key], obj);
};

const replaceParams = (template, params) => {
  return Object.entries(params).reduce((str, [key, value]) => {
    return str.replaceAll(`{${key}}`, String(value));
  }, template);
};

const isValidTranslation = (value) => {
  return typeof value === 'string' && value.length > 0;
};

const LocaleContext = createContext();

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    if (process.env.NODE_ENV === 'development') {
      // During hot reload, the context may be temporarily missing.
      // Return a fallback context to prevent crashes.
      console.warn('useLocale called outside LocaleProvider (may be due to hot reload). Returning fallback.');
      return {
        locale: DEFAULT_LOCALE,
        setLocale: () => { },
        t: (key, params = {}) => {
          // Simple fallback translation: return key, optionally replace params
          if (Object.keys(params).length > 0) {
            return Object.entries(params).reduce((str, [key, value]) =>
              str.replaceAll(`{${key}}`, String(value)), key);
          }
          return key;
        },
        getSupportedLocales: () => ['en', 'es'],
        getCurrentLocaleName: () => 'English'
      };
    }
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

export const LocaleProvider = ({ children }) => {
  const { settings: generalSettings } = useGeneralSettings();
  const regionalDefault = generalSettings?.default_locale;
  // Initialize from localStorage directly to avoid flicker
  const [locale, setLocale] = useState(() => {
    try {
      const savedLocale = localStorage.getItem(STORAGE_KEY);
      if (savedLocale && translations[savedLocale]) return savedLocale;
      if (regionalDefault && translations[regionalDefault]) return regionalDefault;
      return DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  });

  const { user } = useContext(AuthContext);
  const userSelectedRef = useRef(false);

  // Follow the deployment default only when the user has not chosen a locale.
  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem(STORAGE_KEY);
      if (!savedLocale && regionalDefault && translations[regionalDefault] && regionalDefault !== locale) {
        setLocale(regionalDefault);
      }
    } catch {
      // Storage unavailable: keep the current locale.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionalDefault]);

  // Sync with AuthContext user locale if available.
  // Depend on user?.locale so this only fires when the locale property
  // actually changes (e.g. on login or after saving profile), not on every
  // unrelated user-object mutation.
  const userLocale = user?.locale;
  useEffect(() => {
    if (userLocale && translations[userLocale] && userLocale !== locale) {
      userSelectedRef.current = true;
      setLocale(userLocale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocale]);

  // Save locale to localStorage only after an explicit user choice. This keeps
  // the deployment default usable until the user picks a language.
  useEffect(() => {
    if (!userSelectedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch (error) {
      console.warn('Failed to save locale to localStorage:', error);
    }
  }, [locale]);

  // Keep the document language in sync so screen readers and the browser
  // hyphenation follow the active locale.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = useCallback((key, params = {}) => {
    const keys = key.split('.');
    let value = getNestedValue(translations[locale], keys);

    // If translation not found, try fallback locale
    if (!isValidTranslation(value) && locale !== FALLBACK_LOCALE) {
      value = getNestedValue(translations[FALLBACK_LOCALE], keys);
    }

    // If still not found, return the key with a warning
    if (!isValidTranslation(value)) {
      console.warn(`Translation key "${key}" not found for locale "${locale}"`);
      return key;
    }

    // Replace parameters in the translation string
    return Object.keys(params).length > 0 ? replaceParams(value, params) : value;
  }, [locale]);

  const changeLocale = useCallback((newLocale) => {
    if (SUPPORTED_LOCALES[newLocale]) {
      userSelectedRef.current = true;
      setLocale(newLocale);
    } else {
      console.warn(`Locale "${newLocale}" is not supported. Supported locales:`, Object.keys(SUPPORTED_LOCALES));
    }
  }, []);

  const getSupportedLocales = useCallback(() => {
    return Object.keys(SUPPORTED_LOCALES);
  }, []);

  const getCurrentLocaleName = useCallback(() => {
    return SUPPORTED_LOCALES[locale] || locale;
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    setLocale: changeLocale,
    t,
    getSupportedLocales,
    getCurrentLocaleName
  }), [locale, changeLocale, t, getSupportedLocales, getCurrentLocaleName]);

  // In development, validate all translation keys exist
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-unused-vars
    const validateTranslations = (locale, translations) => {
      // Check for missing keys compared to fallback
      // Log warnings for incomplete translations
      console.warn('Translation incomplete:', locale, translations);
    };
  }

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};