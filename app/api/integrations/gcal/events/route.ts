import { NextRequest, NextResponse } from "next/server";
import { listEvents } from "@/lib/integrations/gcal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseDate(value: string | null, fallback: Date): Date {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const from = parseDate(url.searchParams.get("from"), now);
  const to = parseDate(url.searchParams.get("to"), weekFromNow);

  const result = await listEvents({ from, to });

  if ("skipped" in result) {
    return NextResponse.json({ skipped: result.skipped, events: [] });
  }
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true, events: result.events });
}
