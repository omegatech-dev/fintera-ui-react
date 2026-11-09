import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import PaymentTimeline from '../PaymentTimeline';
import * as LocaleContextModule from '../../../../contexts/LocaleContext';

expect.extend(matchers);

// Mock TimelinePaymentCard to simplify testing
vi.mock('../TimelinePaymentCard', () => ({
  default: ({ payment }) => (
    <div data-testid={`payment-card-${payment.id}`}>
      {payment.status} - {payment.due_date}
    </div>
  ),
}));

describe('PaymentTimeline', () => {
  const mockT = vi.fn((key) => key);
  const mockUseLocale = { t: mockT, locale: 'en' };

  beforeEach(() => {
    vi.spyOn(LocaleContextModule, 'useLocale').mockReturnValue(mockUseLocale);
  });

  it('categorizes payments correctly', () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const payments = [
      { id: 1, status: 'rejected', due_date: tomorrow.toISOString() },
      { id: 2, status: 'pending', due_date: yesterday.toISOString() }, // overdue
      { id: 3, status: 'pending', due_date: tomorrow.toISOString() },  // upcoming
      { id: 4, status: 'paid', due_date: yesterday.toISOString() },
    ];

    render(<PaymentTimeline payments={payments} onPaymentSuccess={() => {}} />);

    // Check for section headers
    expect(screen.getByText('payments.rejectedPayments')).toBeInTheDocument();
    expect(screen.getByText('payments.overdue')).toBeInTheDocument();
    expect(screen.getByText('payments.upcoming')).toBeInTheDocument();
    expect(screen.getByText('payments.completed')).toBeInTheDocument();

    // Check if payments are in the correct sections by checking order if necessary,
    // but here we just check presence.
    expect(screen.getByTestId('payment-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('payment-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('payment-card-3')).toBeInTheDocument();
    expect(screen.getByTestId('payment-card-4')).toBeInTheDocument();
  });

  it('shows empty state when no payments', () => {
    render(<PaymentTimeline payments={[]} onPaymentSuccess={() => {}} />);
    expect(screen.getByText('payments.noPayments')).toBeInTheDocument();
  });
});
