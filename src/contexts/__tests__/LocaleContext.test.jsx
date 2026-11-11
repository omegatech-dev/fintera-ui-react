
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { LocaleProvider, useLocale } from '../LocaleContext';
import AuthContext from '../AuthContext';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGeneralSettings } from '../generalSettings';

vi.mock('../generalSettings', () => ({
  useGeneralSettings: vi.fn(),
}));

// Mock AuthContext
const MockAuthProvider = ({ children, user }) => (
  <AuthContext.Provider value={{ user }}>
    {children}
  </AuthContext.Provider>
);

const TestComponent = ({ fallbackKey }) => {
  const { t } = useLocale();
  return (
    <div>
      <div data-testid="simple">{t('common.save')}</div>
      <div data-testid="params">{t('payments.welcomeMessage', { name: 'Alice' })}</div>
      <div data-testid="fallback">{t('non.existent.key')}</div>
      {fallbackKey && <div data-testid="fallback-template">{t(fallbackKey, { name: 'Bob' })}</div>}
    </div>
  );
};

describe('LocaleContext', () => {
  let consoleWarnSpy;

  beforeEach(() => {
    // Suppress console.warn for these tests since we're intentionally testing missing keys
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
    window.localStorage.clear();
    useGeneralSettings.mockReturnValue({ settings: { default_locale: 'en' } });
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    cleanup();
  });

  it('provides translations and replaces parameters', () => {
    render(
      <MockAuthProvider user={{ locale: 'en' }}>
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>
      </MockAuthProvider>
    );

    expect(screen.getByTestId('simple').textContent).toBe('Save');
    expect(screen.getByTestId('params').textContent).toBe('Welcome Alice, here you can see your financial summary');
    expect(screen.getByTestId('fallback').textContent).toBe('non.existent.key');
  });

  it('returns key when translation is missing, without parameter replacement', () => {
    render(
      <MockAuthProvider user={{ locale: 'en' }}>
        <LocaleProvider>
          <TestComponent fallbackKey="Template {name}" />
        </LocaleProvider>
      </MockAuthProvider>
    );

    // As per current implementation, if key is missing, it returns the key as is, skipping parameter replacement.
    expect(screen.getByTestId('fallback-template').textContent).toBe('Template {name}');
  });

  it('uses the deployment default locale when the user has not chosen one', () => {
    render(
      <MockAuthProvider user={null}>
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>
      </MockAuthProvider>
    );

    expect(screen.getByTestId('simple').textContent).toBe('Save');
  });

  it('keeps an explicit saved locale over the deployment default', () => {
    window.localStorage.setItem('userLocale', 'es');

    render(
      <MockAuthProvider user={null}>
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>
      </MockAuthProvider>
    );

    expect(screen.getByTestId('simple').textContent).toBe('Guardar');
  });
});
