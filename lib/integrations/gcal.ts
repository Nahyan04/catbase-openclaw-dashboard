import "server-only";

import { google, type calendar_v3 } from "googleapis";
import { env } from "@/lib/env";

export type GCalEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  attendees?: string[];
  url?: string;
};

export type ListResult =
  | { skipped: "no-credentials" }
  | { ok: true; events: GCalEvent[] }
  | { ok: false; error: string };

export type CreateResult =
  | { skipped: "no-credentials" }
  | { ok: true; event: GCalEvent }
  | { ok: false; error: string };

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

let cachedClient: calendar_v3.Calendar | null = null;
let cachedFromToken: string | null = null;

function getClient(): calendar_v3.Calendar | null {
  const credsRaw = env.GOOGLE_CALENDAR_CREDENTIALS;
  if (!credsRaw) return null;

  if (cachedClient && cachedFromToken === credsRaw) return cachedClient;

  let creds: Record<string, unknown>;
  try {
    creds = JSON.parse(credsRaw);
  } catch {
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: SCOPES,
  });

  cachedClient = google.calendar({ version: "v3", auth });
  cachedFromToken = credsRaw;
  return cachedClient;
}

function calendarId(): string {
  return env.GOOGLE_CALENDAR_ID || "primary";
}

function toEvent(raw: calendar_v3.Schema$Event): GCalEvent | null {
  const start = raw.start?.dateTime ?? raw.start?.date;
  if (!start) return null;
  const end = raw.end?.dateTime ?? raw.end?.date ?? undefined;
  return {
    id: raw.id ?? `${start}-${raw.summary ?? "untitled"}`,
    title: raw.summary ?? "(untitled)",
    start,
    end,
    attendees:
      raw.attendees
        ?.map((a) => a.email)
        .filter((e): e is string => typeof e === "string") ?? undefined,
    url: raw.htmlLink ?? undefined,
  };
}

/**
 * List events on the configured calendar between [from, to].
 * Returns `{ skipped: "no-credentials" }` if GOOGLE_CALENDAR_CREDENTIALS is unset.
 */
export async function listEvents(opts: {
  from: Date;
  to: Date;
}): Promise<ListResult> {
  const client = getClient();
  if (!client) return { skipped: "no-credentials" };

  try {
    const res = await client.events.list({
      calendarId: calendarId(),
      timeMin: opts.from.toISOString(),
      timeMax: opts.to.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 250,
    });

    const events = (res.data.items ?? [])
      .map(toEvent)
      .filter((e): e is GCalEvent => e !== null);

    return { ok: true, events };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Create a single event on the configured calendar. Used by Dear Diary's
 * scheduling output to publish a real GCal entry alongside the OpenClaw run.
 */
export async function createEvent(input: {
  summary: string;
  start: string;
  end: string;
  description?: string;
  attendees?: string[];
}): Promise<CreateResult> {
  const client = getClient();
  if (!client) return { skipped: "no-credentials" };

  try {
    const res = await client.events.insert({
      calendarId: calendarId(),
      requestBody: {
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.start },
        end: { dateTime: input.end },
        attendees: input.attendees?.map((email) => ({ email })),
      },
    });

    const event = toEvent(res.data);
    if (!event) {
      return { ok: false, error: "calendar API returned event with no start" };
    }
    return { ok: true, event };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
