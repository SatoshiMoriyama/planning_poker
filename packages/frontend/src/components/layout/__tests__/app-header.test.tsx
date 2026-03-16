import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppHeader } from '../app-header';
import { APP_NAME } from '../constants';

function renderWithRouter(ui: ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('AppHeader', () => {
  it('should display the app name', () => {
    // Given / When
    renderWithRouter(<AppHeader />);

    // Then
    expect(screen.getByText(APP_NAME)).toBeInTheDocument();
  });

  it('should render as a banner element', () => {
    // Given / When
    renderWithRouter(<AppHeader />);

    // Then
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('should render center slot when provided', () => {
    // Given / When
    renderWithRouter(<AppHeader center={<span>Center Content</span>} />);

    // Then
    expect(screen.getByText('Center Content')).toBeInTheDocument();
  });

  it('should render right slot when provided', () => {
    // Given / When
    renderWithRouter(<AppHeader right={<span>Right Content</span>} />);

    // Then
    expect(screen.getByText('Right Content')).toBeInTheDocument();
  });

  it('should not render center area when center is not provided', () => {
    // Given / When
    renderWithRouter(<AppHeader />);

    // Then
    const banner = screen.getByRole('banner');
    const flexChildren = banner.querySelector('.mx-auto')!.children;
    expect(flexChildren).toHaveLength(1);
  });
});
