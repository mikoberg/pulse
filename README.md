# Pulse (v0)

The smallest possible Pulse. It proves one hypothesis:

**People prefer one trustworthy decision over ten pieces of information.**

There are exactly four signals. Each one either produces a single imperative
sentence — a decision — or produces nothing at all. There is no plugin
system, no widget interface, no layout engine, no configuration beyond the
values these four signals actually need. Silence is the expected, common
output. That's the product being tested, not a placeholder for a bigger one.

## The four signals

| Signal | Decision it can produce | Stays silent when |
|---|---|---|
| Calendar | `Leave in 20 minutes.` | Nothing starts within 24h |
| GitHub Actions | `Fix deployment first.` | Latest run on the branch isn't failing |
| Weather | `Take a jacket — rain likely.` | Nothing unusual about today |
| Confirmed launches | `Reserve Thursday for Samsung Galaxy Unpacked.` | Nothing confirmed within 7 days |

If none of the four have anything to say, the page says exactly one thing:
**"Nothing needs you today."**

## Run it

```bash
npm install
cp .env.example .env   # fill in your calendar ICS URL, GitHub repo, coordinates
npm run build
```

Output is a single static file: `dist/index.html`. Open it, or deploy it
anywhere that serves static files (GitHub Pages, Netlify, Cloudflare Pages).
There's no server, no database, no build step beyond this one script.

To add or change a confirmed launch date, edit the short list at the bottom
of `src/config.ts` directly — it's not a data source, it's three lines you
type in by hand.

## What's deliberately not here

No third-party widgets, no plugin registry, no config schema library, no
layout options, no caching layer, no `Widget<T>` interface. Every one of
those is real, useful architecture for a mature platform — and every one of
them was left out on purpose, because none of them is needed to test whether
four honest decisions beat a page full of information. If the hypothesis
holds, the platform gets built next. If it doesn't, the platform would have
been the wrong thing to build first.
