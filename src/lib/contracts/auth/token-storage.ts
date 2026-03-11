/**
 * Platform-agnostic token storage interface.
 *
 * Web: localStorage (set by default)
 * Mobile: SecureStore from expo-secure-store
 * Desktop: electron safeStorage or keytar
 */
export interface TokenStorage {
  get(): string | null | Promise<string | null>;
  set(token: string): void | Promise<void>;
  remove(): void | Promise<void>;
}

const TOKEN_KEY = "jarvis_token";

class LocalStorageTokenStorage implements TokenStorage {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  }
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }
  remove(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
}

class MemoryTokenStorage implements TokenStorage {
  private token: string | null = null;
  get(): string | null {
    return this.token;
  }
  set(token: string): void {
    this.token = token;
  }
  remove(): void {
    this.token = null;
  }
}

let _storage: TokenStorage =
  typeof window !== "undefined"
    ? new LocalStorageTokenStorage()
    : new MemoryTokenStorage();

export function setTokenStorage(storage: TokenStorage): void {
  _storage = storage;
}

export function getTokenStorage(): TokenStorage {
  return _storage;
}
