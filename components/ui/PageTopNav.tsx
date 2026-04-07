"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/who-i-am", label: "Who I Am" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" }
];

export function PageTopNav() {
  const pathname = usePathname();

  return (
    <nav
      data-page-top-nav
      className="flex w-full flex-wrap items-center gap-4 px-6 pt-8 md:px-10 md:pt-10"
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`rounded-md border px-3 py-2 font-['Press_Start_2P'] text-[10px] uppercase tracking-[0.08em] transition-colors ${
            pathname === link.href
              ? "border-white/75 bg-white/20 text-white"
              : "border-white/35 bg-black/30 text-white/90 hover:border-white/60 hover:bg-white/10"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
