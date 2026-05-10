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
    <div
      className="pixel-frame-tight bg-[#fff8ec] p-5"
      style={{ ["--pixel-frame-color" as string]: "#3d3530" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span aria-hidden className="inline-block w-2 h-2 bg-[#a8c5a0]" />
        <h3 className="font-pixel text-[10px] uppercase tracking-[0.25em] text-text-primary">
          Content Pipeline
        </h3>
        <span className="ml-auto font-pixel-mono text-[12px] text-text-muted">{"// agent → file → agent"}</span>
      </div>
      <ul className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm flex-wrap font-mono"
          >
            <span className="font-semibold text-text-primary">{row.left}</span>
            <span className="text-[#f4a76a] font-pixel text-[9px]">▶</span>
            <code className="bg-[#3d3530] text-[#f5e8d4] px-1.5 py-0.5 font-pixel-mono text-[12px]">
              {row.file}
            </code>
            <span className="text-[#f4a76a] font-pixel text-[9px]">▶</span>
            <span className="text-text-secondary">{row.right}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
