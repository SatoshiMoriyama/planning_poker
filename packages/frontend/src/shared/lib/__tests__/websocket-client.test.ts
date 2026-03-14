import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocketClient } from '../websocket-client';

class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;

  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
  });
  send = vi.fn();

  constructor(url: string) {
    this.url = url;
  }

  simulateOpen(): void {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.(new Event('open'));
  }

  simulateMessage(data: unknown): void {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }));
  }

  simulateClose(code: number): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code } as CloseEvent);
  }

  simulateError(): void {
    this.onerror?.(new Event('error'));
  }
}

describe('WebSocketClient', () => {
  let mockWsInstance: MockWebSocket;
  const wsUrl = 'wss://example.com/ws';

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('WebSocket', vi.fn((url: string) => {
      mockWsInstance = new MockWebSocket(url);
      return mockWsInstance;
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('connect', () => {
    it('should create a WebSocket connection with the given URL', () => {
      // When
      const client = new WebSocketClient(wsUrl);
      client.connect();

      // Then
      expect(WebSocket).toHaveBeenCalledWith(wsUrl);
    });

    it('should notify onOpen when connection is established', () => {
      // Given
      const client = new WebSocketClient(wsUrl);
      const onOpen = vi.fn();
      client.onOpen = onOpen;

      // When
      client.connect();
      mockWsInstance.simulateOpen();

      // Then
      expect(onOpen).toHaveBeenCalledOnce();
    });

    it('should throw if URL is empty', () => {
      // When / Then
      expect(() => new WebSocketClient('')).toThrow();
    });
  });

  describe('disconnect', () => {
    it('should close the WebSocket connection', () => {
      // Given
      const client = new WebSocketClient(wsUrl);
      client.connect();
      mockWsInstance.simulateOpen();

      // When
      client.disconnect();

      // Then
      expect(mockWsInstance.close).toHaveBeenCalledOnce();
    });

    it('should notify onClose when connection is closed', () => {
      // Given
      const client = new WebSocketClient(wsUrl);
      const onClose = vi.fn();
      client.onClose = onClose;
      client.connect();
      mockWsInstance.simulateOpen();

      // When
      mockWsInstance.simulateClose(1000);

      // Then
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe('send', () => {
    it('should send JSON-stringified message', () => {
      // Given
      const client = new WebSocketClient(wsUrl);
      client.connect();
      mockWsInstance.simulateOpen();
      const message = { action: 'createRoom' as const, userName: 'Alice' };

      // When
      client.send(message);

      // Then
      expect(mockWsInstance.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('should throw if sending before connection is open', () => {
      // Given
      const client = new WebSocketClient(wsUrl);
      client.connect();

      // When / Then
      expect(() => client.send({ action: 'createRoom' as const, userName: 'Alice' })).toThrow();
    });
  });

  describe('receive', () => {
    it('should parse JSON message and notify onMessage', () => {
      // Given
      const client = new WebSocketClient(wsUrl);
      const onMessage = vi.fn();
      client.onMessage = onMessage;
      client.connect();
      mockWsInstance.simulateOpen();

      const serverMessage = { type: 'roomCreated', roomId: 'abc123' };

      // When
      mockWsInstance.simulateMessage(serverMessage);

      // Then
      expect(onMessage).toHaveBeenCalledWith(serverMessage);
    });

    it('should notify onError when receiving invalid JSON', () => {
      // Given
      const client = new WebSocketClient(wsUrl);
      const onError = vi.fn();
      client.onError = onError;
      client.connect();
      mockWsInstance.simulateOpen();

      // When
      mockWsInstance.onmessage?.(new MessageEvent('message', { data: 'not-json{' }));

      // Then
      expect(onError).toHaveBeenCalledOnce();
    });
  });

  describe('auto-reconnect', () => {
    it('should attempt to reconnect after unexpected close', () => {
      // Given
      const client = new WebSocketClient(wsUrl);
      client.connect();
      mockWsInstance.simulateOpen();

      // When
      mockWsInstance.simulateClose(1006);
      vi.advanceTimersByTime(3000);

      // Then
      expect(WebSocket).toHaveBeenCalledTimes(2);
    });

    it('should not reconnect after normal close (code 1000)', () => {
      // Given
      const client = new WebSocketClient(wsUrl);
      client.connect();
      mockWsInstance.simulateOpen();

      // When
      mockWsInstance.simulateClose(1000);
      vi.advanceTimersByTime(10000);

      // Then
      expect(WebSocket).toHaveBeenCalledTimes(1);
    });

    it('should not reconnect after explicit disconnect', () => {
      // Given
      const client = new WebSocketClient(wsUrl);
      client.connect();
      mockWsInstance.simulateOpen();

      // When
      client.disconnect();
      vi.advanceTimersByTime(10000);

      // Then
      expect(WebSocket).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should notify onError on WebSocket error', () => {
      // Given
      const client = new WebSocketClient(wsUrl);
      const onError = vi.fn();
      client.onError = onError;
      client.connect();

      // When
      mockWsInstance.simulateError();

      // Then
      expect(onError).toHaveBeenCalledOnce();
    });
  });
});
