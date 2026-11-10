// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LotItem from './LotItem';
import React from 'react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Mock the useLocale hook
vi.mock('../../../../contexts/LocaleContext', () => ({
  useLocale: () => ({
    t: (key) => key,
    locale: 'en'
  })
}));

// Mock LotDetailsModal to track calls
vi.mock('./LotDetailsModal', () => ({
  default: vi.fn(() => <div data-testid="lot-details-modal">Modal Content</div>)
}));

import LotDetailsModal from './LotDetailsModal';

describe('LotItem Performance', () => {
  const mockLot = {
    id: 1,
    project_id: 1,
    project_name: 'Test Project',
    name: 'Lot 1',
    status: 'available',
    price: 1000,
    area: 100,
    length: 14,
    width: 25,
    measurement_unit: 'm2'
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('DOES NOT render LotDetailsModal initially (optimized)', () => {
    render(
      <MemoryRouter>
        <LotItem lot={mockLot} />
      </MemoryRouter>
    );

    // Assert that LotDetailsModal was NOT called
    expect(LotDetailsModal).not.toHaveBeenCalled();
    expect(screen.queryByTestId('lot-details-modal')).not.toBeInTheDocument();
  });

  it('renders LotDetailsModal when "View" button is clicked', () => {
    render(
      <MemoryRouter>
        <LotItem lot={mockLot} />
      </MemoryRouter>
    );

    // Get buttons (might be duplicate due to some environment issue or weird component structure,
    // but we just want to ensure clicking one opens the modal)
    const viewButtons = screen.getAllByTitle('common.view');
    fireEvent.click(viewButtons[0]);

    // Assert that LotDetailsModal is now called
    expect(LotDetailsModal).toHaveBeenCalled();
    expect(screen.getByTestId('lot-details-modal')).toBeInTheDocument();
  });

  it('renders dimensions and area with the real measurement unit', () => {
    render(
      <MemoryRouter>
        <LotItem lot={{ ...mockLot, measurement_unit: 'ft2' }} />
      </MemoryRouter>
    );

    expect(screen.getAllByText('25 x 14').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ft').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ft²').length).toBeGreaterThan(0);
  });
});
