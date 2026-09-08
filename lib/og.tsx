import { ImageResponse } from "next/og";
import { brand, SITE_NAME } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/** Shared branded Open Graph card used for the site, groups, and events. */
export function ogCard({
  eyebrow,
  title,
  chips = [],
}: {
  eyebrow: string;
  title: string;
  chips?: string[];
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: brand.ink,
          color: brand.bg,
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", width: 28, height: 28, borderRadius: 999, background: brand.mint }} />
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 1 }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 24, color: brand.mint, textTransform: "uppercase", letterSpacing: 3 }}>
            {eyebrow}
          </div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
          {chips.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
              {chips.map((chip) => (
                <div
                  key={chip}
                  style={{
                    display: "flex",
                    background: brand.mint,
                    color: brand.moss,
                    fontSize: 24,
                    fontWeight: 700,
                    padding: "8px 20px",
                    borderRadius: 999,
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div style={{ fontSize: 24, color: brand.mint }}>Find your crew. Build your goal.</div>
      </div>
    ),
    OG_SIZE
  );
}
