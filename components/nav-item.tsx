"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItemProps = {
  href: string;
  label: string;
  icon: string;
};

export function NavItem({ href, label, icon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href === "/" && pathname === "/");

  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 px-3 py-2 transition-all font-pixel text-[10px] uppercase tracking-wider ${
        isActive
          ? "bg-[#3d3530] text-[#f5e8d4]"
          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
      }`}
      style={isActive ? { boxShadow: "2px 2px 0 0 #a8c5a0" } : undefined}
    >
      <span className="font-mono text-[14px] leading-none w-4 text-center">{icon}</span>
      <span>{label}</span>
      {isActive && (
        <span aria-hidden="true" className="ml-auto inline-block w-2 h-2 bg-[#a8c5a0]" />
      )}
    </Link>
  );
}
