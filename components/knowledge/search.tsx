"use client";

import { Input } from "@/components/ui/input";

interface KnowledgeSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function KnowledgeSearch({
  value,
  onChange,
  placeholder = "Search memory and docs…",
}: KnowledgeSearchProps) {
  return (
    <div className="relative max-w-md">
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange((e.target as HTMLInputElement).value)}
        placeholder={placeholder}
        className="pl-8"
      />
      <span
        aria-hidden="true"
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-sm"
      >
        ⌕
      </span>
    </div>
  );
}
