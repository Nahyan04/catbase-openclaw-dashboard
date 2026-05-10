import "server-only";

import { getOpenClaw } from "@/lib/openclaw/client";
import { listEvents as listGCalEvents } from "@/lib/integrations/gcal";

export type ScheduleEvent = {
  id: string;
  title: string;
  agentId: string;
  when: string;
  recurrence?: string;
  /** "openclaw" for SDK-sourced runs, "gcal" for Google Calendar entries. */
  source?: "openclaw" | "gcal";
};

const GCAL_AGENT_ID = "dear-diary";

function withinRange(when: string, from?: string, to?: string): boolean {
  if (from && when < from) return false;
  if (to && when > to) return false;
  return true;
}

async function listOpenClawEvents(opts?: {
  from?: string;
  to?: string;
}): Promise<ScheduleEvent[]> {
  const oc = await getOpenClaw();
  if (!oc) return [];

  const runs = await oc.runs.list({ scheduled: true });

  return runs
    .filter((r) => r.scheduledFor != null)
    .map<ScheduleEvent>((r) => ({
      id: r.id,
      title: r.title ?? r.id,
      agentId: r.agentId,
      when: r.scheduledFor as string,
      source: "openclaw",
    }))
    .filter((e) => withinRange(e.when, opts?.from, opts?.to));
}

async function listExternalCalendarEvents(opts?: {
  from?: string;
  to?: string;
}): Promise<ScheduleEvent[]> {
  const now = new Date();
  const defaultTo = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const fromDate = opts?.from ? new Date(opts.from) : now;
  const toDate = opts?.to ? new Date(opts.to) : defaultTo;

  const result = await listGCalEvents({ from: fromDate, to: toDate });
  if (!("ok" in result) || !result.ok) return [];

  return result.events.map<ScheduleEvent>((e) => ({
    id: `gcal:${e.id}`,
    title: e.title,
    agentId: GCAL_AGENT_ID,
    when: e.start,
    source: "gcal",
  }));
}

export async function listScheduleEvents(opts?: {
  from?: string;
  to?: string;
}): Promise<ScheduleEvent[]> {
  const [oc, gcal] = await Promise.all([
    listOpenClawEvents(opts),
    listExternalCalendarEvents(opts),
  ]);

  return [...oc, ...gcal].sort((a, b) => a.when.localeCompare(b.when));
}
