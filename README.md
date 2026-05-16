# Calpe Capital website — handover notes

Single-page static site, password-gated by a Cloudflare Worker that sits in front of the assets.

## Folder

```
Website/
├── public/
│   ├── index.html        The whole site (hero, about, what we do, sectors, principles, contact)
│   ├── index-anime-mock.html  anime.js mock fork — for reviewing motion changes
│   └── assets/
│       ├── style.css     All styles (light cream theme, mobile responsive)
│       ├── style-anime.css   anime.js mock additions
│       ├── site.js       Sticky nav, scroll-reveal, mobile menu, hero parallax
│       ├── site-anime.js anime.js mock orchestration
│       └── logos/        Calpe logo SVGs and PNGs
├── src/
│   └── worker.js         Password gate + login page (Cloudflare Worker)
├── wrangler.jsonc        Cloudflare deploy config
├── package.json          dev / deploy scripts
├── .dev.vars             local password (gitignored, do not commit)
├── .dev.vars.example     template — copy to .dev.vars
└── README.md             this file
```

## Password gate — how it works

Every request hits the worker first. If the cookie `cc_auth` matches the expected HMAC of the password, the static asset is served. Otherwise the request is redirected to `/login`, which shows a themed login page. Submitting the correct password sets a signed cookie (HttpOnly, Secure, SameSite=Lax, 30-day life). `/logout` clears it.

The password is read from `env.SITE_PASSWORD`. It is **not** in the source code, **not** in `wrangler.jsonc`. Local dev reads `.dev.vars`. Production reads a Cloudflare secret.

This is a soft gate, not enterprise auth. Anyone with the password gets in. No accounts, no audit log, no rate limit. Fit for a holding page; not fit for a deal room.

## Preview locally

You want the full thing — worker + gate + site — so use wrangler dev (not python http.server, which serves files raw without the password gate).

```bash
cd "~/Desktop/Claude Projects/Calpe Capital/Website"

# First time only — install wrangler
npm install

# Set a local password
cp .dev.vars.example .dev.vars
# Edit .dev.vars and change SITE_PASSWORD to whatever you like

# Run the dev server
npm run dev
```

Then visit `http://127.0.0.1:8787`. You'll see the login screen. Enter the password from `.dev.vars` — you're in.

To reset your local session: `http://127.0.0.1:8787/logout`.

## Editing copy

Open `index.html` in TextEdit (plain-text mode), Cursor, or VS Code. Each section is clearly commented (`<!-- HERO -->`, `<!-- ABOUT -->`, etc.). The body of each sits inside its `<section>` block.

If you change the nav links, change them in both the desktop nav (`<ul class="nav-links">`) and the mobile nav (`<div class="mobile-nav">`).

## Editing colours and type

All theme colours live at the top of `assets/style.css` under `:root`. Change a hex value there and the whole site updates.

Type is loaded from Google Fonts (Cormorant Garamond + Inter). To swap the pairing, edit the `<link>` tag in `index.html`'s `<head>`.

## Deploying calpecapital.co.uk

The site now deploys as a Cloudflare **Worker** (not a Pages drag-and-drop) because the password gate runs inside the worker. The flow is:

```bash
cd "~/Desktop/Claude Projects/Calpe Capital/Website"

# First time only
npx wrangler login

# Set the production password (you'll be prompted to type it)
npm run secret:set

# Deploy
npm run deploy
```

The first deploy gives you a `calpe-capital.<account>.workers.dev` URL. Visit it to confirm the gate works, then attach the custom domain below.

To change the password later: `npm run secret:set` again, then `npm run deploy`.

### 2. Point calpecapital.co.uk at it (Namecheap DNS steps)

In Cloudflare Pages, open the **Custom domains** tab and click **Set up a custom domain**. Add `calpecapital.co.uk` first. Cloudflare will tell you to add a CNAME record. It will look something like:

```
Type: CNAME
Name: @  (or calpecapital.co.uk)
Target: calpe-capital.pages.dev  (whatever Cloudflare gives you)
```

Then repeat for `www.calpecapital.co.uk` — same idea, with `Name: www`.

**At Namecheap:**

1. Log in to [namecheap.com](https://namecheap.com) and go to **Domain List**.
2. Click **Manage** next to `calpecapital.co.uk`.
3. Open the **Advanced DNS** tab.
4. Under **Host Records**, remove any existing default records (Namecheap usually adds a parking-page URL redirect — delete it).
5. Click **Add New Record** and create:
   - **Type:** CNAME Record, **Host:** `@`, **Value:** the `*.pages.dev` target Cloudflare gave you, **TTL:** Automatic.
   - **Type:** CNAME Record, **Host:** `www`, **Value:** same target, **TTL:** Automatic.
6. Save (the green tick on each row).
7. Back in Cloudflare Pages, click **Activate** / **Verify** on each custom domain. It will turn green once DNS propagates (10 to 30 minutes typically).

Cloudflare issues the SSL certificate automatically once it can see the DNS records.

If Namecheap rejects the CNAME at the apex (`@`) — some registrars don't allow CNAME at the root — use **ALIAS** or **URL Redirect** type instead, or follow the A-record fallback Cloudflare offers in the same panel.

## Pushing updates later

Edit the file(s), then:

```bash
npm run deploy
```

That's it. Cloudflare swaps to the new version in seconds. No drag-and-drop. To roll back, run `npx wrangler rollback`.

### Once the gate is gone

When you've finished rejigging and don't want the password gate any more, two options:

1. **Remove the gate, keep the worker** — empty `src/worker.js` so it always calls `env.ASSETS.fetch(request)`. Cheapest change.
2. **Remove the worker entirely** — delete `main` from `wrangler.jsonc`, delete the `binding` line under `assets`, delete `src/`. The site becomes pure static assets again.

Either way, run `npx wrangler secret delete SITE_PASSWORD` afterwards.

## Things to check before going live

1. Open every section on your phone. Tap the menu. Tap every link.
2. Click every nav anchor. Each one should scroll smoothly to the section.
3. Click the email and phone in the Contact card — confirm they open Mail and the dialler.
4. Read every line of copy on a fresh pair of eyes.
5. Decide whether the small "Calpe Capital · Registered in England and Wales · Co. No. 17193795" footer line is right (Companies House registered name and number).

## What it does not have

- A backend contact form. The contact section lists email and phone only — clean, no spam, no GDPR overhead.
- Photography. Visual texture is handled with type, gradients, and a subtle paper grain overlay.
- A blog. Easy to add later as a `/insights` section if it becomes useful.
