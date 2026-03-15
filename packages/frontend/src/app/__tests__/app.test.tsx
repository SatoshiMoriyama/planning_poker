import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

describe('App routing', () => {
  it('should render JoinRoute at /join/:roomId path', async () => {
    // Given
    const router = createMemoryRouter(
      [
        {
          path: '/join/:roomId',
          lazy: async () => {
            const { default: JoinRoute } = await import('../../app/routes/join');
            return { Component: JoinRoute };
          },
        },
      ],
      { initialEntries: ['/join/room-abc'] },
    );

    // When
    render(<RouterProvider router={router} />);

    // Then — JoinView renders the room name and join form
    expect(await screen.findByText(/room-abc/)).toBeInTheDocument();
    expect(await screen.findByLabelText(/ユーザー名/)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /参加/ })).toBeInTheDocument();
  });

  it('should not match /join without a roomId parameter', async () => {
    // Given
    const router = createMemoryRouter(
      [
        {
          path: '/join/:roomId',
          lazy: async () => {
            const { default: JoinRoute } = await import('../../app/routes/join');
            return { Component: JoinRoute };
          },
        },
        {
          path: '*',
          element: <div>not-found</div>,
        },
      ],
      { initialEntries: ['/join'] },
    );

    // When
    render(<RouterProvider router={router} />);

    // Then
    expect(await screen.findByText('not-found')).toBeInTheDocument();
  });
});
