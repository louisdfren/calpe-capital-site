// Calpe Capital — password-gate worker.
// Sits in front of the static site. One password (env.SITE_PASSWORD) gates
// every asset. Successful login sets a signed cookie for 30 days.
//
// To set the password locally:    create .dev.vars with SITE_PASSWORD=...
// To set the password in prod:    wrangler secret put SITE_PASSWORD
// To clear your own session:      visit /logout

const COOKIE_NAME = 'cc_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const SESSION_MESSAGE = 'calpe-auth-v1';   // any constant string; HMAC'd

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const password = env.SITE_PASSWORD;

    if (!password) {
      return new Response(setupHtml(), {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const expected = await hmacHex(SESSION_MESSAGE, password);

    // Logout — clears the cookie and bounces back to /login.
    if (pathname === '/logout') {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/login',
          'Set-Cookie': `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
        }
      });
    }

    // POST /login — verify password.
    if (pathname === '/login' && request.method === 'POST') {
      let submitted = '';
      try {
        const form = await request.formData();
        submitted = (form.get('password') || '').toString();
      } catch (_) { /* ignore */ }

      if (submitted && constantTimeEqual(submitted, password)) {
        return new Response(null, {
          status: 302,
          headers: {
            'Location': '/',
            'Set-Cookie': `${COOKIE_NAME}=${expected}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`
          }
        });
      }

      return new Response(loginHtml({ error: true }), {
        status: 401,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // GET /login — show the form.
    if (pathname === '/login') {
      // If already authed, just bounce home.
      if (cookieEquals(request, COOKIE_NAME, expected)) {
        return new Response(null, { status: 302, headers: { 'Location': '/' } });
      }
      return new Response(loginHtml({}), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Allow the brand favicon through unauthed so it shows on the login tab.
    if (pathname === '/assets/logos/calpe-capital-icon.svg' || pathname === '/favicon.ico') {
      return env.ASSETS.fetch(request);
    }

    // Any other request — must be authed.
    if (cookieEquals(request, COOKIE_NAME, expected)) {
      return env.ASSETS.fetch(request);
    }

    return new Response(null, {
      status: 302,
      headers: { 'Location': '/login' }
    });
  }
};

/* ---------- crypto helpers ---------- */

async function hmacHex(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function cookieEquals(request, name, expected) {
  const header = request.headers.get('Cookie') || '';
  const pairs = header.split(';').map(s => s.trim());
  for (const p of pairs) {
    const eq = p.indexOf('=');
    if (eq === -1) continue;
    if (p.slice(0, eq) === name) return constantTimeEqual(p.slice(eq + 1), expected);
  }
  return false;
}

/* ---------- login page (inline HTML, no external deps) ---------- */

function loginHtml({ error = false } = {}) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#F4EEE2">
<title>Calpe Capital — private access</title>
<link rel="icon" href="/assets/logos/calpe-capital-icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --cream:   #F4EEE2;
    --cream-2: #ECE5D5;
    --ink:     #1C1916;
    --ink-2:   #4D453B;
    --mute:    #8A7F72;
    --accent:  #A06F1F;
    --hair:    rgba(28,25,22,0.12);
    --warn:    #9B3F2E;
  }
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; }
  body {
    background: var(--cream);
    color: var(--ink);
    font-family: 'Inter', -apple-system, system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.55;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 20px;
    -webkit-font-smoothing: antialiased;
    font-variant-numeric: lining-nums tabular-nums;
  }
  .grain {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    opacity: 0.45;
    mix-blend-mode: multiply;
    background-image:
      radial-gradient(rgba(28,25,22,0.05) 1px, transparent 1px),
      radial-gradient(rgba(28,25,22,0.04) 1px, transparent 1px);
    background-size: 3px 3px, 7px 7px;
    background-position: 0 0, 1px 1px;
  }
  .card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 420px;
    text-align: center;
  }
  .mark {
    width: 64px; height: 64px; margin: 0 auto 18px;
    color: var(--ink);
  }
  .mark svg { width: 100%; height: 100%; display: block; }
  .wordmark {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 22px;
    letter-spacing: 0.04em;
    color: var(--ink);
    margin: 0 0 36px;
  }
  .wordmark .italic {
    font-style: italic;
    color: var(--accent);
    margin-left: 4px;
  }
  .eyebrow {
    font-size: 11px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--mute);
    margin: 0 0 10px;
  }
  h1 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 400;
    font-size: 38px;
    line-height: 1.05;
    letter-spacing: -0.01em;
    margin: 0 0 28px;
  }
  h1 .italic { font-style: italic; color: var(--accent); }
  form { margin: 0; }
  .field {
    position: relative;
    margin: 0 0 14px;
  }
  input[type="password"] {
    width: 100%;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--hair);
    color: var(--ink);
    font: inherit;
    font-size: 16px;
    padding: 14px 4px;
    text-align: center;
    letter-spacing: 0.06em;
    outline: none;
    transition: border-color 0.2s ease;
  }
  input[type="password"]::placeholder {
    color: var(--mute);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-size: 11px;
  }
  input[type="password"]:focus { border-bottom-color: var(--ink); }
  button {
    width: 100%;
    margin-top: 10px;
    background: var(--ink);
    color: var(--cream);
    border: 0;
    border-radius: 999px;
    padding: 14px 22px;
    font: inherit;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
  }
  button:hover { background: #000; }
  button:active { transform: translateY(1px); }
  .error {
    margin: 14px 0 0;
    font-size: 12px;
    color: var(--warn);
    letter-spacing: 0.02em;
  }
  .meta {
    margin: 36px 0 0;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .meta a { color: var(--ink); text-decoration: none; border-bottom: 1px solid var(--hair); }
  .meta a:hover { border-bottom-color: var(--ink); }
</style>
</head>
<body>
<div class="grain" aria-hidden="true"></div>
<main class="card">
  <div class="mark" aria-hidden="true">
    <svg viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <rect x="56" y="184" width="56" height="14"/>
      <rect x="61" y="172" width="46" height="12"/>
      <rect x="68" y="52"  width="32" height="120"/>
      <rect x="66" y="46"  width="36" height="6"/>
      <rect x="61" y="39"  width="46" height="7"/>
      <rect x="56" y="30"  width="56" height="9"/>
      <rect x="166" y="184" width="56" height="14"/>
      <rect x="171" y="172" width="46" height="12"/>
      <rect x="178" y="52"  width="32" height="120"/>
      <rect x="176" y="46"  width="36" height="6"/>
      <rect x="171" y="39"  width="46" height="7"/>
      <rect x="166" y="30"  width="56" height="9"/>
      <line x1="112" y1="148" x2="166" y2="148" stroke="#A06F1F" stroke-width="2.5"/>
      <circle cx="139" cy="148" r="4.5" fill="#A06F1F"/>
    </svg>
  </div>
  <p class="wordmark">Calpe<span class="italic">Capital</span></p>
  <p class="eyebrow">Private access</p>
  <h1>By <span class="italic">invitation</span>.</h1>
  <form method="POST" action="/login" novalidate>
    <div class="field">
      <input
        type="password"
        name="password"
        placeholder="Access code"
        autocomplete="current-password"
        autofocus
        required
      />
    </div>
    <button type="submit">Enter</button>
    ${error ? '<p class="error" role="alert">Wrong code. Try again.</p>' : ''}
  </form>
  <p class="meta">No code? <a href="mailto:louis@calpecapital.co.uk">Get in touch</a></p>
</main>
</body>
</html>`;
}

/* ---------- setup page when SITE_PASSWORD is missing ---------- */

function setupHtml() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Calpe Capital — setup required</title>
<style>
  body { font: 15px/1.6 -apple-system, system-ui, sans-serif; max-width: 640px; margin: 80px auto; padding: 0 24px; color: #1C1916; background: #F4EEE2; }
  h1 { font-weight: 500; }
  code { background: #ECE5D5; padding: 2px 6px; border-radius: 3px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
  pre { background: #1C1916; color: #F4EEE2; padding: 16px; border-radius: 4px; overflow-x: auto; }
</style>
</head>
<body>
<h1>Setup required</h1>
<p>The site password gate is enabled but <code>SITE_PASSWORD</code> isn't set.</p>
<h3>Local development</h3>
<p>Create <code>.dev.vars</code> in the project root with:</p>
<pre>SITE_PASSWORD=your-chosen-password</pre>
<h3>Production</h3>
<pre>wrangler secret put SITE_PASSWORD</pre>
<p>You'll be prompted for the value. Run <code>wrangler deploy</code> afterwards.</p>
</body>
</html>`;
}
