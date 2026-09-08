import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearToken, getMe, getToken, login as loginRequest, signup as signupRequest, type User } from "../api";

type AuthState = {
  user: User | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!(await getToken())) return;
        const me = await getMe();
        if (active) setUser(me);
      } catch {
        await clearToken();
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setUser(await loginRequest(email, password));
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setUser(await signupRequest(name, email, password));
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, signIn, signUp, signOut }),
    [user, initializing, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
