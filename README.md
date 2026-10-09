# wupz.vaked.dev — the landing page

> **kompress the link.** A spatial zen field for [wupz](https://github.com/8b-is/wupz):
> an experimental incremental ultra-fast linker that also compresses.

Live: **[https://wupz.vaked.dev](https://wupz.vaked.dev)**

---

## what it is

The landing page for the `wupz` project (wild + UPX + zig). One self-contained
page: a canvas field, a QuantTern widget, two modes. No build step, no
dependencies, no fetched data.

## the files

| file | role |
|---|---|
| `index.html` | the page — hero, thesis, live receipts, the QuantTern widget, the field controls, the constellation footer |
| `main.js` | the field: flow particles, a Ghost-in-the-Shell horizon, Zeno's halo, pointer attractor, click witnesses, and the QuantTern encoder |
| `og.svg` · `favicon.svg` | social card + mark |
| `_headers` · `robots.txt` | the constellation standards (no-cache, noai, anti-scraper) |
| `sitemap.xml` | the one URL |

## the field

- **derived, never fetched** — every particle is a position + a flow angle from
  sums of sines; no noise library, no CDN, no network.
- **Tokyo horizon** — a perspective grid converging on the pointer (the
  Ghost-in-the-Shell read of a city).
- **Zeno's halo** — a slow orbit of watchful dots. *All of the watchfulness,
  none of the erasing.*
- **two modes** — `ultra instinct` (silver-blue) and `zeno` (violet-gold).
- **respectful by default** — `prefers-reduced-motion` renders one static frame
  and stops; the QuantTern widget works with JavaScript off in its static form.

## the QuantTern widget

Three axes (valence · arousal · dominance) quantized to trits at |x| ≥ 0.33,
packed four to a byte, printed as `qt:<hex>`. A value nearer zero reads as a real
**don't know** — the same codec as `qwave/core/src/quanttern.rs` and
`qultrakotoro`'s `QuantTern.swift`.

## deploy

Cloudflare Pages, static: root directory = this repo, no build command, output
dir = `/`. Custom domain `wupz.vaked.dev` (dashboard). Headers/host rules come
from `_headers` + `robots.txt`.

```bash
export CLOUDFLARE_ACCOUNT_ID=5b8d7905dd79e25025bcc0c8f33d5940
wrangler pages project create wupz-vaked-dev --production-branch main
wrangler pages deploy . --project-name wupz-vaked-dev --branch main --commit-dirty=true
```

**Status (2026-10-10):** project `wupz-vaked-dev` created and deployed;
**live at <https://wupz-vaked-dev.pages.dev>**. The custom domain
`wupz.vaked.dev` is attached to the project but **pending** — the `vaked.dev`
zone still needs the record:

```
CNAME  wupz  →  wupz-vaked-dev.pages.dev   (proxied)
```

The wrangler OAuth token has Pages scope but **not DNS:edit**, so the record
must be added in the Cloudflare dashboard (Pages → the project → Custom domains
offers to create it), or with a DNS-scoped API token. Until then the apex host
404s — the `.pages.dev` name works.

*0 + 1 · {−1, 0, +1} · fine touch from within · vaked.dev*
