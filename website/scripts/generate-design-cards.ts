// Generates the Claude Design preview cards into website/design-system/.
// Each card is a self-contained HTML file whose first line carries the
// @dsCard marker the claude.ai Design pane indexes. Cards embed the same
// "Field Notes" tokens as src/app/globals.css (source: the design project's
// styles.css) — keep the two in sync when tokens change.
//
// Run: bun run scripts/generate-design-cards.ts

import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const OUT = fileURLToPath(new URL("../design-system", import.meta.url));

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Familjen+Grotesk:wght@400..700&family=Fragment+Mono&display=swap" rel="stylesheet">`;

const BASE_CSS = `
:root{--bg:oklch(96.6% 0.012 85);--surface:oklch(98.6% 0.007 85);--ink:oklch(24.5% 0.02 80);--muted:oklch(48% 0.02 80);--line:oklch(24.5% 0.02 80 / 0.16);--line-strong:oklch(24.5% 0.02 80 / 0.55);--moss:oklch(50% 0.1 145);--amber:oklch(58% 0.1 70);--moss-wash:oklch(50% 0.1 145 / 0.08);--on-accent:oklch(97% 0.01 85);--radius:2px;--font-display:'Young Serif',Georgia,serif;--font-body:'Familjen Grotesk',system-ui,sans-serif;--font-mono:'Fragment Mono',ui-monospace,monospace}
.dark{--bg:oklch(20.5% 0.015 150);--surface:oklch(23.5% 0.015 150);--ink:oklch(93% 0.012 95);--muted:oklch(69% 0.018 110);--line:oklch(93% 0.012 95 / 0.15);--line-strong:oklch(93% 0.012 95 / 0.5);--moss:oklch(74% 0.11 150);--amber:oklch(78% 0.1 75);--moss-wash:oklch(74% 0.11 150 / 0.1);--on-accent:oklch(20.5% 0.015 150)}
*{box-sizing:border-box}
body{margin:0;padding:24px;background:var(--bg);color:var(--ink);font-family:var(--font-body);font-size:15px;line-height:1.65;-webkit-font-smoothing:antialiased}
.display{font-family:var(--font-display);font-weight:400;line-height:1.12;letter-spacing:-0.005em}
.mono{font-family:var(--font-mono)}
.muted{color:var(--muted)}
.label{font-family:var(--font-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted)}
.label .idx{color:var(--moss)}
.rule-dotted{border:0;border-top:1px dotted var(--line-strong);margin:0}
.row{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.stack{display:flex;flex-direction:column;gap:16px}
.btn{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 18px;border-radius:var(--radius);font:500 14px/1 var(--font-body);letter-spacing:0.01em;border:1px solid transparent;cursor:pointer;text-decoration:none}
.btn-solid{background:var(--ink);color:var(--bg)}
.btn-outline{background:transparent;border-color:var(--line-strong);color:var(--ink)}
.btn-ghost{background:transparent;color:var(--muted)}
.btn-mono{font-family:var(--font-mono);font-size:13px;text-transform:lowercase}
.btn-sm{height:32px;padding:0 12px;font-size:13px}
.btn-lg{height:46px;padding:0 24px;font-size:15px}
.tag{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:var(--radius);font-family:var(--font-mono);font-size:11.5px;letter-spacing:0.02em;border:1px solid var(--line);color:var(--muted);background:transparent}
.tag-moss{border-color:transparent;background:var(--moss-wash);color:var(--moss)}
.tag-solid{border-color:transparent;background:var(--ink);color:var(--bg)}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:22px}
a.plain{color:var(--ink);text-decoration:none}
`;

interface Card {
  path: string;
  name: string;
  group: string;
  subtitle: string;
  width: number;
  /** wrap body in .dark + charcoal page bg */
  dark?: boolean;
  body: string;
}

const swatches = (title: string) => `
<p class="label" style="margin:0 0 8px">${title}</p>
<div class="row">
  ${[
    ["bg", "var(--bg)"],
    ["surface", "var(--surface)"],
    ["ink", "var(--ink)"],
    ["muted", "var(--muted)"],
    ["line", "var(--line)"],
    ["moss", "var(--moss)"],
    ["amber", "var(--amber)"],
  ]
    .map(
      ([n, v]) => `<div style="text-align:center">
      <div style="width:56px;height:56px;border-radius:var(--radius);border:1px solid var(--line);background:${v}"></div>
      <div class="mono" style="font-size:10px;margin-top:6px">${n}</div></div>`
    )
    .join("")}
</div>`;

