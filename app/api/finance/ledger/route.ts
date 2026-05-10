import { NextResponse } from "next/server";
import { readLedger } from "@/lib/finance/ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const view = await readLedger();
  return NextResponse.json(view);
}
