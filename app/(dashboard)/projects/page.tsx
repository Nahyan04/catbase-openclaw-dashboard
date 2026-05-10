import { ProjectsGrid } from "@/components/projects/projects-grid";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-text-primary">Projects</h1>
      <ProjectsGrid />
    </div>
  );
}
