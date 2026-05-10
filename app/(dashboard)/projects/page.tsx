import { ProjectsGrid } from "@/components/projects/projects-grid";
import { PageHeader } from "@/components/pixel/page-header";

export default function ProjectsPage() {
  return (
    <div className="px-6 sm:px-8 py-8">
      <PageHeader
        title="Projects"
        subtitle="// active initiatives — what moves forward today"
        glyph="◈"
        accent="#f4a76a"
      />
      <ProjectsGrid />
    </div>
  );
}
