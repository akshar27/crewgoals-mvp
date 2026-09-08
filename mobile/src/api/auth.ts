import { api, clearToken, saveToken } from "./client";
import type { User } from "./types";

export async function getMe() {
  const body = await api<{ user: User }>("/api/mobile/me");
  return body.user;
}

export async function login(email: string, password: string) {
  const body = await api<{ user: User; token: string }>("/api/mobile/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await saveToken(body.token);
  return body.user;
}

export async function signup(name: string, email: string, password: string) {
  const body = await api<{ user: User; token: string }>("/api/mobile/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  await saveToken(body.token);
  return body.user;
}

export async function forgotPassword(email: string) {
  await api("/api/mobile/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function logout() {
  await clearToken();
}
