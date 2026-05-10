import { NextResponse } from "next/server";
import { scaffoldProjects } from "@/lib/projects/scaffold";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  const result = await scaffoldProjects();
  if (!result.created && result.reason === "outside-workspace") {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result, { status: 200 });
}
