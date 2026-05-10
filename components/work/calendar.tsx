"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  format,
  parseISO,
  isWithinInterval,
} from "date-fns";
import { getAgent } from "@/lib/agents/registry";
import type { ScheduleEvent } from "@/lib/schedule/source";

type ViewMode = "weekly" | "monthly";

function buildQueryParams(from: Date, to: Date): string {
  return `?from=${from.toISOString()}&to=${to.toISOString()}`;
}

function EventChip({ event }: { event: ScheduleEvent }) {
  const agent = getAgent(event.agentId);
  const timeLabel = format(parseISO(event.when), "HH:mm");

  return (
    <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-bg-hover truncate">
      {agent && (
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: agent.accentColor }}
        />
      )}
      <span className="font-medium tabular-nums text-text-secondary shrink-0">
        {timeLabel}
      </span>
      <span className="truncate text-text-primary">{event.title}</span>
    </div>
  );
}

interface WeeklyViewProps {
  cursor: Date;
  events: ScheduleEvent[];
}

function WeeklyView({ cursor, events }: WeeklyViewProps) {
  const weekStart = startOfWeek(cursor, { weekStartsOn: 1 });
  const days = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(cursor, { weekStartsOn: 1 }),
  });

  const eventsForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return events.filter((e) => {
      const eventDay = format(parseISO(e.when), "yyyy-MM-dd");
      return eventDay === dayStr;
    });
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dayEvents = eventsForDay(day);
        const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

        return (
          <div key={day.toISOString()} className="flex flex-col gap-1 min-h-[120px]">
            <div
              className={[
                "text-center text-xs pb-1 border-b border-border",
                isToday ? "text-text-primary font-semibold" : "text-text-secondary",
              ].join(" ")}
            >
              <div className="uppercase tracking-wider">{format(day, "EEE")}</div>
              <div
                className={[
                  "mx-auto mt-0.5 w-6 h-6 flex items-center justify-center rounded-full text-xs",
                  isToday ? "bg-accent-sage text-white" : "",
                ].join(" ")}
              >
                {format(day, "d")}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {dayEvents.length === 0 ? (
                <span className="text-xs text-text-muted text-center pt-2">—</span>
              ) : (
                dayEvents.map((e) => <EventChip key={e.id} event={e} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface MonthlyViewProps {
  cursor: Date;
  events: ScheduleEvent[];
}

function MonthlyView({ cursor, events }: MonthlyViewProps) {
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);

  // Pad to Monday-aligned grid
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weekHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const eventsForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return events.filter((e) => {
      const eventDay = format(parseISO(e.when), "yyyy-MM-dd");
      return eventDay === dayStr;
    });
  };

  const isCurrentMonth = (day: Date) =>
    isWithinInterval(day, { start: monthStart, end: monthEnd });

  const isToday = (day: Date) =>
    format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div>
      <div className="grid grid-cols-7 gap-px mb-1">
        {weekHeaders.map((h) => (
          <div
            key={h}
            className="text-center text-xs text-text-secondary uppercase tracking-wider py-1"
          >
            {h}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {days.map((day) => {
          const dayEvents = eventsForDay(day);
          const inMonth = isCurrentMonth(day);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={[
                "bg-bg-base p-1.5 min-h-[72px] flex flex-col gap-1",
                !inMonth ? "opacity-40" : "",
              ].join(" ")}
            >
              <div
                className={[
                  "text-xs w-6 h-6 flex items-center justify-center rounded-full self-end",
                  today
                    ? "bg-accent-sage text-white font-semibold"
                    : "text-text-secondary",
                ].join(" ")}
              >
                {format(day, "d")}
              </div>
              {dayEvents.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  {dayEvents.slice(0, 2).map((e) => {
                    const agent = getAgent(e.agentId);
                    return (
                      <div
                        key={e.id}
                        className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-bg-hover truncate"
                      >
                        {agent && (
                          <span
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: agent.accentColor }}
                          />
                        )}
                        <span className="truncate text-text-primary">{e.title}</span>
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-text-muted px-1.5">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Calendar() {
  const [view, setView] = useState<ViewMode>("weekly");
  const [cursor, setCursor] = useState(() => new Date());

  const from =
    view === "weekly"
      ? startOfWeek(cursor, { weekStartsOn: 1 })
      : startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });

  const to =
    view === "weekly"
      ? endOfWeek(cursor, { weekStartsOn: 1 })
      : endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });

  const { data: events = [], isLoading } = useQuery<ScheduleEvent[]>({
    queryKey: ["schedule", from.toISOString(), to.toISOString()],
    queryFn: () =>
      fetch(`/api/schedule${buildQueryParams(from, to)}`).then((r) => r.json()),
  });

  function prev() {
    setCursor((c) => (view === "weekly" ? subWeeks(c, 1) : subMonths(c, 1)));
  }

  function next() {
    setCursor((c) => (view === "weekly" ? addWeeks(c, 1) : addMonths(c, 1)));
  }

  const title = format(cursor, "MMMM yyyy");

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="h-7 w-7 rounded flex items-center justify-center text-text-secondary hover:bg-bg-hover transition-colors"
            aria-label="Previous"
          >
            ‹
          </button>
          <span className="text-sm font-medium text-text-primary min-w-[120px] text-center">
            {title}
          </span>
          <button
            onClick={next}
            className="h-7 w-7 rounded flex items-center justify-center text-text-secondary hover:bg-bg-hover transition-colors"
            aria-label="Next"
          >
            ›
          </button>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 p-0.5 bg-bg-sidebar rounded-lg">
          {(["weekly", "monthly"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={[
                "px-3 py-1 rounded text-xs font-medium transition-colors",
                view === v
                  ? "bg-bg-base text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              {v === "weekly" ? "Week" : "Month"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-text-muted animate-pulse">Loading schedule…</div>
      ) : view === "weekly" ? (
        <WeeklyView cursor={cursor} events={events} />
      ) : (
        <MonthlyView cursor={cursor} events={events} />
      )}
    </div>
  );
}
