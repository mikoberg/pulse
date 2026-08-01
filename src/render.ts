import type { Decision } from "./decision.js";

// One decision (or none) becomes one page. No layout system to be pluggable.
export function renderPage(decision: Decision | null, generatedAt: Date): string {
  const body = decision
    ? `<p class="action">${linked(decision)}</p>
    <p class="reason">${escapeHtml(decision.reason)}</p>`
    : `<p class="action quiet">Nothing needs you today.</p>`;

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
  <title>Pulse</title>
  <style>
    :root { color-scheme: light dark; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: light-dark(#fafafa, #111);
      color: light-dark(#111, #eee);
      text-align: center;
      padding: 2rem;
    }
    .action {
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0;
    }
    .action.quiet {
      font-weight: 400;
      color: light-dark(#777, #999);
    }
    .action a {
      color: inherit;
      text-decoration: none;
      border-bottom: 2px solid currentColor;
    }
    .reason {
      font-size: 1rem;
      font-weight: 400;
      color: light-dark(#666, #aaa);
      margin: 0;
    }
    .timestamp {
      position: fixed;
      bottom: 1rem;
      font-size: 0.75rem;
      color: light-dark(#999, #666);
    }
  </style>
</head>
<body>
    ${body}
  <div class="timestamp">Checked at ${timestamp}</div>
</body>
</html>
`;
}

function linked(decision: Decision): string {
  const text = escapeHtml(decision.action);
  return decision.url ? `<a href="${escapeHtml(decision.url)}">${text}</a>` : text;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
