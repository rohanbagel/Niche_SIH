/**
 * Cloudflare Worker — SIH Reverse Proxy
 * 
 * Routes requests from GitHub Actions (US datacenter) through
 * Cloudflare's Indian edge servers (Mumbai/Delhi/Chennai/Bangalore)
 * to bypass Azure WAF geo-blocking on sih.gov.in.
 * 
 * Protected by a shared secret token so only our scraper can use it.
 */

export default {
  async fetch(request, env) {
    // 1. Validate the secret auth token
    const authHeader = request.headers.get("X-Proxy-Secret");
    if (!authHeader || authHeader !== env.PROXY_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. First visit the homepage to get session cookies (just like a real browser)
    const homeResponse = await fetch("https://sih.gov.in/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    // Extract Set-Cookie headers from homepage
    const cookies = homeResponse.headers.getAll("Set-Cookie")
      .map(c => c.split(";")[0])
      .join("; ");

    // 3. Fetch the actual PS page with the session cookies
    const targetUrl = "https://sih.gov.in/sih2026PS";
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://sih.gov.in/",
        "Cookie": cookies,
      },
    });

    // 4. Return the HTML back to the caller (GitHub Actions scraper)
    const html = await response.text();

    return new Response(html, {
      status: response.status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Original-Status": String(response.status),
        "X-HTML-Length": String(html.length),
      },
    });
  },
};
