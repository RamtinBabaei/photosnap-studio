import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Pricing from '../src/pages/Pricing';

describe('pricing journey', () => {
  it('shows monthly prices and updates every plan with a keyboard-accessible yearly switch', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );
    expect(screen.getByText('$19.00')).toBeVisible();
    expect(screen.getByText('$39.00')).toBeVisible();
    expect(screen.getByText('$99.00')).toBeVisible();
    const toggle = screen.getByRole('switch', { name: 'Yearly billing' });
    toggle.focus();
    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('$190.00')).toBeVisible();
    expect(screen.getByText('$390.00')).toBeVisible();
    expect(screen.getByText('$990.00')).toBeVisible();
    expect(screen.getAllByText('per year')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Pick plan: Pro' })).toHaveAttribute(
      'href',
      '/invite?plan=pro&billing=yearly',
    );
    await user.click(toggle);
    expect(screen.getByText('$19.00')).toBeVisible();
  });
  it('provides a named comparison table with explicit unavailable feature labels', () => {
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );
    expect(screen.getByRole('table')).toHaveAccessibleName(
      'Compare Basic, Pro and Business plan features',
    );
    expect(screen.getAllByLabelText('Not included')).toHaveLength(10);
  });
});
