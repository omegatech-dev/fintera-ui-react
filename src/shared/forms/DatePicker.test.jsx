import { render, screen, fireEvent } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { describe, it, expect, vi } from 'vitest';
import DatePicker from './DatePicker';

expect.extend(matchers);

describe('DatePicker', () => {
  it('renders a native date input associated with its label', () => {
    render(<DatePicker label="Fecha de inicio" value="" onChange={() => {}} />);

    const input = screen.getByLabelText(/Fecha de inicio/);
    expect(input).toHaveAttribute('type', 'date');
  });

  it('calls onChange with the selected ISO date', () => {
    const onChange = vi.fn();
    render(<DatePicker value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Seleccionar fecha'), {
      target: { value: '2026-01-15' },
    });

    expect(onChange).toHaveBeenCalledWith('2026-01-15');
  });

  it('shows the error and the formatted selected date', () => {
    render(
      <DatePicker value="2026-01-15" onChange={() => {}} error="Fecha inválida" />
    );

    expect(screen.getByText('Fecha inválida')).toBeInTheDocument();
    expect(screen.getByText(/Fecha seleccionada:/)).toBeInTheDocument();
  });
});
