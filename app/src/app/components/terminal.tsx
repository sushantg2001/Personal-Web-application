"use client";

import { useState, useEffect, useRef } from "react";

// ── Data ─────────────────────────────────────────────────────────
const ABOUT = {
  name: "Sushant Gupta",
  role: "Developer & Builder",
  location: "New Delhi, India",
  education: "IIT Delhi",
  bio: "I build things for the web and obsess over the infrastructure running beneath them. Currently studying at IIT Delhi while shipping projects on the side.",
  stack: ["TypeScript", "Next.js", "React", "Node.js", "Docker", "Linux", "Python", "PostgreSQL"],
  links: {
    github: "https://github.com/sushantg2001",
    email: "sushantg2001@gmail.com",
    storage: "https://storage.sushantgupta.cloud",
  },
};

// ── Command outputs ───────────────────────────────────────────────
type Line = { text: string; color?: string; indent?: boolean };

function getOutput(cmd: string): Line[] | null {
  const c = cmd.trim().toLowerCase();

  if (c === "help") return [
    { text: "Available commands:", color: "var(--green)" },
    { text: "" },
    { text: "  whoami       " + "→ about me", color: "var(--text)" },
    { text: "  stack        " + "→ tools I use", color: "var(--text)" },
    { text: "  links        " + "→ find me online", color: "var(--text)" },
    { text: "  projects     " + "→ things I've built", color: "var(--text)" },
    { text: "  clear        " + "→ clear terminal", color: "var(--text)" },
    { text: "" },
    { text: "tip: type any command and press Enter", color: "var(--dim)" },
  ];

  if (c === "whoami") return [
    { text: "┌─ " + ABOUT.name, color: "var(--green)" },
    { text: "│" },
    { text: "│  role      " + ABOUT.role },
    { text: "│  location  " + ABOUT.location },
    { text: "│  education " + ABOUT.education },
    { text: "│" },
    { text: "│  " + ABOUT.bio },
    { text: "└─", color: "var(--green)" },
  ];

  if (c === "stack") return [
    { text: "$ tech stack", color: "var(--green)" },
    { text: "" },
    ...ABOUT.stack.map((s, i) => ({
      text: `  [${String(i + 1).padStart(2, "0")}]  ${s}`,
    })),
  ];

  if (c === "links") return [
    { text: "$ find me at", color: "var(--green)" },
    { text: "" },
    { text: "  github   →  " + ABOUT.links.github },
    { text: "  email    →  " + ABOUT.links.email },
    { text: "  storage  →  " + ABOUT.links.storage },
  ];

  if (c === "projects") return [
    { text: "$ projects", color: "var(--green)" },
    { text: "" },
    { text: "  personal-infra", color: "var(--amber)" },
    { text: "  └─ self-hosted stack on VPS" },
    { text: "     traefik + seafile + github actions" },
    { text: "" },
    { text: "  sushantgupta.cloud", color: "var(--amber)" },
    { text: "  └─ this site — next.js static + docker + ghcr" },
  ];

  if (c === "") return [];

  return [
    { text: `command not found: ${cmd}`, color: "var(--red)" },
    { text: `type 'help' for available commands`, color: "var(--dim)" },
  ];
}

// ── Boot sequence ─────────────────────────────────────────────────
const BOOT: Line[] = [
  { text: "sushantgupta.cloud v1.0.0", color: "var(--green)" },
  { text: "─".repeat(40), color: "var(--border)" },
  { text: "" },
  { text: "  Welcome. Type 'help' to get started.", color: "var(--text)" },
  { text: "" },
];

// ── Types ─────────────────────────────────────────────────────────
type HistoryEntry =
  | { type: "boot"; lines: Line[] }
  | { type: "command"; cmd: string; output: Line[] };

// ── Component ─────────────────────────────────────────────────────
export default function Terminal() {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { type: "boot", lines: BOOT },
  ]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdIndex, setCmdIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Focus on click anywhere
  const focusInput = () => inputRef.current?.focus();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();

    if (cmd.toLowerCase() === "clear") {
      setHistory([{ type: "boot", lines: BOOT }]);
      setInput("");
      return;
    }

    const output = getOutput(cmd) ?? [];
    setHistory((h) => [...h, { type: "command", cmd, output }]);
    if (cmd) setCmdHistory((h) => [cmd, ...h]);
    setCmdIndex(-1);
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(cmdIndex + 1, cmdHistory.length - 1);
      setCmdIndex(next);
      setInput(cmdHistory[next] ?? "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(cmdIndex - 1, -1);
      setCmdIndex(next);
      setInput(next === -1 ? "" : cmdHistory[next]);
    }
  };

  return (
    <div
      className="w-full max-w-3xl rounded-lg overflow-hidden shadow-2xl"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      onClick={focusInput}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ background: "var(--bg)", borderColor: "var(--border)" }}
      >
        <span className="w-3 h-3 rounded-full" style={{ background: "#f87171" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#fbbf24" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#4ade80" }} />
        <span
          className="ml-auto text-xs"
          style={{ color: "var(--dim)" }}
        >
          sushant@sushantgupta.cloud ~ $
        </span>
      </div>

      {/* Output */}
      <div
        className="p-5 min-h-64 max-h-[70vh] overflow-y-auto text-sm leading-relaxed"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {history.map((entry, i) =>
          entry.type === "boot" ? (
            <div key={i} className="mb-2">
              {entry.lines.map((line, j) => (
                <div
                  key={j}
                  style={{ color: line.color ?? "var(--text)" }}
                >
                  {line.text || "\u00a0"}
                </div>
              ))}
            </div>
          ) : (
            <div key={i} className="mb-3">
              {/* Prompt line */}
              <div className="flex gap-2">
                <span style={{ color: "var(--green)" }}>❯</span>
                <span style={{ color: "var(--text)" }}>{entry.cmd}</span>
              </div>
              {/* Output lines */}
              {entry.output.map((line, j) => (
                <div
                  key={j}
                  className="ml-4"
                  style={{ color: line.color ?? "var(--text)" }}
                >
                  {line.text || "\u00a0"}
                </div>
              ))}
            </div>
          )
        )}

        {/* Active prompt */}
        <form onSubmit={submit} className="flex items-center gap-2 mt-1">
          <span style={{ color: "var(--green)" }}>❯</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{
              color: "var(--text)",
              caretColor: "var(--green)",
              fontFamily: "var(--font-geist-mono)",
            }}
          />
        </form>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}