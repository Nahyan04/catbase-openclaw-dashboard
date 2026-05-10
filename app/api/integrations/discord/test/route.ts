import { NextResponse } from "next/server";
import { postToDiscord } from "@/lib/integrations/discord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const result = await postToDiscord({
    content: "Mission Control connected ✓",
    embeds: [
      {
        title: "Hello from CATBASE",
        description:
          "If you're seeing this, the Discord webhook is wired up correctly. Failed-run alerts will arrive on this channel.",
        color: 0xa8c5a0,
        timestamp: new Date().toISOString(),
      },
    ],
  });

  if ("skipped" in result) {
    return NextResponse.json(
      { ok: false, reason: result.skipped },
      { status: 400 },
    );
  }
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
