"use client";

import { useMemo } from "react";
import Fuse from "fuse.js";
import { format, parseISO } from "date-fns";
import { MemoryCard } from "./memory-card";
import type {
  MemoryDay,
  MemoryEntry,
  MemoryView,
} from "@/lib/memory/loader";

interface MemoryTimelineProps {
  view: MemoryView;
  query: string;
}

/** Heuristic title for an entry: first non-empty markdown heading, else "HH:MM entry". */
function entryTitle(entry: MemoryEntry): string {
  const lines = entry.content.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    const match = /^#{1,6}\s+(.+)$/.exec(line);
    if (match) return match[1].trim();
  }
  return `${entry.time} entry`;
}

function formatDay(date: string): string {
  try {
    return format(parseISO(date), "EEEE, MMMM d, yyyy");
  } catch {
    return date;
  }
}

export function MemoryTimeline({ view, query }: MemoryTimelineProps) {
  const trimmedQuery = query.trim();

  const fuse = useMemo(() => {
    const items = view.days.flatMap((day) =>
      day.entries.map((entry) => ({
        date: day.date,
        entry,
        title: entryTitle(entry),
      })),
    );
    return new Fuse(items, {
      keys: ["title", "entry.content", "date"],
      threshold: 0.4,
      ignoreLocation: true,
    });
  }, [view.days]);

  const filteredDays: MemoryDay[] = useMemo(() => {
    if (!trimmedQuery) return view.days;

    const matches = fuse.search(trimmedQuery);
    const byDate = new Map<string, MemoryEntry[]>();
    for (const m of matches) {
      const { date, entry } = m.item;
      const arr = byDate.get(date);
      if (arr) arr.push(entry);
      else byDate.set(date, [entry]);
    }
    const result: MemoryDay[] = [];
    for (const [date, entries] of byDate) {
      result.push({ date, entries });
    }
    result.sort((a, b) => (a.date < b.date ? 1 : -1));
    return result;
  }, [trimmedQuery, fuse, view.days]);

  const longTermMatches =
    !trimmedQuery ||
    (view.longTerm
      ? view.longTerm.content.toLowerCase().includes(trimmedQuery.toLowerCase())
      : false);

  const isEmpty = view.longTerm === null && view.days.length === 0;

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-border-warm bg-bg-card p-8 text-center">
        <p className="text-sm text-text-secondary">
          Ohara hasn&apos;t written anything yet.
        </p>
      </div>
    );
  }

  const noResults =
    trimmedQuery && filteredDays.length === 0 && !longTermMatches;

  return (
    <div className="flex flex-col gap-4">
      {view.longTerm && longTermMatches && (
        <MemoryCard
          pinned
          title="MEMORY.md"
          content={view.longTerm.content}
          mtime={view.longTerm.mtime}
        />
      )}

      {noResults ? (
        <p className="text-sm text-text-muted text-center py-6">
          No memories match &ldquo;{trimmedQuery}&rdquo;.
        </p>
      ) : (
        filteredDays.map((day) => (
          <section key={day.date} className="flex flex-col gap-2">
            <h3 className="text-xs font-medium uppercase tracking-widest text-text-muted px-1">
              {formatDay(day.date)}
            </h3>
            <div className="flex flex-col gap-2 border-l-2 border-border-warm pl-3 ml-1">
              {day.entries.map((entry) => (
                <MemoryCard
                  key={entry.filename}
                  title={entryTitle(entry)}
                  time={entry.time}
                  content={entry.content}
                  mtime={entry.mtime}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
