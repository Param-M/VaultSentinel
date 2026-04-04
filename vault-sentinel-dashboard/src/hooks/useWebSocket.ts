/**
 * useWebSocket.ts
 *
 * Connects to ws://localhost:8000/alerts/ws?token=<JWT>
 * and dispatches incoming events to React Query's cache,
 * so every component that reads ["apis"], ["stats"], or ["alerts"]
 * gets updated INSTANTLY when the backend pushes — no polling needed.
 *
 * Message types pushed by the backend:
 *   SCAN_COMPLETE        → invalidate apis + stats
 *   GHOST_QUARANTINED    → invalidate apis + stats + alerts + quarantined
 *   ZOMBIE_DETECTED      → invalidate alerts
 *   HONEYPOT_HIT         → invalidate honeypot-hits + stats
 *   ALERT                → invalidate alerts
 *
 * Connection lifecycle:
 *   - Connects on mount
 *   - Auto-reconnects with exponential backoff (1s → 2s → 4s → 8s → max 30s)
 *   - Disconnects cleanly on unmount
 *   - Pauses reconnect when tab is not visible
 */
import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

const WS_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000")
  .replace(/^http/, "ws");

export type WSStatus = "connecting" | "connected" | "disconnected" | "error";

interface UseWebSocketOptions {
  onStatusChange?: (status: WSStatus) => void;
  onMessage?: (event: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const qc = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  const setStatus = useCallback((s: WSStatus) => {
    options.onStatusChange?.(s);
  }, []);

  const connect = useCallback(() => {
    if (unmountedRef.current) return;
    if (document.hidden) return; // Don't reconnect when tab is hidden

    const token = localStorage.getItem("vs_session_token");
    if (!token) return;

    // Clean up any existing connection
    if (wsRef.current && wsRef.current.readyState < 2) {
      wsRef.current.close();
    }

    const url = `${WS_BASE}/alerts/ws?token=${token}`;
    setStatus("connecting");

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      setStatus("error");
      scheduleReconnect();
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      retryCountRef.current = 0; // Reset backoff on successful connect
      setStatus("connected");
    };

    ws.onmessage = (event) => {
      let parsed: any;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }

      options.onMessage?.(parsed);

      // Drive React Query cache invalidations based on message type
      const type: string = parsed?.type || parsed?.alert_type || "";

      switch (type) {
        case "SCAN_COMPLETE":
          // Scheduler just finished a scan — refresh everything
          qc.invalidateQueries({ queryKey: ["apis"] });
          qc.invalidateQueries({ queryKey: ["stats"] });
          qc.invalidateQueries({ queryKey: ["scan-history"] });
          break;

        case "GHOST_QUARANTINED":
          qc.invalidateQueries({ queryKey: ["apis"] });
          qc.invalidateQueries({ queryKey: ["stats"] });
          qc.invalidateQueries({ queryKey: ["alerts"] });
          qc.invalidateQueries({ queryKey: ["quarantined"] });
          break;

        case "ZOMBIE_DETECTED":
          qc.invalidateQueries({ queryKey: ["apis"] });
          qc.invalidateQueries({ queryKey: ["stats"] });
          qc.invalidateQueries({ queryKey: ["alerts"] });
          break;

        case "HONEYPOT_HIT":
          qc.invalidateQueries({ queryKey: ["honeypot-hits"] });
          qc.invalidateQueries({ queryKey: ["honeypot-stats"] });
          qc.invalidateQueries({ queryKey: ["stats"] });
          break;

        case "ALERT":
          qc.invalidateQueries({ queryKey: ["alerts"] });
          break;

        default:
          // Unknown type — refresh stats as a safe default
          qc.invalidateQueries({ queryKey: ["stats"] });
          break;
      }
    };

    ws.onerror = () => {
      setStatus("error");
    };

    ws.onclose = (event) => {
      if (unmountedRef.current) return;
      // 4001 = invalid token — don't retry
      if (event.code === 4001) {
        setStatus("error");
        return;
      }
      setStatus("disconnected");
      scheduleReconnect();
    };
  }, [qc]);

  const scheduleReconnect = useCallback(() => {
    if (unmountedRef.current) return;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);

    const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
    retryCountRef.current += 1;

    retryTimerRef.current = setTimeout(() => {
      if (!unmountedRef.current && !document.hidden) {
        connect();
      }
    }, delay);
  }, [connect]);

  useEffect(() => {
    unmountedRef.current = false;
    connect();

    // Reconnect when tab becomes visible again
    const onVisible = () => {
      if (!document.hidden && wsRef.current?.readyState !== WebSocket.OPEN) {
        retryCountRef.current = 0;
        connect();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      unmountedRef.current = true;
      document.removeEventListener("visibilitychange", onVisible);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { sendMessage };
}
