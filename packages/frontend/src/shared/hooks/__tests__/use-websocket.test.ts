import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from '../use-websocket';
import { WebSocketClient } from '../../lib/websocket-client';

vi.mock('../../lib/websocket-client');

const MockWebSocketClient = vi.mocked(WebSocketClient);

describe('useWebSocket', () => {
  let mockInstance: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
    onOpen: ((event: Event) => void) | null;
    onClose: (() => void) | null;
    onMessage: ((data: unknown) => void) | null;
    onError: ((error: unknown) => void) | null;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockInstance = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      send: vi.fn(),
      onOpen: null,
      onClose: null,
      onMessage: null,
      onError: null,
    };
    MockWebSocketClient.mockImplementation(() => mockInstance as unknown as WebSocketClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with disconnected status', () => {
    // When
    const { result } = renderHook(() => useWebSocket('wss://example.com'));

    // Then
    expect(result.current.status).toBe('disconnected');
  });

  it('should transition to connecting status when connect is called', () => {
    // Given
    const { result } = renderHook(() => useWebSocket('wss://example.com'));

    // When
    act(() => {
      result.current.connect();
    });

    // Then
    expect(result.current.status).toBe('connecting');
    expect(mockInstance.connect).toHaveBeenCalledOnce();
  });

  it('should transition to connected status when WebSocket opens', () => {
    // Given
    const { result } = renderHook(() => useWebSocket('wss://example.com'));

    // When
    act(() => {
      result.current.connect();
    });
    act(() => {
      mockInstance.onOpen?.(new Event('open'));
    });

    // Then
    expect(result.current.status).toBe('connected');
  });

  it('should transition to disconnected status when WebSocket closes', () => {
    // Given
    const { result } = renderHook(() => useWebSocket('wss://example.com'));
    act(() => {
      result.current.connect();
    });
    act(() => {
      mockInstance.onOpen?.(new Event('open'));
    });

    // When
    act(() => {
      mockInstance.onClose?.();
    });

    // Then
    expect(result.current.status).toBe('disconnected');
  });

  it('should provide received messages', () => {
    // Given
    const { result } = renderHook(() => useWebSocket('wss://example.com'));
    act(() => {
      result.current.connect();
    });
    act(() => {
      mockInstance.onOpen?.(new Event('open'));
    });

    const serverMessage = { type: 'roomCreated', roomId: 'abc123' };

    // When
    act(() => {
      mockInstance.onMessage?.(serverMessage);
    });

    // Then
    expect(result.current.lastMessage).toEqual(serverMessage);
  });

  it('should send messages through the client', () => {
    // Given
    const { result } = renderHook(() => useWebSocket('wss://example.com'));
    act(() => {
      result.current.connect();
    });
    act(() => {
      mockInstance.onOpen?.(new Event('open'));
    });

    const clientMessage = { action: 'createRoom' as const, userName: 'Alice' };

    // When
    act(() => {
      result.current.send(clientMessage);
    });

    // Then
    expect(mockInstance.send).toHaveBeenCalledWith(clientMessage);
  });

  it('should expose error state when onError is triggered', () => {
    // Given
    const { result } = renderHook(() => useWebSocket('wss://example.com'));

    // When
    act(() => {
      mockInstance.onError?.(new Error('connection failed'));
    });

    // Then
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('should disconnect when component unmounts', () => {
    // Given
    const { unmount } = renderHook(() => useWebSocket('wss://example.com'));

    // When
    unmount();

    // Then
    expect(mockInstance.disconnect).toHaveBeenCalledOnce();
  });
});
