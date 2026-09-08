import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { siteUrl } from "@/lib/site";

export async function POST() {
  await clearSession();
  return NextResponse.redirect(new URL("/", siteUrl()));
}
