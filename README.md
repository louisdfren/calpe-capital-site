# Calpe Capital website — handover notes

Single-page static site. No CMS, no build step, no database. One HTML file, one stylesheet, one small JS file, plus the logo set.

## Folder

```
Website/
├── index.html        The whole site (hero, about, what we do, sectors, principles, contact)
├── README.md         this file
└── assets/
    ├── style.css     All styles (light cream theme, mobile responsive)
    ├── site.js       Sticky nav, scroll-reveal, mobile menu, hero parallax
    └── logos/        Calpe logo SVGs and PNGs
```

## Preview locally

Two ways:

1. Double-click `index.html` to open in your browser.
2. Run a small local server (cleaner — no `file://` quirks). In Terminal:

   ```bash
   cd "~/Desktop/Claude Projects/Calpe Capital/Website"
   python3 -m http.server 8000
   ```

   Then visit `http://localhost:8000`.

## Editing copy

Open `index.html` in TextEdit (plain-text mode), Cursor, or VS Code. Each section is clearly commented (`<!-- HERO -->`, `<!-- ABOUT -->`, etc.). The body of each sits inside its `<section>` block.

If you change the nav links, change them in both the desktop nav (`<ul class="nav-links">`) and the mobile nav (`<div class="mobile-nav">`).

## Editing colours and type

All theme colours live at the top of `assets/style.css` under `:root`. Change a hex value there and the whole site updates.

Type is loaded from Google Fonts (Cormorant Garamond + Inter). To swap the pairing, edit the `<link>` tag in `index.html`'s `<head>`.

## Deploying calpecapital.co.uk

You own the domain. Below are the steps for the recommended host (Cloudflare Pages — free, fast, SSL out of the box).

### 1. Sign up to Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com) and sign up with your Calpe email.
2. In the dashboard click **Create a project** → **Upload assets** (or **Direct Upload**, depending on the current UI).
3. Drag the entire `Website` folder into the upload area. Cloudflare will spin up a temporary `*.pages.dev` URL.
4. Visit the temporary URL on phone and desktop and check everything works.

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

### Alternative: Netlify

Same idea, different host. Go to [app.netlify.com/drop](https://app.netlify.com/drop), drag the `Website` folder onto the page, then add your custom domain in **Site settings → Domain management**. Same DNS routine at the registrar end.

## Pushing updates later

Whenever you edit `index.html` or the stylesheet:

1. Save the file.
2. Go back to your Cloudflare Pages project.
3. Drag the `Website` folder onto the project (or use the **Create new deployment** button).
4. Cloudflare swaps the live version over once the upload finishes.

If you'd rather not drag-and-drop each time, you can link a GitHub repo to the project and pushes deploy automatically — happy to set that up if you want.

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
