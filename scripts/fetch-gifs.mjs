/**
 * Build-time snapshot of GIFs.
 *
 * Note:
 * - GitHub Pages is static, and CORS makes scraping giphy.com unreliable.
 * - Instead of calling the GIPHY API or scraping the channel, we use an explicit
 *   list of GIF page URLs (provided by the user).
 */

import { writeFile } from "node:fs/promises";

// Hardcoded list: GIPHY GIF page URLs and/or direct media URLs (media*.giphy.com/media/<id>/…).
// Paste your GIPHY GIF URLs here to start a new set.
const GIF_PAGE_URLS = [
  "https://media4.giphy.com/media/LOm8TKmqLuFUanp4ng/200.gif",
  "https://media0.giphy.com/media/De9EKlbNcIF7dIjK0a/giphy.gif",
  "https://media2.giphy.com/media/MmU28izjksnufGLE9r/200.gif",
  "https://media3.giphy.com/media/h8lCtsBF7Q79Um8jbi/giphy.gif",
  "https://media3.giphy.com/media/2iJe7IpZI8017RwdvT/giphy.gif",
  "https://media1.giphy.com/media/57d6QbNkEwx5vq0xED/200.gif",
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

function idFromMediaUrl(pageUrl) {
  try {
    const u = new URL(pageUrl);
    if (!u.hostname.endsWith("giphy.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] !== "media" || !parts[1]) return null;
    const id = parts[1];
    return /^[A-Za-z0-9]+$/.test(id) ? id : null;
  } catch {
    return null;
  }
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
      const fromMedia = idFromMediaUrl(pageUrl);
      const id = fromMedia || idFromGifPageUrl(pageUrl);
      if (!id) return null;
      const base = mediaUrls(id);
      if (fromMedia) {
        return {
          id,
          pageUrl: `https://giphy.com/gifs/${id}`,
          title: "GIF",
          previewUrl: base.previewUrl,
          stillUrl: base.stillUrl,
          gifUrl: pageUrl,
        };
      }
      return {
        id,
        pageUrl,
        title: titleFromGifPageUrl(pageUrl),
        ...base,
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

