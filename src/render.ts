import type { Decision } from "./decision.js";
import type { HorizonFact } from "./horizon.js";

export function renderPage(
  decision: Decision | null,
  horizon: HorizonFact[],
  dayLabel: string,
  generatedAt: Date
): string {
  const decisionBlock = decision
    ? `<div class="decision">${wrapIfLinked(decision)}</div>`
    : `<div class="decision">
      <p class="action quiet"><span class="dot" aria-hidden="true"></span>Nothing needs you today.</p>
    </div>`;

  const horizonBlock = horizon.length
    ? `<div class="horizon">
      ${horizon.map((h, i) => horizonItem(h, i)).join("\n      ")}
    </div>`
    : "";

  const time = generatedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="description" content="Pulse — one decision, or nothing." />
  <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#0b0b0c" media="(prefers-color-scheme: dark)" />
  <link rel="icon" href="data:image/svg+xml,${favicon()}" />
  <title>Pulse</title>
  <style>
    :root { color-scheme: light dark; }
    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      background: light-dark(#fafafa, #0b0b0c);
      color: light-dark(#151515, #ededed);
      text-align: center;
      padding: 6rem 1.5rem 4.5rem;
      -webkit-font-smoothing: antialiased;
    }

    .decision {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      max-width: 32ch;
    }
    .action {
      font-size: clamp(1.5rem, 6vw, 2.1rem);
      font-weight: 600;
      letter-spacing: -0.015em;
      line-height: 1.25;
      margin: 0;
      animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .action.quiet {
      font-weight: 450;
      color: light-dark(#8a8a8a, #8f8f8f);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.55rem;
    }
    .dot {
      width: 0.4em;
      height: 0.4em;
      border-radius: 50%;
      background: light-dark(#b9d9b9, #4f7a4f);
      flex: none;
    }
    .reason {
      font-size: clamp(0.95rem, 3vw, 1.05rem);
      font-weight: 400;
      color: light-dark(#6b6b6b, #a3a3a3);
      line-height: 1.5;
      margin: 0;
      animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.06s both;
    }
    a.decision-link {
      color: inherit;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      border-radius: 0.5rem;
      transition: opacity 0.15s ease;
    }
    a.decision-link:hover, a.decision-link:focus-visible {
      opacity: 0.72;
    }

    .horizon {
      margin-top: 3rem;
      display: flex;
      flex-direction: column;
      gap: 1.3rem;
      animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both;
    }
    .horizon-item {
      display: block;
      color: inherit;
      text-decoration: none;
    }
    .horizon-title {
      font-size: clamp(0.98rem, 3.2vw, 1.1rem);
      font-weight: 550;
      letter-spacing: -0.005em;
      line-height: 1.4;
    }
    .horizon-when {
      font-size: 0.85rem;
      font-weight: 400;
      color: light-dark(#8f8f8f, #7d7d7d);
      margin-top: 0.15rem;
    }
    a.horizon-item {
      transition: opacity 0.15s ease;
    }
    a.horizon-item:hover, a.horizon-item:focus-visible {
      opacity: 0.72;
    }

    .footer {
      position: fixed;
      left: 0;
      right: 0;
      bottom: calc(1.1rem + env(safe-area-inset-bottom, 0px));
      display: flex;
      justify-content: center;
      gap: 0.55rem;
      font-size: 0.72rem;
      color: light-dark(#a8a8a8, #5c5c5c);
      letter-spacing: 0.01em;
      padding: 0 1rem;
    }
    .footer .sep { opacity: 0.6; }

    @keyframes rise {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .action, .reason, .horizon { animation: none; }
    }
    @media (max-width: 420px) {
      body { padding: 5rem 1.25rem 4rem; }
      .horizon { margin-top: 2.25rem; gap: 1.1rem; }
    }
  </style>
</head>
<body>
    ${decisionBlock}
    ${horizonBlock}
  <div class="footer">
    <span>${escapeHtml(dayLabel)}</span>
    <span class="sep">·</span>
    <span>Checked ${time}</span>
  </div>
</body>
</html>
`;
}

function wrapIfLinked(decision: Decision): string {
  const inner = `<p class="action">${escapeHtml(decision.action)}</p>
      <p class="reason">${escapeHtml(decision.reason)}</p>`;
  if (!decision.url) return inner;
  return `<a class="decision-link" href="${escapeHtml(decision.url)}">${inner}</a>`;
}

function horizonItem(fact: HorizonFact, index: number): string {
  const delay = 0.12 + index * 0.05;
  const inner = `<div class="horizon-title" style="animation-delay:${delay}s">${escapeHtml(fact.title)}</div>
        <div class="horizon-when">${escapeHtml(fact.when)}</div>`;
  return fact.url
    ? `<a class="horizon-item" href="${escapeHtml(fact.url)}">${inner}</a>`
    : `<div class="horizon-item">${inner}</div>`;
}

function favicon(): string {
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='6' fill='%23888'/></svg>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
