import { NextResponse } from "next/server";
import { listDocEntries } from "@/lib/docs/loader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const view = await listDocEntries();
  return NextResponse.json(view);
}
