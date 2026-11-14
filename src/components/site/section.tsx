import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  /** Mono index shown moss-tinted before the title, e.g. "01". */
  index?: string;
  /** Optional "view all" style link shown next to the title. */
  link?: { label: string; href: string };
}

export function Section({ title, index, link, className, children, ...props }: SectionProps) {
  return (
    <section className={cn("py-10", className)} {...props}>
      <div className="mb-6 flex items-baseline justify-between">
        <p className="label">
          {index && <span className="idx">{index}/</span>} {title}
        </p>
        {link && (
          <Link
            href={link.href}
            className="group inline-flex items-center gap-1 font-mono text-xs lowercase text-muted-foreground transition-colors hover:text-primary"
          >
            {link.label}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
