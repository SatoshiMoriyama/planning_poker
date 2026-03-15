import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppFooter } from '../app-footer';
import { APP_NAME } from '../constants';

describe('AppFooter', () => {
  it('should display the app name', () => {
    // Given / When
    render(<AppFooter />);

    // Then
    expect(screen.getByText(APP_NAME)).toBeInTheDocument();
  });

  it('should render as a footer element', () => {
    // Given / When
    render(<AppFooter />);

    // Then
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
