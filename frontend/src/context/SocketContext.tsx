import React, { createContext, useContext, useEffect, useState } from 'react';

export interface SocketMessage {
  type: string;
  count?: number;
  center_name?: string;
  report_id?: string;
  message?: string;
}

const SocketContext = createContext<WebSocket | null>(null);

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
  userToken?: string;
  onNotification?: (msg: SocketMessage) => void;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, userToken, onNotification }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!userToken) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host || 'localhost:8000';
    const wsUrl = `${protocol}//${host}/api/ws?token=${userToken}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Real-Time WebSocket Connected to AntiGravity Backend');
    };

    ws.onmessage = (event) => {
      try {
        const data: SocketMessage = JSON.parse(event.data);
        if (onNotification) {
          onNotification(data);
        }

        switch (data.type) {
          case 'BATCH_REPORT_COMPLETE':
            window.dispatchEvent(new CustomEvent('refresh_reports', { detail: data }));
            break;
          case 'TICKET_ESCALATED':
            window.dispatchEvent(new CustomEvent('escalation_alert', { detail: data }));
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('Error parsing WebSocket frame', err);
      }
    };

    ws.onerror = (err) => {
      console.warn('WebSocket connection warning:', err);
    };

    setSocket(ws);
    return () => {
      ws.close();
    };
  }, [userToken, onNotification]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
