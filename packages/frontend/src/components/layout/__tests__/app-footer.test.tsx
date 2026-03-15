import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppFooter } from '../app-footer';
import { APP_NAME } from '../constants';

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <AppFooter />
    </MemoryRouter>,
  );
}

describe('AppFooter', () => {
  it('should display the app name', () => {
    // Given / When
    renderWithRouter();

    // Then
    expect(screen.getByText(APP_NAME)).toBeInTheDocument();
  });

  it('should render as a footer element', () => {
    // Given / When
    renderWithRouter();

    // Then
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('should display a link to the terms page', () => {
    // Given / When
    renderWithRouter();

    // Then
    const termsLink = screen.getByRole('link', { name: '利用規約' });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '/terms');
  });
});
