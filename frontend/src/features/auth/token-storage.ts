
const TOKEN_KEY = "udk_access_token";

export function saveToken(token: string): void {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return sessionStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(TOKEN_KEY);
}
