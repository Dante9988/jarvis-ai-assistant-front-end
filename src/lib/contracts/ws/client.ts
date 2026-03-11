import type { ClientFrame, ProactiveFrame, ServerFrame } from "./events";

export type ConnectionState = "disconnected" | "connecting" | "connected";

export type ProactiveHandler = (frame: ProactiveFrame) => void;
export type ServerFrameHandler = (frame: ServerFrame) => void;
export type StateChangeHandler = (state: ConnectionState) => void;

/**
 * Platform-agnostic WebSocket client for the Jarvis agent protocol.
 * No React, no DOM assumptions — works in browser, React Native, Electron.
 */
export class JarvisWebSocket {
  private ws: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000;

  private proactiveHandlers = new Set<ProactiveHandler>();
  private frameHandlers = new Set<ServerFrameHandler>();
  private stateHandlers = new Set<StateChangeHandler>();

  private _state: ConnectionState = "disconnected";
  private _url: string;
  private _token: string;

  constructor(url: string, token: string) {
    this._url = url;
    this._token = token;
  }

  get state(): ConnectionState {
    return this._state;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.setState("connecting");

    try {
      this.ws = new WebSocket(this._url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.send({ type: "auth", token: this._token });
    };

    this.ws.onmessage = (event) => {
      try {
        const frame = JSON.parse(event.data) as ServerFrame;
        this.handleFrame(frame);
      } catch {
        /* ignore malformed frames */
      }
    };

    this.ws.onclose = () => {
      this.cleanup();
      this.setState("disconnected");
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect(): void {
    this.maxReconnectAttempts = 0; // prevent auto-reconnect
    this.cleanup();
    this.ws?.close();
    this.ws = null;
    this.setState("disconnected");
  }

  send(frame: ClientFrame): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(frame));
    }
  }

  onProactive(handler: ProactiveHandler): () => void {
    this.proactiveHandlers.add(handler);
    return () => this.proactiveHandlers.delete(handler);
  }

  onFrame(handler: ServerFrameHandler): () => void {
    this.frameHandlers.add(handler);
    return () => this.frameHandlers.delete(handler);
  }

  onStateChange(handler: StateChangeHandler): () => void {
    this.stateHandlers.add(handler);
    return () => this.stateHandlers.delete(handler);
  }

  private handleFrame(frame: ServerFrame): void {
    if (frame.type === "auth_ok") {
      this.setState("connected");
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    }

    if (frame.type === "proactive") {
      this.proactiveHandlers.forEach((h) => h(frame));
    }

    this.frameHandlers.forEach((h) => h(frame));
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: "heartbeat" });
    }, 30_000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    const delay =
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private cleanup(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private setState(state: ConnectionState): void {
    if (this._state === state) return;
    this._state = state;
    this.stateHandlers.forEach((h) => h(state));
  }
}
