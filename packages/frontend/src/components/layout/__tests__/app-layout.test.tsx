import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from '../app-layout';
import { APP_NAME } from '../constants';

describe('AppLayout', () => {
  it('should render header, main content, and footer', () => {
    // Given / When
    render(
      <MemoryRouter>
        <AppLayout>
          <p>Page Content</p>
        </AppLayout>
      </MemoryRouter>,
    );

    // Then
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('should render app name in both header and footer', () => {
    // Given / When
    render(
      <MemoryRouter>
        <AppLayout>
          <p>Content</p>
        </AppLayout>
      </MemoryRouter>,
    );

    // Then
    const appNameElements = screen.getAllByText(APP_NAME);
    expect(appNameElements).toHaveLength(2);
  });

  it('should pass headerCenter and headerRight to the header', () => {
    // Given / When
    render(
      <MemoryRouter>
        <AppLayout
          headerCenter={<span>Center</span>}
          headerRight={<span>Right</span>}
        >
          <p>Content</p>
        </AppLayout>
      </MemoryRouter>,
    );

    // Then
    expect(screen.getByText('Center')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });
});
