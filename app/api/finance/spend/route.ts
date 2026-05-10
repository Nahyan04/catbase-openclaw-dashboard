import { NextRequest, NextResponse } from "next/server";
import { getSpend } from "@/lib/finance/spend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const daysRaw = url.searchParams.get("days");
  const parsed = daysRaw ? parseInt(daysRaw, 10) : NaN;
  const days = Number.isFinite(parsed)
    ? Math.max(1, Math.min(365, parsed))
    : 30;
  const view = await getSpend({ days });
  return NextResponse.json(view);
}
