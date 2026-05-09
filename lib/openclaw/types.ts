/**
 * These types mirror the @openclaw/sdk surface described in mission-control-spec.md.
 *
 * When the SDK is published, replace this module's body with:
 *   export * from '@openclaw/sdk';
 * and update lib/openclaw/client.ts to import from there.
 *
 * The @openclaw/sdk package is not yet available on the public npm registry.
 * This internal definition covers only the surface needed for Phases 1–6.
 */

export interface OpenClawAgent {
  id: string;
  name: string;
  model?: string;
  schedule?: string;
}

export interface OpenClawSession {
  id: string;
  agentId: string;
  openedAt: string; // ISO
  closedAt?: string;
}

export type RunStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface OpenClawRun {
  id: string;
  agentId: string;
  title?: string;
  status: RunStatus;
  priority?: "low" | "normal" | "high";
  createdAt: string; // ISO
  startedAt?: string;
  finishedAt?: string;
  scheduledFor?: string;
  tokensIn?: number;
  tokensOut?: number;
  input?: unknown;
  output?: unknown;
}

export interface OpenClawArtifact {
  id: string;
  runId: string;
  path: string;
  kind: "memory" | "doc" | "data";
  createdAt: string;
}

export interface OpenClawEvent {
  event: string; // e.g. "agent:run-start", "agent:run-end", "session:open"
  data: unknown;
  at: string; // ISO
}

// Shape of the SDK surface (subset).
export interface OpenClawClient {
  agents: { list(): Promise<OpenClawAgent[]> };
  sessions: { list(): Promise<OpenClawSession[]> };
  runs: {
    list(opts?: { scheduled?: boolean; from?: string; to?: string }): Promise<OpenClawRun[]>;
    create(input: { agentId: string; title?: string; status?: RunStatus; input?: unknown }): Promise<OpenClawRun>;
    update(id: string, patch: Partial<Pick<OpenClawRun, "status" | "title">>): Promise<OpenClawRun>;
  };
  artifacts: { list(): Promise<OpenClawArtifact[]> };
  events(): AsyncIterable<OpenClawEvent>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