// Shared page chrome for the full-page preview cards.
const headerBar = `
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 32px;border-bottom:1px solid var(--line)">
  <span class="mono" style="font-size:15px">~/sushant<span style="color:var(--moss)">_</span></span>
  <span class="row" style="gap:24px">
    <span class="mono muted" style="font-size:13px"><span style="color:var(--moss)">01</span> writing</span>
    <span class="mono muted" style="font-size:13px"><span style="color:var(--moss)">02</span> projects</span>
    <span class="muted" style="font-size:15px">&#9789;</span>
  </span>
</div>`;

const footerBar = `
<div style="display:flex;align-items:center;justify-content:space-between;padding:22px 32px;border-top:1px solid var(--line);margin-top:48px">
  <span class="mono muted" style="font-size:12px">© 2026 · sushantgupta.cloud</span>
  <span class="row" style="gap:18px"><span class="mono" style="font-size:12px">github</span><span class="mono" style="font-size:12px">mail</span><span class="mono" style="font-size:12px">terminal</span></span>
</div>`;

const sectionLabel = (idx: string, t: string) =>
  `<p class="label" style="margin:48px 0 20px"><span class="idx">${idx}/</span> ${t}</p>`;

const focusCard = (title: string, desc: string, tags = "") =>
  `<div class="card" style="flex:1;min-width:200px">
    <div class="display" style="font-size:19px">${title}</div>
    <p class="muted" style="margin:8px 0 0;font-size:14px">${desc}</p>${tags ? `<div class="row" style="gap:8px;margin-top:14px">${tags}</div>` : ""}</div>`;

const postRow = (date: string, title: string, desc: string, tag: string, mins: string, moss = false, bottom = false) =>
  `<div style="display:grid;grid-template-columns:120px 1fr;gap:20px;padding:20px 0;border-top:1px solid var(--line)${bottom ? ";border-bottom:1px solid var(--line)" : ""}">
    <div class="mono muted" style="font-size:12.5px;padding-top:4px">${date}</div>
    <div>
      <div class="display" style="font-size:21px">${title}</div>
      <p class="muted" style="margin:6px 0 10px;font-size:14.5px">${desc}</p>
      <div class="row" style="gap:8px"><span class="tag${moss ? " tag-moss" : ""}">${tag}</span><span class="mono muted" style="font-size:11.5px">${mins} min</span></div>
    </div></div>`;

const heroBlock = `
<p class="label" style="margin:0 0 20px">Sushant Gupta &nbsp;·&nbsp; field notes &nbsp;·&nbsp; New Delhi</p>
<div class="display" style="font-size:44px;max-width:16ch">Builder of small, durable systems<span style="color:var(--moss)">.</span></div>
<p class="muted" style="font-size:17px;line-height:1.7;max-width:52ch;margin:24px 0 32px">I build for the web and obsess over the infrastructure underneath it — and I write down what I learn about working with Claude, self-hosting, and keeping notes that compound.</p>
<div class="row">
  <span class="btn btn-solid">Read the notes &#8594;</span>
  <span class="btn btn-outline btn-mono">github &#8599;</span>
</div>`;

const proseBlock = `
<div style="max-width:62ch">
  <div class="display" style="font-size:26px;margin-bottom:10px">What is a container?</div>
  <p style="margin:0 0 14px;font-size:16px;line-height:1.75">A container packages your app with everything it needs — code, runtime, and config. Run one with <span class="mono" style="font-size:.86em;background:var(--moss-wash);border-radius:var(--radius);padding:2px 5px">docker run</span> and read the <a href="#" style="color:var(--ink);text-decoration:underline;text-decoration-color:var(--moss);text-decoration-thickness:1.5px;text-underline-offset:3px">full guide</a>.</p>
  <pre class="mono" style="background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:18px 20px;font-size:13.5px;line-height:1.7;overflow-x:auto;margin:0 0 14px"><span class="muted"># run a container</span>
<span style="color:var(--moss)">docker</span> run -d -p 80:80 <span style="color:var(--amber)">nginx</span></pre>
  <blockquote style="border-left:2px solid var(--moss);margin:0 0 14px;padding:4px 0 4px 20px;color:var(--muted);font-style:italic">Containers share the host kernel — that's why they start in milliseconds.</blockquote>
  <ul style="margin:0;padding-left:22px">
    <li style="margin-bottom:4px">Moss bullets and hairline rules</li>
    <li>Same tokens in light and dark</li>
  </ul>
</div>`;

