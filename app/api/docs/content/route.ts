import { NextRequest, NextResponse } from "next/server";
import { readDocContent } from "@/lib/docs/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const requested = req.nextUrl.searchParams.get("path");
  if (!requested) {
    return NextResponse.json(
      { error: "Missing 'path' query parameter." },
      { status: 400 },
    );
  }

  const result = await readDocContent(requested);

  if (!result.ok) {
    if (result.reason === "invalid-path") {
      return NextResponse.json(
        { error: "Invalid path." },
        { status: 400 },
      );
    }
    if (result.reason === "not-configured") {
      return NextResponse.json(
        { error: "Docs directory is not configured." },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ content: result.content });
}
