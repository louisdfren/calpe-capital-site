# Calpe Capital website

Single-page static site for Calpe Capital Limited, live and public at calpecapital.co.uk. A small Cloudflare Worker serves the files in `public/`. Rewritten 16/11/2026; the earlier version described a password gate that was removed on 27/07/2026.

## Folder

```
calpe-capital-website/
├── public/
│   ├── index.html        The whole site: hero, stats, about, partners, what we do,
│   │                     sectors, selected work, how we work, contact
│   ├── robots.txt, sitemap.xml, apple-touch-icon.png
│   └── assets/
│       ├── style.css     All styles. Later passes are appended at the foot.
│       ├── site.js       Sticky header state, mobile menu, anchor offset
│       ├── fonts.css     Self-hosted font declarations
│       ├── fonts/        Cormorant Garamond and Inter, variable woff2
│       ├── img/          Hero (the Rock), mist layers, share image, sector plates
│       ├── team/         Partner headshots
│       └── logos/        Logo SVGs and PNGs
├── src/worker.js         Serves public/; redirects the old /login and /logout home
├── wrangler.jsonc        Cloudflare Worker config (name: calpe-capital)
├── package.json          dev and deploy scripts
├── .github/workflows/deploy.yml   Deploys on every push to main
├── mocks/                Old motion experiment, not deployed
└── CLAUDE.md             Conventions for Claude sessions
```

`.dev.vars`, `.dev.vars.example` and the `secret:set` script are leftovers from the old password gate. The Worker no longer reads `SITE_PASSWORD`.

## Preview locally

The site is plain static files, so any static server works:

```bash
python3 -m http.server 8765 --directory public
```

Then open `http://localhost:8765`. To run it through the Worker as production does:

```bash
npm install
```

```bash
npm run dev
```

## Editing

Each section in `public/index.html` is marked with a comment (`<!-- HERO -->`, `<!-- ABOUT -->` and so on). If you change the nav links, change them in both the desktop nav (`<ul class="nav-links">`) and the mobile nav (`<div class="mobile-nav">`).

Theme colours live at the top of `assets/style.css` under `:root`. The brand reference is `Entities/Calpe Capital/Brand/brand-guidelines.md` in the Claude Projects folder. Fonts are self-hosted; never load them from Google.

This is public copy. British English, no em dashes, and no figure without a source.

## Deploying

Every push to `main` runs the GitHub Action, which runs `npx wrangler deploy` and publishes the Worker. It last ran green on 16/11/2026. Check the run before calling a deploy done:

```bash
gh run list --branch main --limit 1
```

Then confirm against the live site, not the push:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://calpecapital.co.uk/
```

A healthy result is 200. If the Action fails, the manual fallback is:

```bash
npm run deploy
```

To roll back:

```bash
npx wrangler rollback
```

DNS for calpecapital.co.uk is on Cloudflare. Dashboard-only jobs (API tokens, moving the custom domain) are done by Louis by hand.

## Open item

Draft PR #2 would move the site from the Worker to plain Cloudflare Pages. It is unmerged as of 16/11/2026. The site is already public, so the PR only changes the host.

## What it does not have

- A contact form. The contact section lists email, phone and office only.
- A blog.
