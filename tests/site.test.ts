import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ENV_KEYS = ["NEXT_PUBLIC_APP_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"] as const;

describe("baseUrl / siteUrl", () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of ENV_KEYS) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
    vi.resetModules();
  });
  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it("prefers an explicit NEXT_PUBLIC_APP_URL", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://crewgoals.app/";
    const { siteUrl } = await import("@/lib/site");
    expect(siteUrl("/groups/1")).toBe("https://crewgoals.app/groups/1");
  });

  it("falls back to Vercel's production URL", async () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "crewgoals-mvp-zeta.vercel.app";
    const { baseUrl } = await import("@/lib/site");
    expect(baseUrl()).toBe("https://crewgoals-mvp-zeta.vercel.app");
  });

  it("falls back to the per-deploy VERCEL_URL", async () => {
    process.env.VERCEL_URL = "crewgoals-git-abc.vercel.app";
    const { baseUrl } = await import("@/lib/site");
    expect(baseUrl()).toBe("https://crewgoals-git-abc.vercel.app");
  });

  it("uses localhost only when nothing is set", async () => {
    const { baseUrl } = await import("@/lib/site");
    expect(baseUrl()).toBe("http://localhost:3000");
  });
});
