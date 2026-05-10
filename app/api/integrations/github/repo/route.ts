import { NextRequest, NextResponse } from "next/server";
import { getRepoActivity } from "@/lib/integrations/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "missing slug query parameter (owner/repo)" },
      { status: 400 },
    );
  }

  const result = await getRepoActivity(slug);

  if ("skipped" in result) {
    return NextResponse.json({ skipped: result.skipped });
  }
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true, activity: result.activity });
}
