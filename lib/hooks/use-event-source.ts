import { useEffect, useRef, useState } from "react";

export type EventSourceEvent = { event: string; data: unknown };
export type EventSourceStatus = "connecting" | "open" | "closed" | "error";

const WELL_KNOWN_EVENTS = [
  "agent:run-start",
  "agent:run-end",
  "session:open",
  "session:close",
  "gateway:opening",
  "gateway:disconnected",
  "gateway:no-credentials",
  "workspace:memory:changed",
] as const;

export function useEventSource(
  url: string,
  options?: { enabled?: boolean },
): { lastEvent: EventSourceEvent | null; status: EventSourceStatus } {
  const enabled = options?.enabled ?? true;
  const [lastEvent, setLastEvent] = useState<EventSourceEvent | null>(null);
  const [status, setStatus] = useState<EventSourceStatus>("connecting");
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const es = new EventSource(url);
    esRef.current = es;
    setStatus("connecting");

    es.onopen = () => {
      setStatus("open");
    };

    es.onerror = () => {
      // The browser auto-reconnects; we mark as error but don't close.
      setStatus("error");
    };

    // Default (unnamed) message events.
    es.onmessage = (e: MessageEvent) => {
      try {
        setLastEvent({ event: "message", data: JSON.parse(e.data as string) });
      } catch {
        setLastEvent({ event: "message", data: e.data });
      }
    };

    // Named events from the well-known list.
    for (const name of WELL_KNOWN_EVENTS) {
      es.addEventListener(name, (e: Event) => {
        const me = e as MessageEvent;
        try {
          setLastEvent({ event: name, data: JSON.parse(me.data as string) });
        } catch {
          setLastEvent({ event: name, data: me.data });
        }
      });
    }

    return () => {
      es.close();
      esRef.current = null;
      setStatus("closed");
    };
  }, [url, enabled]);

  return { lastEvent, status };
}
