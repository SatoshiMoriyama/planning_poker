import type { ClientMessage } from './types';

const RECONNECT_INTERVAL_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const NORMAL_CLOSE_CODE = 1000;
const WS_OPEN = 1;

export class WebSocketClient {
  private readonly url: string;
  private ws: WebSocket | null = null;
  private intentionalDisconnect = false;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  onOpen: ((event: Event) => void) | null = null;
  onClose: (() => void) | null = null;
  onMessage: ((data: unknown) => void) | null = null;
  onError: ((error: unknown) => void) | null = null;

  constructor(url: string) {
    if (!url) {
      throw new Error('WebSocket URL is required');
    }
    this.url = url;
  }

  connect(): void {
    this.intentionalDisconnect = false;
    this.createConnection();
  }

  disconnect(): void {
    this.intentionalDisconnect = true;
    this.clearReconnectTimer();
    this.ws?.close();
  }

  send(message: ClientMessage): void {
    if (!this.ws || this.ws.readyState !== WS_OPEN) {
      throw new Error('WebSocket is not open');
    }
    this.ws.send(JSON.stringify(message));
  }

  private createConnection(): void {
    const ws = new WebSocket(this.url);

    ws.onopen = (event: Event) => {
      this.reconnectAttempts = 0;
      this.onOpen?.(event);
    };

    ws.onclose = (event: CloseEvent) => {
      this.onClose?.();

      if (!this.intentionalDisconnect && event.code !== NORMAL_CLOSE_CODE) {
        this.scheduleReconnect();
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data: unknown = JSON.parse(event.data as string);
        this.onMessage?.(data);
      } catch (error) {
        this.onError?.(error);
      }
    };

    ws.onerror = (_event: Event) => {
      this.onError?.(_event);
    };

    this.ws = ws;
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      return;
    }
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.createConnection();
    }, RECONNECT_INTERVAL_MS);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
