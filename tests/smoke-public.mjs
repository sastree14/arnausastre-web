import { spawn } from "node:child_process";
import assert from "node:assert/strict";
const base = "http://127.0.0.1:3017";
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3017",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let logs = "";
server.stdout.on("data", (chunk) => (logs += chunk));
server.stderr.on("data", (chunk) => (logs += chunk));
async function get(path, options = {}) {
  return fetch(base + path, {
    headers: { "User-Agent": "Googlebot" },
    ...options,
  });
}
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      const r = await get("/es");
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, "Production server did not become ready");
  const pages = [
    "",
    "/services",
    "/services/demand-forecasting",
    "/services/data-engineering",
    "/projects",
    "/projects/ecommerce-demand-forecasting",
    "/projects/ecommerce-demand-forecasting/case-study",
    "/knowledge",
    "/about",
    "/partner-analitico",
    "/contact",
    "/privacy",
    "/legal",
  ];
  for (const lang of ["es", "ca", "en"])
    for (const path of pages) {
      const response = await get("/" + lang + path);
      assert.equal(response.status, 200, `${lang}${path}`);
      const html = await response.text();
      assert.ok(
        html.includes(`<html lang="${lang}"`),
        `${lang}${path}: HTML language`,
      );
      assert.ok(
        html.includes(`href="https://www.sc-analytics.io/${lang}${path}"`),
        `${lang}${path}: canonical`,
      );
      assert.ok(html.includes("<h1"), `${lang}${path}: primary heading`);
      assert.ok(
        !html.includes("https://www.googletagmanager.com/gtag/js"),
        `${lang}${path}: analytics loaded without consent`,
      );
    }
  const legacy = await get("/services", { redirect: "manual" });
  assert.equal(legacy.status, 308);
  assert.ok(legacy.headers.get("location").endsWith("/es/services"));
  assert.equal((await get("/es/not-a-real-page")).status, 404);
  assert.equal((await get("/es/services/not-a-real-service")).status, 404);
  const sitemap = await get("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  assert.ok(
    urls.some((url) =>
      url.endsWith("/es/projects/ecommerce-demand-forecasting/case-study"),
    ),
  );
  assert.ok(
    urls.every((url) => url.startsWith("https://www.sc-analytics.io/")),
  );
  // Check every canonical in the generated sitemap against the running production server.
  let count = 0;
  for (let index = 0; index < urls.length; index += 8) {
    await Promise.all(
      urls.slice(index, index + 8).map(async (url) => {
        const path = new URL(url).pathname;
        const response = await get(path);
        assert.equal(response.status, 200, `Sitemap route: ${path}`);
        count++;
      }),
    );
  }
  const article =
    "/knowledge/why-inventory-visibility-is-not-inventory-control-and-what-that-costs/es";
  const html = await (await get(article)).text();
  assert.ok(html.includes("<strong>"));
  assert.ok(!html.includes("15–30%"));
  for (const lang of ["es", "ca", "en"]) {
    const image = await get(`/api/og?lang=${lang}`);
    assert.equal(image.status, 200);
    assert.ok(image.headers.get("content-type").includes("image/png"));
  }
  for (const body of [
    null,
    { name: 42, email: "invalid", message: "test" },
    {
      name: "Test",
      email: "test@example.org",
      message: "Test",
      website: "filled",
    },
  ]) {
    const r = await get("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: base },
      body: JSON.stringify(body),
    });
    assert.equal(r.status, 400);
  }
  console.log(
    `PASS: 39 localized page contracts, ${count} sitemap URLs, redirects, 404s, Markdown, 3 OG images and invalid contact requests. No valid enquiry sent.`,
  );
} catch (error) {
  console.error(error.message);
  console.error(logs.slice(-2000));
  process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
}
