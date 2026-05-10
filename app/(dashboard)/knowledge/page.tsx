import { KnowledgeShell } from "@/components/knowledge/knowledge-shell";

export default function KnowledgePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-text-primary">Knowledge</h1>
      <KnowledgeShell />
    </div>
  );
}
