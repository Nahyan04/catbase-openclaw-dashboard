import "server-only";

import { getOpenClaw } from "@/lib/openclaw/client";

export type ScheduleEvent = {
  id: string;
  title: string;
  agentId: string;
  when: string;
  recurrence?: string;
};

export async function listScheduleEvents(opts?: {
  from?: string;
  to?: string;
}): Promise<ScheduleEvent[]> {
  const oc = await getOpenClaw();
  if (!oc) return [];

  const runs = await oc.runs.list({ scheduled: true });

  let events: ScheduleEvent[] = runs
    .filter((r) => r.scheduledFor != null)
    .map((r) => ({
      id: r.id,
      title: r.title ?? r.id,
      agentId: r.agentId,
      when: r.scheduledFor as string,
    }));

  if (opts?.from) {
    const from = opts.from;
    events = events.filter((e) => e.when >= from);
  }

  if (opts?.to) {
    const to = opts.to;
    events = events.filter((e) => e.when <= to);
  }

  return events;
}
