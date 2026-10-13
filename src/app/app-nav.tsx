"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/", label: "Dashboard" },
  { href: "/subjects", label: "Mata Pelajaran" },
  { href: "/grades", label: "Input Nilai" },
  { href: "/analysis", label: "Analisis" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama" className="main-nav">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`nav-link${isActive ? " nav-link-active" : ""}`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}