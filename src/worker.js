// Calpe Capital static site worker.
// The password gate was removed on 27/07/2026 when the site went public.
// Every request serves the static assets in ./public. The old /login and
// /logout paths redirect home so bookmarked links do not 404, and the
// permissive robots.txt in public/ now serves as-is.

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/login' || pathname === '/logout') {
      return new Response(null, { status: 301, headers: { 'Location': '/' } });
    }
    return env.ASSETS.fetch(request);
  }
};
