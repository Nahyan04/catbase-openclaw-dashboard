/**
 * Ambient type declaration for "@openclaw/sdk".
 *
 * The package is not yet published on npm. This declaration satisfies the
 * TypeScript compiler when lib/openclaw/client.ts does a dynamic import of
 * "@openclaw/sdk". When the SDK is published, delete this file and install
 * the real package — its own type declarations will take over.
 */
declare module "@openclaw/sdk" {
  export class OpenClaw {
    constructor(opts: { url: string; token: string });
    agents: { list(): Promise<import("@/lib/openclaw/types").OpenClawAgent[]> };
    sessions: { list(): Promise<import("@/lib/openclaw/types").OpenClawSession[]> };
    runs: {
      list(opts?: { scheduled?: boolean; from?: string; to?: string }): Promise<import("@/lib/openclaw/types").OpenClawRun[]>;
      create(input: { agentId: string; title?: string; status?: import("@/lib/openclaw/types").RunStatus; input?: unknown }): Promise<import("@/lib/openclaw/types").OpenClawRun>;
      update(id: string, patch: Partial<Pick<import("@/lib/openclaw/types").OpenClawRun, "status" | "title">>): Promise<import("@/lib/openclaw/types").OpenClawRun>;
    };
    artifacts: { list(): Promise<import("@/lib/openclaw/types").OpenClawArtifact[]> };
    events(): AsyncIterable<import("@/lib/openclaw/types").OpenClawEvent>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
  }
}
