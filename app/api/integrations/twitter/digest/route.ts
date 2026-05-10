import { NextRequest, NextResponse } from "next/server";
import { getDailyDigest } from "@/lib/integrations/twitter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limitRaw = url.searchParams.get("limit");
  const parsed = limitRaw ? parseInt(limitRaw, 10) : NaN;
  const limit = Number.isFinite(parsed)
    ? Math.max(1, Math.min(100, parsed))
    : undefined;

  const result = await getDailyDigest(limit !== undefined ? { limit } : {});

  if ("skipped" in result) {
    return NextResponse.json({ skipped: result.skipped, tweets: [] });
  }
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true, tweets: result.tweets });
}
