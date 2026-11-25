import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Regression test for the white screen on boot: without VITE_ROLLBAR_ACCESS_TOKEN
// the app used to mount no RollbarProvider at all, and the error boundary's
// useRollbar() crashed the whole tree. main.jsx now always mounts the provider,
// with the inert stub when the token is absent. This test exercises the real
// @rollbar/react bindings the way main.jsx wires them.

vi.mock('@/contexts/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    setLocale: () => { },
    t: (key) => (key === 'errors.somethingWentWrong' ? 'Something went wrong.' : key),
    getSupportedLocales: () => ['en', 'es'],
    getCurrentLocaleName: () => 'English',
  }),
  LocaleProvider: ({ children }) => children,
}));

import { Provider as RollbarProvider } from '@rollbar/react'
import { createNoopRollbar } from '../../../lib/noopRollbar'
import ErrorBoundary from '../ErrorBoundary.jsx'

function Thrower() {
  throw new Error('boom')
}

describe('ErrorBoundary under the no-token provider wiring', () => {
  it('renders children when the provider holds the inert stub', () => {
    render(
      <RollbarProvider instance={createNoopRollbar()}>
        <ErrorBoundary fallback={<div>Fallback UI</div>}>
          <div>Rendered OK</div>
        </ErrorBoundary>
      </RollbarProvider>
    )

    expect(screen.getByText('Rendered OK')).toBeTruthy()
  })

  it('shows the fallback instead of crashing when a child throws', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

    render(
      <RollbarProvider instance={createNoopRollbar()}>
        <ErrorBoundary fallback={<div>Fallback UI</div>}>
          <Thrower />
        </ErrorBoundary>
      </RollbarProvider>
    )

    expect(screen.getByText('Fallback UI')).toBeTruthy()
    consoleErrorSpy.mockRestore()
  })
})
