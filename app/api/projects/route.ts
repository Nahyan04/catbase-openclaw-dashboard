import { NextResponse } from "next/server";
import { listProjectEntries } from "@/lib/projects/loader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const view = await listProjectEntries();
  return NextResponse.json(view);
}
