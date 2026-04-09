export interface AuthState {
  authenticated: boolean;
  email: string;
  profileComplete: boolean;
}

const AUTH_KEY = "tourstack_auth";

export function getAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
}

export function setAuth(state: AuthState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return getAuth()?.authenticated === true;
}

export function markProfileComplete(): void {
  const auth = getAuth();
  if (auth) {
    setAuth({ ...auth, profileComplete: true });
  }
}
