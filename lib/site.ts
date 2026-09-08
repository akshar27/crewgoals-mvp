export const SITE_NAME = "CrewGoals";
export const SITE_TAGLINE = "Find your crew. Build your goal.";
export const SITE_DESCRIPTION =
  "Small local groups for running, gym, hiking, and outdoor activities — matched by your goal, level, location, schedule, and vibe.";

/** Absolute base URL for the site. Explicit env wins; otherwise Vercel's own
 * env vars are used so links don't fall back to localhost in production. */
export function baseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function siteUrl(path = "/"): string {
  return `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export const brand = {
  bg: "#f8f7f0",
  ink: "#17211d",
  moss: "#426653",
  mint: "#dff4e9",
  clay: "#c66f4e",
};
