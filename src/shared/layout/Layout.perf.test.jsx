import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import Layout from './Layout';
import AuthContext from '../../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock child components
vi.mock('../sidebar', () => ({
  Sidebar: () => <div>Sidebar</div>,
}));
vi.mock('../overlays', () => ({
  Overlay: () => <div>Overlay</div>,
  OnboardingTour: () => <div>OnboardingTour</div>,
}));
vi.mock('../header', () => ({
  HeaderOne: () => <div>HeaderOne</div>,
  HeaderTwo: () => <div>HeaderTwo</div>,
}));
vi.mock('./BottomNav', () => ({
  default: () => <nav>BottomNav</nav>,
}));

describe('Layout Performance', () => {
  const mockUser = { name: 'Test User' };
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads from localStorage efficiently (only on mount)', () => {
    // Set up initial localStorage state
    localStorage.setItem('theme', 'dark');

    // Spy on the storage instance used by the app and tests
    const getItemSpy = vi.spyOn(localStorage, 'getItem');

    // Initial render
    const { rerender } = render(
      <AuthContext.Provider value={{ user: mockUser, logout: mockLogout }}>
        <BrowserRouter>
          <Layout>
            <div>Content 1</div>
          </Layout>
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Get count after initial render
    const initialCallCount = getItemSpy.mock.calls.filter(call => call[0] === 'theme').length;

    // Expect only 1 call on mount (lazy initialization)
    expect(initialCallCount).toBe(1);

    // Force re-render with new props/children
    rerender(
      <AuthContext.Provider value={{ user: mockUser, logout: mockLogout }}>
        <BrowserRouter>
          <Layout>
            <div>Content 2</div>
          </Layout>
        </BrowserRouter>
      </AuthContext.Provider>
    );

    const totalCallCount = getItemSpy.mock.calls.filter(call => call[0] === 'theme').length;
    const reRenderCallCount = totalCallCount - initialCallCount;

    // Expect 0 calls on re-render
    expect(reRenderCallCount).toBe(0);
  });
});
