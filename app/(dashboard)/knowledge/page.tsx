import { KnowledgeShell } from "@/components/knowledge/knowledge-shell";
import { PageHeader } from "@/components/pixel/page-header";

export default function KnowledgePage() {
  return (
    <div className="px-6 sm:px-8 py-8">
      <PageHeader
        title="Knowledge"
        subtitle="// memory timeline + agent-authored docs"
        glyph="✦"
        accent="#c4956a"
      />
      <KnowledgeShell />
    </div>
  );
}
