import { Badge } from "@/components/ui/badge";
import { getAgent } from "@/lib/agents/registry";

interface AuthorChipProps {
  author?: string;
}

export function AuthorChip({ author }: AuthorChipProps) {
  if (!author) return null;
  const agent = getAgent(author);
  if (agent) {
    return (
      <Badge
        className="border-transparent text-text-primary"
        style={{ backgroundColor: `${agent.accentColor}33` }}
      >
        <span
          className="h-2 w-2 rounded-full mr-1"
          style={{ backgroundColor: agent.accentColor }}
        />
        {agent.name}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-text-secondary">
      {author}
    </Badge>
  );
}
