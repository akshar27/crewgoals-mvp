import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: siteUrl(),
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#f8f7f0]/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-black tracking-tight text-ink">
              CrewGoals
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <Link className="rounded-md px-3 py-2 hover:bg-mint" href="/groups">
                Groups
              </Link>
              {user ? (
                <>
                  <Link className="rounded-md px-3 py-2 hover:bg-mint" href="/dashboard">
                    Dashboard
                  </Link>
                  {user.role === "ADMIN" ? (
                    <Link className="inline-flex items-center gap-1 rounded-md px-3 py-2 hover:bg-mint" href="/admin">
                      <ShieldCheck size={16} /> Admin
                    </Link>
                  ) : null}
                  <Link className="inline-flex items-center gap-1 rounded-md px-3 py-2 hover:bg-mint" href="/settings/profile">
                    <UserRound size={16} /> Profile
                  </Link>
                  <form action="/api/auth/logout" method="post">
                    <button className="inline-flex items-center gap-1 rounded-md px-3 py-2 hover:bg-mint" type="submit">
                      <LogOut size={16} /> Logout
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link className="rounded-md px-3 py-2 hover:bg-mint" href="/login">
                    Login
                  </Link>
                  <Link className="rounded-md bg-ink px-3 py-2 font-semibold text-white hover:bg-moss" href="/signup">
                    Join a group
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
