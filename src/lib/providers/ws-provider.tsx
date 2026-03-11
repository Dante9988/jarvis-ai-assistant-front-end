"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  JarvisWebSocket,
  type ConnectionState,
  type ProactiveFrame,
} from "@/lib/contracts/ws";
import { getBaseUrl } from "@/lib/contracts/api";
import { useAuthStore } from "@/lib/auth";

interface WsContextValue {
  state: ConnectionState;
  proactiveMessages: ProactiveFrame[];
  clearProactive: () => void;
}

const WsContext = createContext<WsContextValue>({
  state: "disconnected",
  proactiveMessages: [],
  clearProactive: () => {},
});

export function useWebSocket() {
  return useContext(WsContext);
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const wsRef = useRef<JarvisWebSocket | null>(null);
  const [state, setState] = useState<ConnectionState>("disconnected");
  const [proactiveMessages, setProactive] = useState<ProactiveFrame[]>([]);

  useEffect(() => {
    if (!token) {
      wsRef.current?.disconnect();
      wsRef.current = null;
      setState("disconnected");
      return;
    }

    const wsUrl = getBaseUrl().replace(/^http/, "ws") + "/ws/agent";
    const ws = new JarvisWebSocket(wsUrl, token);
    wsRef.current = ws;

    ws.onStateChange(setState);
    ws.onProactive((frame) => {
      setProactive((prev) => [frame, ...prev].slice(0, 50));
    });

    ws.connect();

    return () => {
      ws.disconnect();
    };
  }, [token]);

  const clearProactive = useCallback(() => setProactive([]), []);

  return (
    <WsContext.Provider value={{ state, proactiveMessages, clearProactive }}>
      {children}
    </WsContext.Provider>
  );
}
