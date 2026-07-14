import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-start px-6 py-24">
      <p className="label mb-4">
        <span className="idx">404/</span> not found
      </p>
      <h1 className="font-serif text-[34px] font-normal leading-tight">
        This page doesn&apos;t exist
        <span className="text-primary">.</span>
      </h1>
      <p className="mt-3 max-w-[46ch] text-muted-foreground">
        Either the link is stale or I moved something and forgot to leave a
        note. The homepage knows the way.
      </p>
      <Link href="/" className={`${buttonVariants({ variant: "outline" })} mt-8`}>
        <ArrowLeft />
        back home
      </Link>
    </main>
  );
}
