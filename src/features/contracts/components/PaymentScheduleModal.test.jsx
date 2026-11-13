import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import PaymentScheduleModal from './PaymentScheduleModal';
import PaymentScheduleTab from './PaymentScheduleTab'; // This is the mocked module
import AuthContext from '../../../contexts/AuthContext';
import { LocaleProvider } from '../../../contexts/LocaleContext';
import { ToastProvider } from '../../../contexts/ToastContext';

// Extend expect with jest-dom matchers
expect.extend(matchers);

// Mock child components
vi.mock('./PaymentScheduleTab', async () => {
  const React = await import('react');
  const spy = vi.fn(({ onUndoPayment }) => (
    <div data-testid="payment-schedule-tab">
      Payment Schedule Tab
      <button
        onClick={() => onUndoPayment && onUndoPayment(1)}
        data-testid="trigger-undo"
      >
        Trigger Undo
      </button>
    </div>
  ));

  const Memoized = React.memo(spy);
  // Attach spy to the memoized component so we can access it in test
  Memoized.spy = spy;

  return {
    __esModule: true,
    default: Memoized
  };
});

vi.mock('./LedgerEntriesTab', () => ({
  default: () => <div>Ledger Entries Tab</div>
}));

vi.mock('./ContractNotesTab', () => ({
  default: () => <div>Contract Notes Tab</div>
}));

vi.mock('./CreditScoreCard', () => ({
  default: () => <div>Credit Score Card</div>
}));

// Mock API and config
vi.mock('@config', () => ({
  API_URL: 'http://localhost:3000'
}));

vi.mock('@auth', () => ({
  getToken: () => 'mock-token'
}));

// Mock fetch
global.fetch = vi.fn();

describe('PaymentScheduleModal Performance', () => {
  const mockContract = {
    id: 1,
    project_id: 1,
    lot_id: 1,
    payment_schedule: [
      { id: 1, amount: 1000, status: 'pending', due_date: '2023-01-01' }
    ],
    ledger_entries: []
  };

  const mockUser = {
    role: 'admin'
  };

  const renderModal = () => {
    return render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <LocaleProvider>
          <ToastProvider>
            <PaymentScheduleModal
              contract={mockContract}
              open={true}
              onClose={() => { }}
            />
          </ToastProvider>
        </LocaleProvider>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    PaymentScheduleTab.spy.mockClear();
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        contract: mockContract
      })
    });
  });

  it('PaymentScheduleTab should NOT re-render when props are stable', async () => {
    renderModal();

    // The buttons are: Close, Overview, Payments, Ledger, Notes
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[2]);

    // Wait for PaymentScheduleTab
    await waitFor(() => {
      expect(screen.getByTestId('payment-schedule-tab')).toBeInTheDocument();
    });

    const initialCalls = PaymentScheduleTab.spy.mock.calls.length;

    // Trigger state change in parent (undo payment)
    const undoButton = screen.getByTestId('trigger-undo');
    fireEvent.click(undoButton);

    // Wait for modal re-render (undo confirmation modal appears)
    await waitFor(() => {
      expect(screen.getByText(/Confirm reversal|Confirmar reversión|Confirm undo|Confirmar/i)).toBeInTheDocument();
    });

    const finalCalls = PaymentScheduleTab.spy.mock.calls.length;

    // Expect NO re-render because props (functions) should now be stable
    expect(finalCalls).toBe(initialCalls);
  });
});
