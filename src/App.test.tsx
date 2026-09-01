import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders the full page tree without throwing', () => {
    render(<App />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getAllByText('Lain Sthid Ramirez Rueda').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders all main sections', async () => {
    render(<App />);

    expect(document.getElementById('hero')).toBeInTheDocument();
    expect(document.getElementById('about')).toBeInTheDocument();
    // Skills/Projects/Contact are React.lazy (code-split below-the-fold sections) — their chunk
    // resolves asynchronously even in this client-only render, so wait for them like real code.
    await waitFor(() => expect(document.getElementById('skills')).toBeInTheDocument());
    await waitFor(() => expect(document.getElementById('projects')).toBeInTheDocument());
    await waitFor(() => expect(document.getElementById('contact')).toBeInTheDocument());
  });

  it('renders the footer with the current year', () => {
    render(<App />);
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByText(String(new Date().getFullYear()))).toBeInTheDocument();
  });

  it('does not mount any dialog until it has been opened (lazy-loaded)', () => {
    render(<App />);
    for (const id of ['cv-dialog', 'terminal-dialog', 'project-modal', 'cert-modal', 'demo-modal']) {
      expect(document.getElementById(id)).not.toBeInTheDocument();
    }
  });
});
