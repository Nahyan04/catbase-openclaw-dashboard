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
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-accent-sage/30 text-text-primary"
          : "text-text-secondary hover:bg-bg-hover"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {isActive && (
        <span className="ml-auto h-2 w-2 rounded-full bg-accent-sage" />
      )}
    </Link>
  );
}
