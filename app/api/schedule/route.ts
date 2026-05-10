import { NextRequest, NextResponse } from "next/server";
import { listScheduleEvents } from "@/lib/schedule/source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;

    const events = await listScheduleEvents({ from, to });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
