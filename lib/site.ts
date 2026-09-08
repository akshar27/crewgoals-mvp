export const SITE_NAME = "CrewGoals";
export const SITE_TAGLINE = "Find your crew. Build your goal.";
export const SITE_DESCRIPTION =
  "Small local groups for running, gym, hiking, and outdoor activities — matched by your goal, level, location, schedule, and vibe.";

export function siteUrl(path = "/"): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const brand = {
  bg: "#f8f7f0",
  ink: "#17211d",
  moss: "#426653",
  mint: "#dff4e9",
  clay: "#c66f4e",
};
