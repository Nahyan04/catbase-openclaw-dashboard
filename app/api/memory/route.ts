import { NextResponse } from "next/server";
import { listMemoryEntries } from "@/lib/memory/loader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const view = await listMemoryEntries();
  return NextResponse.json(view);
}
