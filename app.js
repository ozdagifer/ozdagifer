/* MarshyPasture — simple work grid */

const $ = (sel, root = document) => root.querySelector(sel);

function titleFromPageUrl(pageUrl) {
  try {
    const u = new URL(pageUrl);
    const parts = u.pathname.split("/").filter(Boolean);
    const gifsIdx = parts.indexOf("gifs");
    const slugAndId = gifsIdx >= 0 ? parts[gifsIdx + 1] : parts.at(-1);
    if (!slugAndId) return "GIF";
    const dash = slugAndId.lastIndexOf("-");
    const slug = dash > 0 ? slugAndId.slice(0, dash) : slugAndId;
    const t = slug.replace(/-/g, " ").replace(/\s+/g, " ").trim();
    return t ? t : "GIF";
  } catch {
    return "GIF";
  }
}

function renderGallery(gifs) {
  const gallery = $("#gallery");
  gallery.innerHTML = "";

  if (!gifs.length) {
    const p = document.createElement("p");
    p.className = "work__empty";
    p.textContent = "No GIFs here yet.";
    gallery.append(p);
    return;
  }

  const frag = document.createDocumentFragment();
  for (const gif of gifs) {
    const a = document.createElement("a");
    a.className = "work__item";
    a.href = gif.pageUrl;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.setAttribute("aria-label", `View on GIPHY: ${gif.title}`);

    const img = document.createElement("img");
    img.className = "work__img";
    img.loading = "lazy";
    img.alt = gif.title;
    img.src = gif.previewUrl;
    img.addEventListener("error", () => {
      const fallbacks = [gif.stillUrl, gif.gifUrl];
      const next = fallbacks.find((u) => u && u !== img.src);
      if (next) img.src = next;
    });

    a.append(img);
    frag.append(a);
  }
  gallery.append(frag);
}

async function loadGifs() {
  const errorEl = $("#error");
  errorEl.hidden = true;

  try {
    const res = await fetch("./data/gifs.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load gifs.json (${res.status})`);
    const data = await res.json();
    const items = Array.isArray(data?.gifs) ? data.gifs : [];
    const gifs = items.map((g) => ({
      id: String(g.id),
      pageUrl: String(g.pageUrl),
      title: g.title ? String(g.title) : titleFromPageUrl(String(g.pageUrl)),
      gifUrl: String(g.gifUrl),
      previewUrl: String(g.previewUrl),
      stillUrl: String(g.stillUrl || ""),
    }));
    renderGallery(gifs);
  } catch (e) {
    errorEl.hidden = false;
    errorEl.textContent =
      "Couldn’t load the gallery. If you just cloned this repo, run npm run fetch to build data/gifs.json.";
    console.error(e);
  }
}

loadGifs();
