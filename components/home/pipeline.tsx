export function Pipeline() {
  const rows: { left: string; file: string; right: string }[] = [
    {
      left: "Sonic + Picasso",
      file: "newsletter.md",
      right: "Alyvis → Discord (when human approves)",
    },
    {
      left: "Ohara",
      file: "memory/MEMORY.md",
      right: "Alyvis",
    },
    {
      left: "NYSSA",
      file: "finance/spend.json",
      right: "Alyvis (alert if cap)",
    },
    {
      left: "Dear Diary",
      file: "calendar.ics",
      right: "Alyvis",
    },
  ];

  return (
    <div className="border-2 border-dashed border-border-warm rounded-lg p-4 text-center">
      <div className="text-xs uppercase tracking-wider text-text-secondary mb-3">
        CONTENT PIPELINE
      </div>
      <div className="flex flex-col gap-2 items-center">
        {rows.map((row, i) => (
          <div key={i} className="text-sm text-text-primary">
            <span className="font-medium">{row.left}</span>
            <span className="text-text-muted mx-1">→</span>
            <code className="bg-bg-hover px-1 rounded text-text-secondary text-xs">
              {row.file}
            </code>
            <span className="text-text-muted mx-1">→</span>
            <span>{row.right}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
