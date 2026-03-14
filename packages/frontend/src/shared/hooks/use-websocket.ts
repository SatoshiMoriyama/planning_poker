import { useCallback, useEffect, useRef, useState } from 'react';
import { WebSocketClient } from '../lib/websocket-client';
import type { ClientMessage } from '../lib/types';

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

interface UseWebSocketReturn {
  status: ConnectionStatus;
  lastMessage: unknown;
  error: unknown;
  connect: () => void;
  send: (message: ClientMessage) => void;
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<unknown>(null);
  const [error, setError] = useState<unknown>(null);
  const clientRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    const client = new WebSocketClient(url);
    clientRef.current = client;

    client.onOpen = () => {
      setStatus('connected');
      setError(null);
    };

    client.onClose = () => {
      setStatus('disconnected');
    };

    client.onMessage = (data: unknown) => {
      setLastMessage(data);
    };

    client.onError = (err: unknown) => {
      setError(err);
    };

    return () => {
      client.disconnect();
    };
  }, [url]);

  const connect = useCallback(() => {
    setStatus('connecting');
    clientRef.current?.connect();
  }, []);

  const send = useCallback((message: ClientMessage) => {
    clientRef.current?.send(message);
  }, []);

  return { status, lastMessage, error, connect, send };
}
