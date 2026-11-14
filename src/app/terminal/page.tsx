import type { Metadata } from "next";
import Terminal from "@/components/Terminal";

export const metadata: Metadata = {
  title: "Terminal",
  description: "The original terminal homepage, kept around as an easter egg.",
};

export default function TerminalPage() {
  return (
    <main className="terminal-theme flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#0c0c0c] p-4 md:p-8">
      <Terminal />
    </main>
  );
}
