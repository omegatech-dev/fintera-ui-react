import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
vi.stubEnv('NODE_ENV', 'development')

// Mock Rollbar module
vi.mock('@rollbar/react', () => {
  const mockRollbar = {
    error: vi.fn(),
  }
  return {
    useRollbar: vi.fn(() => mockRollbar),
  }
})

import { useRollbar } from '@rollbar/react'
// Mock LocaleContext with absolute path
vi.mock('src/contexts/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    setLocale: () => { },
    t: (key) => {
      const translations = {
        'common.retry': 'Retry',
        'errors.somethingWentWrong': 'Something went wrong.',
      };
      return translations[key] || key;
    },
    getSupportedLocales: () => ['en', 'es'],
    getCurrentLocaleName: () => 'English',
  }),
  LocaleProvider: ({ children }) => children,
}));

import ErrorBoundary from '../ErrorBoundary.jsx'

function Thrower({ shouldThrow }) {
  if (shouldThrow) throw new Error('boom')
  return <div>Rendered OK</div>
}

describe('ErrorBoundary', () => {
  let consoleWarnSpy, consoleErrorSpy;

  beforeEach(() => {
    // Suppress console warnings and errors during ErrorBoundary tests
    // These are expected when testing error boundaries
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks()
  })

  it('captures exception and renders fallback, allows retry', async () => {
    const mockRollbar = useRollbar()
    const { rerender } = render(
      <ErrorBoundary fallback={<div>Fallback UI</div>}>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>
    )

    // Fallback shown
    expect(screen.getByText('Fallback UI')).toBeTruthy()

    // Rollbar.error called
    expect(mockRollbar.error).toHaveBeenCalled()

    // Now retry: re-render with a non-throwing child
    const retryBtn = screen.getByText('common.retry')
    fireEvent.click(retryBtn)

    rerender(
      <ErrorBoundary fallback={<div>Fallback UI</div>}>
        <Thrower shouldThrow={false} />
      </ErrorBoundary>
    )

    // After rerender, the child should render
    expect(screen.getByText('Rendered OK')).toBeTruthy()
  })
})
