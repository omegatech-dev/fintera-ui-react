import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ModeToggler from './ModeToggler';
import { ThemeContext } from '../../contexts/ThemeContext';

vi.mock('../../contexts/LocaleContext', () => ({
  useLocale: () => ({ t: (key) => key, locale: 'en' }),
}));

describe('ModeToggler Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('accesses localStorage only on mount, not on every render', () => {
    const getItemSpy = vi.spyOn(localStorage, 'getItem');

    const theme = 'dark';
    const setTheme = vi.fn();

    const { rerender } = render(
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <ModeToggler />
      </ThemeContext.Provider>
    );

    // Should call getItem once after mount (in useEffect)
    const initialCalls = getItemSpy.mock.calls.filter(call => call[0] === 'theme').length;
    expect(initialCalls).toBe(1);

    // Re-render
    rerender(
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <ModeToggler />
      </ThemeContext.Provider>
    );

    const totalCalls = getItemSpy.mock.calls.filter(call => call[0] === 'theme').length;

    // Should still have only 1 call total (no new calls on re-render)
    expect(totalCalls).toBe(initialCalls);
  });
});
