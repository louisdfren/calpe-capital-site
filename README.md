# Calpe Capital website — handover notes

Single-page static site, hosted on **Cloudflare Pages**. No build step, no
backend, no password gate — the `public/` folder is served as-is.

## Folder

```
calpe-capital-website/
├── public/                 Everything that goes live (this dir is deployed)
│   ├── index.html          The whole site (hero, stats, about, partners, what we do, sectors, principles, contact)
│   ├── robots.txt          Permissive — allows indexing
│   ├── sitemap.xml         Single-page sitemap
│   ├── apple-touch-icon.png
│   └── assets/
│       ├── style.css       All styles (light cream theme, mobile responsive)
│       ├── site.js         Sticky nav, scroll-reveal, hero word-stagger, mobile menu, parallax
│       ├── fonts.css       Self-hosted variable fonts (Cormorant Garamond + Inter)
│       ├── fonts/          The woff2 files
│       ├── img/            Generated brand imagery (Higgsfield AI, June 2026)
│       │   ├── hero-calpe.jpg        Hero — Mons Calpe rising from sea mist
│       │   ├── og-calpe.jpg          1200×630 link-share image (og:image)
│       │   └── sector-*.jpg          Sector card plates (roadside / hospitality / mixed-use)
│       └── logos/          Calpe logo SVGs and PNGs
├── mocks/                  Old anime.js motion experiment (not deployed)
├── .github/workflows/
│   └── deploy.yml          Auto-deploy to Cloudflare Pages on push to main
└── README.md              this file
```

## Preview locally

Pure static files, so any static server works:

```bash
cd ~/Code/calpe-capital-website/public
python3 -m http.server 8000
```

Then visit `http://127.0.0.1:8000`.

## Editing copy

Open `public/index.html` in Cursor or VS Code. Each section is clearly
commented (`<!-- HERO -->`, `<!-- ABOUT -->`, etc.). The body of each sits
inside its `<section>` block.

If you change the nav links, change them in both the desktop nav
(`<ul class="nav-links">`) and the mobile nav (`<div class="mobile-nav">`).

## Editing colours and type

All theme colours live at the top of `public/assets/style.css` under `:root`.
Change a hex value there and the whole site updates.

Type is self-hosted (Cormorant Garamond + Inter variable woff2, latin subset)
in `public/assets/fonts/`, declared in `public/assets/fonts.css`. To swap the
pairing, replace the woff2 files and update `fonts.css`.

## Deploying calpecapital.co.uk

Hosting is **Cloudflare Pages**, project `calpe-capital-site`. Every push to
`main` triggers `.github/workflows/deploy.yml`, which runs
`wrangler pages deploy public` and publishes the `public/` folder. No manual
step, no drag-and-drop.

The workflow needs two repo secrets:

- `CLOUDFLARE_API_TOKEN` — a scoped token with **Cloudflare Pages: Edit**.
- `CLOUDFLARE_ACCOUNT_ID` — `d4df51783b85b94b0a9815cc51069ceb`.

The custom domain `calpecapital.co.uk` is attached to the Pages project under
**Custom domains** in the Cloudflare dashboard.

To deploy by hand if needed:

```bash
npx wrangler@4 pages deploy public --project-name calpe-capital-site
```

To roll back, redeploy a previous commit, or use the **Deployments** tab of the
Pages project in the dashboard.

## Things to check before going live

1. Open every section on your phone. Tap the menu. Tap every link.
2. Click every nav anchor. Each one should scroll smoothly to the section.
3. Click the email and phone in the Contact card — confirm they open Mail and the dialler.
4. Read every line of copy with a fresh pair of eyes.
5. Decide whether the small "Calpe Capital · Registered in England and Wales · Co. No. 17193795" footer line is right (Companies House registered name and number).

## What it does not have

- A password gate. The site is public.
- A backend contact form. The contact section lists email and phone only.
- A blog. Easy to add later as a `/insights` section if it becomes useful.
