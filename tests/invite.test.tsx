import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, StaticRouter } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import Invite from '../src/pages/Invite';

function show() {
  render(
    <MemoryRouter initialEntries={['/invite?plan=pro&billing=yearly']}>
      <Invite />
    </MemoryRouter>,
  );
}
async function fill() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Your name'), 'Jamie Parker');
  await user.type(screen.getByLabelText('Email address'), 'jamie@example.com');
  await user.click(screen.getByRole('checkbox'));
  return user;
}

describe('invitation form', () => {
  it('applies URL preferences when hydrating a query-free prerendered invitation page', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(
      <StaticRouter location="/invite">
        <Invite />
      </StaticRouter>,
    );
    document.body.appendChild(container);
    expect(container.querySelector('form')).toHaveAttribute('method', 'post');
    expect(container.querySelector('form')).toHaveAttribute('action', '/api/invites');
    render(
      <MemoryRouter initialEntries={['/invite?plan=business&billing=yearly']}>
        <Invite />
      </MemoryRouter>,
      { hydrate: true, container },
    );
    expect(screen.getByLabelText('Your plan')).toHaveValue('business');
    expect(screen.getByLabelText('Billing preference')).toHaveValue('yearly');
  });
  it('prefills the chosen plan and billing period', () => {
    show();
    expect(screen.getByLabelText('Your plan')).toHaveValue('pro');
    expect(screen.getByLabelText('Billing preference')).toHaveValue('yearly');
  });
  it('validates fields, explains errors and focuses the first invalid input', async () => {
    show();
    await userEvent.click(screen.getByRole('button', { name: 'Request an invite' }));
    expect(screen.getByLabelText('Your name')).toHaveFocus();
    expect(screen.getByText('Please enter a valid email address.')).toBeVisible();
    expect(screen.getByText('Please agree to the privacy notice.')).toBeVisible();
  });
  it('saves a valid request and announces the real success state', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ message: 'Saved' }, { status: 201 }));
    vi.stubGlobal('fetch', fetcher);
    show();
    const user = await fill();
    await user.click(screen.getByRole('button', { name: 'Request an invite' }));
    expect(await screen.findByRole('status')).toHaveTextContent('You’re on the list.');
    const options = fetcher.mock.calls[0][1];
    expect(JSON.parse(options.body)).toMatchObject({
      email: 'jamie@example.com',
      plan: 'pro',
      billing: 'yearly',
      consent: true,
    });
  });
  it('keeps form values and allows retry after the server rejects a request', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ message: 'Too many requests.' }, { status: 429 }))
      .mockResolvedValueOnce(Response.json({}, { status: 201 }));
    vi.stubGlobal('fetch', fetcher);
    show();
    const user = await fill();
    await user.click(screen.getByRole('button', { name: 'Request an invite' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Too many requests.');
    expect(screen.getByLabelText('Email address')).toHaveValue('jamie@example.com');
    await user.click(screen.getByRole('button', { name: 'Request an invite' }));
    expect(await screen.findByRole('status')).toHaveTextContent('You’re on the list.');
  });
  it('shows a network error without pretending to save', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection lost.')));
    show();
    const user = await fill();
    await user.click(screen.getByRole('button', { name: 'Request an invite' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Connection lost.');
    expect(screen.queryByText('You’re on the list.')).not.toBeInTheDocument();
  });
});
