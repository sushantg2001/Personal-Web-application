"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/site/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = siteConfig.nav.filter((item) => !item.hidden);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/#.*$/, ""));

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6 md:px-8">
        <Link href="/" className="font-mono text-[15px]">
          ~/sushant
          <span className="text-primary">_</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 font-mono text-[13px] lowercase transition-colors hover:text-foreground",
                isActive(item.href) && item.href !== "/#projects"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <span className="text-primary">{String(i + 1).padStart(2, "0")}</span>{" "}
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t px-6 py-3 md:hidden">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 font-mono text-[13px] lowercase text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="text-primary">{String(i + 1).padStart(2, "0")}</span>{" "}
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
