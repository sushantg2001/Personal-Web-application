import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/config/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        border: "oklch(var(--border) / <alpha-value>)",
        input: "oklch(var(--input) / <alpha-value>)",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        amber: "oklch(var(--amber) / <alpha-value>)",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "oklch(var(--popover) / <alpha-value>)",
          foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "oklch(var(--card) / <alpha-value>)",
          foreground: "oklch(var(--card-foreground) / <alpha-value>)",
        },
      },
      // "Field Notes" is sharp everywhere — 2px on all radius steps
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "var(--radius)",
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "oklch(var(--foreground) / 0.92)",
            "--tw-prose-headings": "oklch(var(--foreground))",
            "--tw-prose-links": "oklch(var(--foreground))",
            "--tw-prose-bold": "oklch(var(--foreground))",
            "--tw-prose-counters": "oklch(var(--muted-foreground))",
            "--tw-prose-bullets": "oklch(var(--primary))",
            "--tw-prose-hr": "oklch(var(--border))",
            "--tw-prose-quotes": "oklch(var(--muted-foreground))",
            "--tw-prose-quote-borders": "oklch(var(--primary))",
            "--tw-prose-captions": "oklch(var(--muted-foreground))",
            "--tw-prose-code": "oklch(var(--foreground))",
            "--tw-prose-pre-code": "oklch(var(--foreground) / 0.92)",
            "--tw-prose-pre-bg": "oklch(var(--card))",
            "--tw-prose-th-borders": "oklch(var(--border))",
            "--tw-prose-td-borders": "oklch(var(--border))",
            // invert slots mirror the same CSS vars — they already flip with .dark
            "--tw-prose-invert-body": "oklch(var(--foreground) / 0.92)",
            "--tw-prose-invert-headings": "oklch(var(--foreground))",
            "--tw-prose-invert-links": "oklch(var(--foreground))",
            "--tw-prose-invert-bold": "oklch(var(--foreground))",
            "--tw-prose-invert-counters": "oklch(var(--muted-foreground))",
            "--tw-prose-invert-bullets": "oklch(var(--primary))",
            "--tw-prose-invert-hr": "oklch(var(--border))",
            "--tw-prose-invert-quotes": "oklch(var(--muted-foreground))",
            "--tw-prose-invert-quote-borders": "oklch(var(--primary))",
            "--tw-prose-invert-captions": "oklch(var(--muted-foreground))",
            "--tw-prose-invert-code": "oklch(var(--foreground))",
            "--tw-prose-invert-pre-code": "oklch(var(--foreground) / 0.92)",
            "--tw-prose-invert-pre-bg": "oklch(var(--card))",
            "--tw-prose-invert-th-borders": "oklch(var(--border))",
            "--tw-prose-invert-td-borders": "oklch(var(--border))",
            maxWidth: "66ch",
            fontSize: "1.0625rem",
            lineHeight: "1.75",
            "h1, h2": {
              fontFamily: "var(--font-serif), Georgia, serif",
              fontWeight: "400",
              lineHeight: "1.25",
            },
            h2: { fontSize: "1.625rem" },
            "h3, h4": {
              fontFamily: "var(--font-sans), system-ui, sans-serif",
              fontWeight: "600",
            },
            h3: { fontSize: "1.1875rem" },
            "h2 a, h3 a, h4 a": {
              textDecoration: "none",
              fontWeight: "inherit",
              color: "inherit",
            },
            a: {
              fontWeight: "inherit",
              textDecorationThickness: "1.5px",
              textDecorationColor: "oklch(var(--primary))",
              textUnderlineOffset: "3px",
              "&:hover": { color: "oklch(var(--primary))" },
            },
            "code:not(pre code)": {
              background: "oklch(var(--primary) / 0.08)",
              borderRadius: "var(--radius)",
              padding: "0.15em 0.35em",
              fontWeight: "400",
              fontSize: "0.86em",
            },
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            pre: {
              border: "1px solid oklch(var(--border))",
              borderRadius: "var(--radius)",
              fontSize: "0.84375rem",
              lineHeight: "1.7",
            },
            blockquote: {
              fontStyle: "italic",
              fontWeight: "400",
              borderLeftWidth: "2px",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
