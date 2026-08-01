import type { Decision } from "./decision.js";

// One decision (or none), plus one permanent, judgment-free position line.
// No layout system — there is exactly one layout.
export function renderPage(decision: Decision | null, positionText: string, generatedAt: Date): string {
  const body = decision
    ? `<p class="action">${linked(decision)}</p>
    <p class="reason">${escapeHtml(decision.reason)}</p>`
    : `<p class="action quiet"><span class="dot" aria-hidden="true"></span>Nothing needs you today.</p>`;

  const timestamp = generatedAt.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
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
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.85rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      background: light-dark(#fafafa, #0b0b0c);
      color: light-dark(#151515, #ededed);
      text-align: center;
      padding: 2rem 1.5rem;
      -webkit-font-smoothing: antialiased;
    }
    .action {
      font-size: clamp(1.4rem, 5vw, 1.85rem);
      font-weight: 600;
      letter-spacing: -0.01em;
      line-height: 1.25;
      margin: 0;
      max-width: 30ch;
      animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .action.quiet {
      font-weight: 450;
      color: light-dark(#8a8a8a, #8f8f8f);
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
    }
    .dot {
      width: 0.4em;
      height: 0.4em;
      border-radius: 50%;
      background: light-dark(#b9d9b9, #4f7a4f);
      flex: none;
    }
    .action a {
      color: inherit;
      text-decoration: none;
      border-bottom: 2px solid light-dark(rgba(21,21,21,0.25), rgba(237,237,237,0.3));
      transition: border-color 0.15s ease;
    }
    .action a:hover, .action a:focus-visible {
      border-color: currentColor;
    }
    .reason {
      font-size: 1rem;
      font-weight: 400;
      color: light-dark(#6b6b6b, #a3a3a3);
      max-width: 34ch;
      margin: 0;
      animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both;
    }
    .chrome {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 1.1rem;
      display: flex;
      justify-content: center;
      gap: 0.6rem;
      font-size: 0.72rem;
      color: light-dark(#a8a8a8, #5c5c5c);
      letter-spacing: 0.01em;
      padding: 0 1rem;
    }
    .chrome .sep { opacity: 0.6; }
    @keyframes rise {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .action, .reason { animation: none; }
    }
  </style>
</head>
<body>
    ${body}
  <div class="chrome">
    <span>${escapeHtml(positionText)}</span>
    <span class="sep">·</span>
    <span>Checked at ${timestamp}</span>
  </div>
</body>
</html>
`;
}

function linked(decision: Decision): string {
  const text = escapeHtml(decision.action);
  return decision.url ? `<a href="${escapeHtml(decision.url)}">${text}</a>` : text;
}

function favicon(): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>` +
    `<circle cx='16' cy='16' r='6' fill='%23888'/></svg>`;
  return svg;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
