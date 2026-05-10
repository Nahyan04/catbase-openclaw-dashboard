import { streamSse } from "@/lib/sse";
import { subscribeToGateway } from "@/lib/openclaw/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return streamSse(subscribeToGateway(req.signal), req.signal);
}
