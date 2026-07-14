import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  const socials = siteConfig.socials.filter((s) => !s.hidden);

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p className="font-mono text-xs text-muted-foreground">
          © {new Date().getFullYear()} · {siteConfig.domain}
        </p>
        <div className="flex items-center gap-5">
          {socials.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              target={href.startsWith("/") ? undefined : "_blank"}
              rel={href.startsWith("/") ? undefined : "noopener noreferrer"}
              className="font-mono text-xs lowercase transition-colors hover:text-primary"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
