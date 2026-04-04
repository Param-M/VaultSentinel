/**
 * WebSocketContext.tsx
 *
 * Mounts ONE WebSocket connection for the entire app.
 * All components read wsStatus from context — no duplicate connections.
 *
 * Usage:
 *   const { wsStatus, lastEvent } = useWS();
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useWebSocket, WSStatus } from "../hooks/useWebSocket";

interface WSContextValue {
  wsStatus: WSStatus;
  lastEvent: any;
}

const WSContext = createContext<WSContextValue>({
  wsStatus: "disconnected",
  lastEvent: null,
});

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [wsStatus, setWsStatus] = useState<WSStatus>("connecting");
  const [lastEvent, setLastEvent] = useState<any>(null);

  const handleMessage = useCallback((event: any) => {
    setLastEvent(event);
  }, []);

  useWebSocket({
    onStatusChange: setWsStatus,
    onMessage: handleMessage,
  });

  return (
    <WSContext.Provider value={{ wsStatus, lastEvent }}>
      {children}
    </WSContext.Provider>
  );
}

export function useWS() {
  return useContext(WSContext);
}