const cards: Card[] = [
  {
    path: "foundations/colors.html",
    name: "Colors",
    group: "Colors",
    subtitle: "Warm paper + ink, moss accent, amber support",
    width: 640,
    body: `
<div class="stack">
  <div>${swatches("Light")}</div>
  <div class="dark" style="background:var(--bg);color:var(--ink);border-radius:var(--radius);padding:20px;border:1px solid var(--line)">${swatches("Dark")}</div>
  <p class="muted" style="margin:0;font-size:13px">"Field Notes" palette in OKLCH. Moss is the working accent, amber the support color. Tokens live in <span class="mono">globals.css</span>.</p>
</div>`,
  },
  {
    path: "foundations/typography.html",
    name: "Typography",
    group: "Type",
    subtitle: "Young Serif display · Familjen Grotesk body · Fragment Mono",
    width: 640,
    body: `
<div class="stack">
  <div><p class="label" style="margin:0 0 8px">Display — Young Serif 400</p>
    <div class="display" style="font-size:44px">Builder of small, durable systems<span style="color:var(--moss)">.</span></div></div>
  <div><p class="label" style="margin:0 0 8px">Heading — display 26px</p>
    <div class="display" style="font-size:26px">What is a container?</div></div>
  <div><p class="label" style="margin:0 0 8px">Body — Familjen Grotesk 16px / 1.65</p>
    <p style="max-width:52ch;margin:0;font-size:16px">I build for the web and obsess over the infrastructure underneath it — and I write down what I learn.</p></div>
  <div><p class="label" style="margin:0 0 8px">Mono — Fragment Mono 13px</p>
    <div class="mono" style="font-size:13px">2026-03-15 &nbsp;·&nbsp; docker compose up -d --build</div></div>
</div>`,
  },
  {
    path: "foundations/dark-mode.html",
    name: "Dark mode",
    group: "Colors",
    subtitle: "Key components on green-tinted charcoal",
    width: 640,
    dark: true,
    body: `
<div class="stack">
  <div class="display" style="font-size:28px">Same components, same tokens<span style="color:var(--moss)">.</span></div>
  <div class="row">
    <span class="btn btn-solid">Read the notes &#8594;</span>
    <span class="btn btn-outline btn-mono">github &#8599;</span>
    <span class="tag tag-moss">live</span>
  </div>
  <div class="card" style="max-width:340px">
    <div class="display" style="font-size:19px">Claude for coding</div>
    <p class="muted" style="margin:8px 0 0;font-size:14px">Agentic workflows, Claude Code in real projects.</p>
  </div>
</div>`,
  },
  {
    path: "components/buttons.html",
    name: "Buttons",
    group: "Components",
    subtitle: "Solid / outline / ghost / mono, 3 sizes",
    width: 560,
    body: `
<div class="stack">
  <div><p class="label" style="margin:0 0 8px">Variants</p>
    <div class="row">
      <span class="btn btn-solid">Solid</span>
      <span class="btn btn-outline">Outline</span>
      <span class="btn btn-ghost">Ghost</span>
      <span class="btn btn-outline btn-mono">mono &#8599;</span>
    </div></div>
  <div><p class="label" style="margin:0 0 8px">Sizes</p>
    <div class="row">
      <span class="btn btn-solid btn-sm">Small</span>
      <span class="btn btn-solid">Default</span>
      <span class="btn btn-solid btn-lg">Large</span>
    </div></div>
  <p class="muted" style="margin:0;font-size:13px">Solid turns moss on hover. Sharp 2px corners everywhere.</p>
</div>`,
  },
  {
    path: "components/badges.html",
    name: "Tags",
    group: "Components",
    subtitle: "Hairline / moss wash / solid",
    width: 480,
    body: `
<div class="row">
  <span class="tag">docker</span>
  <span class="tag">next.js</span>
  <span class="tag tag-moss">live</span>
  <span class="tag tag-solid">new</span>
</div>
<p class="muted" style="font-size:13px;margin:16px 0 0">Fragment Mono, 2px radius. Hairline = default chip · moss wash = status highlight · solid = strong emphasis.</p>`,
  },
  {
    path: "components/cards.html",
    name: "Cards",
    group: "Components",
    subtitle: "Focus-area and project cards",
    width: 640,
    body: `
<div class="row" style="align-items:stretch">
  ${focusCard("Claude for finance", "Investment reviews, portfolio tracking, and monthly reconciliation with an AI in the loop.")}
  <div class="card" style="flex:1;min-width:260px;border-color:var(--moss)">
    <div class="display" style="font-size:19px;display:flex;justify-content:space-between">sushantgupta.cloud <span class="muted" style="font-size:14px">&#8599;</span></div>
    <p class="muted" style="margin:8px 0 14px;font-size:14px">This site — Next.js static export shipped through Docker and GHCR.</p>
    <div class="row" style="gap:8px"><span class="tag">next.js</span><span class="tag tag-moss">live</span></div>
  </div>
</div>
<p class="muted" style="font-size:13px;margin:16px 0 0">Right card shows the hover state: hairline border turns moss.</p>`,
  },
  {
    path: "components/post-card.html",
    name: "Post row",
    group: "Components",
    subtitle: "ISO date · display title · tags",
    width: 640,
    body: `
${postRow("2026-03-15", "Docker basics: a practical guide", "Containers, images, and the handful of commands you actually need day to day.", "docker", "4", false, true)}
<p class="muted" style="font-size:13px;margin:14px 0 0">Writing list row: 120px mono date column, Young Serif title (turns moss on hover), hairline separators.</p>`,
  },
  {
    path: "patterns/hero.html",
    name: "Hero",
    group: "Patterns",
    subtitle: "Field-notes opening section",
    width: 680,
    body: heroBlock,
  },
  {
    path: "patterns/site-chrome.html",
    name: "Header & footer",
    group: "Patterns",
    subtitle: "Indexed mono nav and text-link footer",
    width: 680,
    body: `
<div class="stack">
  <div style="border:1px solid var(--line);border-radius:var(--radius);overflow:hidden">${headerBar}</div>
  <div style="border:1px solid var(--line);border-radius:var(--radius);overflow:hidden">${footerBar.replace(";margin-top:48px", "").replace("border-top:1px solid var(--line)", "border-top:0")}</div>
</div>`,
  },
  {
    path: "patterns/blog-typography.html",
    name: "Blog typography",
    group: "Patterns",
    subtitle: "Prose, code, blockquote, lists",
    width: 640,
    body: proseBlock,
  },
  {
    path: "pages/home.html",
    name: "Home page",
    group: "Pages",
    subtitle: "Hero · focus areas · writing · projects",
    width: 960,
    body: `
<div style="margin:-24px">
${headerBar}
<div style="max-width:880px;margin:0 auto;padding:0 32px">
  <div style="padding:72px 0 56px">${heroBlock}</div>
  <hr class="rule-dotted">
  ${sectionLabel("01", "Currently exploring")}
  <div class="row" style="align-items:stretch">
    ${focusCard("Claude for coding", "Agentic workflows, Claude Code in real projects, and what changes when the terminal writes back.")}
    ${focusCard("Claude for finance", "Investment reviews, portfolio tracking, and monthly reconciliation with an AI in the loop.")}
    ${focusCard("Knowledge management", "Obsidian, structured vaults, and turning scattered notes into a system that compounds.")}
  </div>
  ${sectionLabel("02", "Latest writing")}
  ${postRow("2026-03-15", "Docker basics: a practical guide", "Containers, images, and the handful of commands you actually need day to day.", "docker", "4", false, true)}
  ${sectionLabel("03", "Projects")}
  <div class="row" style="align-items:stretch">
    ${focusCard("personal-infra &#8599;", "Self-hosted stack on a VPS — Traefik, Seafile, and GitHub Actions deployments.", '<span class="tag">docker</span><span class="tag">vps</span>')}
    ${focusCard("sushantgupta.cloud &#8599;", "This site — Next.js static export shipped through Docker and GHCR.", '<span class="tag">next.js</span><span class="tag tag-moss">live</span>')}
  </div>
</div>
${footerBar}
</div>`,
  },
  {
    path: "pages/writing.html",
    name: "Writing page",
    group: "Pages",
    subtitle: "Blog index with category chips",
    width: 960,
    body: `
<div style="margin:-24px">
${headerBar}
<div style="max-width:672px;margin:0 auto;padding:0 24px">
  <div style="padding:56px 0 8px">
    <p class="label" style="margin:0 0 14px"><span class="idx">01/</span> Writing</p>
    <div class="display" style="font-size:34px">Field notes<span style="color:var(--moss)">.</span></div>
    <p class="muted" style="margin:12px 0 0">2 notes on infrastructure, Claude workflows, and things worth writing down.</p>
    <div class="row" style="gap:8px;margin:24px 0 8px">
      <span class="tag">claude</span>
      <span class="tag">docker</span>
    </div>
  </div>
  ${postRow("2026-07-02", "Running Claude Code in a real project", "What agentic coding actually feels like after a month of daily use.", "claude", "6")}
  ${postRow("2026-03-15", "Docker basics: a practical guide", "Containers, images, and the handful of commands you actually need day to day.", "docker", "4", false, true)}
</div>
${footerBar}
</div>`,
  },
  {
    path: "pages/blog-post.html",
    name: "Blog post page",
    group: "Pages",
    subtitle: "Article layout with prose",
    width: 960,
    body: `
<div style="margin:-24px">
${headerBar}
<div style="max-width:672px;margin:0 auto;padding:0 24px">
  <div style="padding:56px 0 0">
    <p class="mono muted" style="font-size:12px;margin:0 0 16px">&#8592; all posts</p>
    <div class="row" style="gap:12px">
      <span class="mono muted" style="font-size:12.5px">2026-03-15</span><span class="mono muted" style="font-size:11.5px">4 min</span>
      <span class="tag">docker</span>
    </div>
    <div class="display" style="font-size:34px;margin-top:14px">Docker basics: a practical guide</div>
    <p class="muted" style="font-size:17px;line-height:1.7;margin:16px 0 0">Containers, images, and the handful of commands you actually need day to day.</p>
    <hr style="border:none;border-top:1px solid var(--line);margin:32px 0">
  </div>
  ${proseBlock}
</div>
${footerBar}
</div>`,
  },
  {
    path: "pages/projects.html",
    name: "Projects page",
    group: "Pages",
    subtitle: "Featured cards + build-time GitHub list",
    width: 960,
    body: `
<div style="margin:-24px">
${headerBar}
<div style="max-width:880px;margin:0 auto;padding:0 32px">
  <div style="padding:56px 0 8px">
    <p class="label" style="margin:0 0 14px"><span class="idx">02/</span> Projects</p>
    <div class="display" style="font-size:34px">Ongoing development<span style="color:var(--moss)">.</span></div>
    <p class="muted" style="margin:12px 0 0;max-width:56ch">Things I'm actively building and maintaining. The GitHub list is generated from what actually moved recently.</p>
  </div>
  ${sectionLabel("a", "Featured")}
  <div class="row" style="align-items:stretch">
    ${focusCard("personal-infra &#8599;", "Self-hosted stack on a VPS — Traefik, Seafile, and GitHub Actions deployments.", '<span class="tag">docker</span><span class="tag">vps</span>')}
    ${focusCard("sushantgupta.cloud &#8599;", "This site — Next.js static export shipped through Docker and GHCR.", '<span class="tag">next.js</span><span class="tag tag-moss">live</span>')}
  </div>
  ${sectionLabel("b", "Recently pushed on GitHub")}
  <div style="display:grid;grid-template-columns:120px 1fr;gap:20px;padding:20px 0;border-top:1px solid var(--line)">
    <div class="mono muted" style="font-size:12.5px;padding-top:2px">2026-07-03</div>
    <div>
      <span class="mono" style="font-size:15px">Personal-Web-application &#8599;</span>
      <div class="row" style="gap:8px;margin-top:8px"><span class="tag">typescript</span><span class="mono muted" style="font-size:11.5px">&#9734; 1</span></div>
    </div></div>
  <div style="display:grid;grid-template-columns:120px 1fr;gap:20px;padding:20px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)">
    <div class="mono muted" style="font-size:12.5px;padding-top:2px">2026-03-04</div>
    <div>
      <span class="mono" style="font-size:15px">KnowThyCourse &#8599;</span>
      <p class="muted" style="margin:4px 0 8px;font-size:14.5px">Course Retrieval System</p>
      <div class="row" style="gap:8px"><span class="tag">jupyter notebook</span></div>
    </div></div>
  <p class="mono muted" style="font-size:11.5px;margin:24px 0 0">snapshot taken at build time · deploys refresh it</p>
</div>
${footerBar}
</div>`,
  },
  {
    path: "pages/videos.html",
    name: "Videos page",
    group: "Pages",
    subtitle: "Coming-soon state with planned series",
    width: 960,
    body: `
<div style="margin:-24px">
${headerBar}
<div style="max-width:880px;margin:0 auto;padding:0 32px">
  <div style="padding:56px 0 8px">
    <p class="label" style="margin:0 0 14px"><span class="idx">03/</span> Videos</p>
    <div class="display" style="font-size:34px">Watch the systems run<span style="color:var(--moss)">.</span></div>
    <p class="muted" style="margin:12px 0 0;max-width:56ch">The writing explains the systems — the videos will show them running, unedited where it counts.</p>
  </div>
  ${sectionLabel("a", "Planned series")}
  <div class="row" style="align-items:stretch">
    ${focusCard("Claude for coding", "Agentic workflows, Claude Code in real projects, and what changes when the terminal writes back.", '<span class="tag tag-moss">in production</span>')}
    ${focusCard("Claude for finance", "Investment reviews, portfolio tracking, and monthly reconciliation with an AI in the loop.", '<span class="tag tag-moss">in production</span>')}
    ${focusCard("Knowledge management", "Obsidian, structured vaults, and turning scattered notes into a system that compounds.", '<span class="tag tag-moss">in production</span>')}
  </div>
  <div style="border-top:1px solid var(--line);margin-top:40px;padding-top:32px">
    <p class="muted" style="margin:0 0 24px;max-width:52ch">First uploads are on the way. Subscribe now and they'll find you, or check the writing in the meantime.</p>
    <div class="row">
      <span class="btn btn-outline btn-mono">youtube &#8599;</span>
      <span class="btn btn-outline">Read the notes instead</span>
    </div>
  </div>
</div>
${footerBar}
</div>`,
  },
  {
    path: "pages/now.html",
    name: "Now page",
    group: "Pages",
    subtitle: "What has my attention, dated",
    width: 960,
    body: `
<div style="margin:-24px">
${headerBar}
<div style="max-width:672px;margin:0 auto;padding:0 24px">
  <div style="padding:56px 0 8px">
    <p class="label" style="margin:0 0 14px"><span class="idx">04/</span> Now</p>
    <div class="display" style="font-size:34px">What has my attention<span style="color:var(--moss)">.</span></div>
    <p class="mono muted" style="font-size:12.5px;margin:12px 0 0">updated 2026-07-07</p>
  </div>
  <div style="margin-top:24px">
    <div style="border-top:1px solid var(--line);padding:24px 0">
      <div class="display" style="font-size:21px">Building this site in public</div>
      <p class="muted" style="margin:8px 0 0">Field-notes redesign shipped; now wiring up videos, projects, and an RSS feed.</p>
    </div>
    <div style="border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:24px 0">
      <div class="display" style="font-size:21px">Writing about Claude workflows</div>
      <p class="muted" style="margin:8px 0 0">Coding, finance reviews, and knowledge management — one honest write-up per system.</p>
    </div>
  </div>
</div>
${footerBar}
</div>`,
  },
];

for (const card of cards) {
  const marker = `<!-- @dsCard name="${card.name}" group="${card.group}" subtitle="${card.subtitle}" width="${card.width}" -->`;
  const bodyOpen = card.dark
    ? `<body class="dark" style="background:var(--bg);color:var(--ink)">`
    : `<body>`;
  const html = `${marker}
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${card.name}</title>
${FONTS}
<style>${BASE_CSS}</style>
</head>
${bodyOpen}
${card.body.trim()}
</body>
</html>
`;
  const out = join(OUT, card.path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log("wrote", card.path);
}
