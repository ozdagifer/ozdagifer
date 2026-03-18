/**
 * Build-time snapshot of GIFs.
 *
 * Note:
 * - GitHub Pages is static, and CORS makes scraping giphy.com unreliable.
 * - Instead of calling the GIPHY API or scraping the channel, we use an explicit
 *   list of GIF page URLs (provided by the user).
 */

import { writeFile } from "node:fs/promises";

// Hardcoded list: GIF page URLs to show on the site.
const GIF_PAGE_URLS = [
  "https://giphy.com/gifs/speed-oh-my-god-ishowspeed-1MfLI2gGVWnnbtF6vY",
  "https://giphy.com/gifs/lior-sorin-hold-on-lemme-read-it-let-me-Ckt3O6IraLCqm89ts8",
  "https://giphy.com/gifs/excited-spongebob-i-want-this-ajSYYvOLFIDLfSYRVu",
  "https://giphy.com/gifs/mmm-old-lady-you-sure-kjWtPiTfkg26BwJ5vL",
  "https://giphy.com/gifs/diva-girly-girl-as-you-should-YwoMab1xWp5CfkRAg0",
  "https://giphy.com/gifs/girly-girl-mayagifs-yourgirlmaya-e5ucls4LRi7MmAC4wQ",
];

function cleanUrl(raw) {
  return raw
    .trim()
    .replace(/&amp;/g, "&")
    .replace(/[?#].*$/, "")
    .replace(/[),.]+$/, "");
}

function uniqueKeepOrder(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    if (!seen.has(it)) {
      seen.add(it);
      out.push(it);
    }
  }
  return out;
}

function idFromGifPageUrl(pageUrl) {
  try {
    const u = new URL(pageUrl);
    const last = u.pathname.split("/").filter(Boolean).at(-1) || "";
    const dash = last.lastIndexOf("-");
    const id = dash >= 0 ? last.slice(dash + 1) : last;
    return /^[A-Za-z0-9]+$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

function titleFromGifPageUrl(pageUrl) {
  try {
    const u = new URL(pageUrl);
    const last = u.pathname.split("/").filter(Boolean).at(-1) || "";
    const dash = last.lastIndexOf("-");
    const slug = dash > 0 ? last.slice(0, dash) : last;
    const t = slug.replace(/-/g, " ").replace(/\s+/g, " ").trim();
    return t || "GIF";
  } catch {
    return "GIF";
  }
}

function mediaUrls(id) {
  // Use media.giphy.com canonical host (redirects as needed).
  return {
    previewUrl: `https://media.giphy.com/media/${id}/giphy_s.gif`,
    gifUrl: `https://media.giphy.com/media/${id}/giphy.gif`,
    stillUrl: `https://media.giphy.com/media/${id}/200.gif`,
  };
}

async function main() {
  const pageUrls = uniqueKeepOrder(GIF_PAGE_URLS.map(cleanUrl));

  const gifs = pageUrls
    .map((pageUrl) => {
      const id = idFromGifPageUrl(pageUrl);
      if (!id) return null;
      return {
        id,
        pageUrl,
        title: titleFromGifPageUrl(pageUrl),
        ...mediaUrls(id),
      };
    })
    .filter(Boolean);

  const out = {
    source: "hardcoded GIF_PAGE_URLS (provided by user)",
    builtAt: new Date().toISOString(),
    count: gifs.length,
    gifs,
  };

  await writeFile(new URL("../data/gifs.json", import.meta.url), JSON.stringify(out, null, 2));
  console.log(`Wrote data/gifs.json with ${gifs.length} GIFs.`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

