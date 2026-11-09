import { render, screen } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import PaymentTimeline from '../PaymentTimeline';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

expect.extend(matchers);

// Mock useLocale
vi.mock('@/contexts/LocaleContext', () => ({
  useLocale: () => ({
    t: (key) => key,
    locale: 'en',
  }),
}));

// Mock useToast
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Mock paymentsApi
vi.mock('@/features/payments/api', () => ({
  paymentsApi: {
    uploadReceipt: vi.fn(),
  },
}));

describe('PaymentTimeline', () => {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const pastDate = new Date(Date.now() - 5 * DAY_MS).toISOString().slice(0, 10);
  const futureDate = new Date(Date.now() + 5 * DAY_MS).toISOString().slice(0, 10);

  const mockPayments = [
    { id: 1, status: 'REJECTED', amount: 100, due_date: pastDate },
    { id: 2, status: 'OVERDUE', amount: 200, due_date: pastDate },
    { id: 3, status: 'UPCOMING', amount: 300, due_date: futureDate }
  ];

  it('categorizes payments correctly', () => {
    // We need to pass mock payments and a handler
    render(<PaymentTimeline payments={mockPayments} onPaymentSuccess={() => {}} />);

    // Check for section headers (the keys are used as text by the mock).
    // Scope to headings because the overdue key also appears as a card status.
    expect(screen.getByRole('heading', { name: 'payments.rejectedPayments' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'payments.overdue' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'payments.upcoming' })).toBeInTheDocument();
  });

  it('shows empty state when no payments', () => {
    render(<PaymentTimeline payments={[]} onPaymentSuccess={() => {}} />);
    expect(screen.getByText('payments.noPayments')).toBeInTheDocument();
  });
});
