import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "crewgoals_token";

export type User = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
};

export type Group = {
  id: string;
  title: string;
  city: string;
  neighborhood: string;
  level: string;
  ageRange: string;
  vibe: string;
  maxMembers: number;
  schedule: string;
  description: string;
  status: string;
  score?: number;
  goal: { name: string };
  activity: { name: string };
  _count?: { members: number };
};

export type EventItem = {
  id: string;
  groupId: string;
  title: string;
  locationName: string;
  address: string;
  startTime: string;
  endTime: string;
  description: string;
  hostName: string;
  status: string;
  group?: { id: string; title: string };
};

export type Preference = {
  name?: string;
  ageRange: string;
  city: string;
  neighborhood: string;
  goals: string[];
  activities: string[];
  currentLevel: string;
  targetGoal: string;
  availability: string[];
  preferredGroupSize: number;
  vibe: string;
  comfortPreference: string;
  phone?: string;
  bio?: string;
};

export function apiBase() {
  return (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000").replace(/\/+$/, "");
}

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const url = `${apiBase()}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {})
      }
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    throw new Error(
      timedOut
        ? `Backend did not respond within 15 seconds at ${apiBase()}.`
        : `Cannot reach backend at ${apiBase()}. Check internet connection and EXPO_PUBLIC_API_URL.`
    );
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  const body = text ? tryParseJson(text) : {};
  if (!response.ok) {
    const message =
      typeof body.error === "string"
        ? body.error
        : Array.isArray(body.details)
          ? body.details.join("\n")
          : `Backend request failed with status ${response.status}.`;
    throw new Error(message);
  }
  return body as T;
}

function tryParseJson(text: string): { error?: unknown; details?: unknown } {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function login(email: string, password: string) {
  const body = await api<{ user: User; token: string }>("/api/mobile/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  await saveToken(body.token);
  return body.user;
}

export async function signup(name: string, email: string, password: string) {
  const body = await api<{ user: User; token: string }>("/api/mobile/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password })
  });
  await saveToken(body.token);
  return body.user;
}
