# May the designer

Static HTML/CSS/JS gallery that displays GIFs from the **maythedesigner** GIPHY channel.

> Girly pink reactions, memes, and perfectly timed loops — curated by May.

## How it works

GitHub Pages is static, and browsers can't fetch `giphy.com` HTML due to CORS.  
So this repo snapshots the channel at build time into `data/gifs.json`.

This project snapshots a fixed list of GIFs into `data/gifs.json` at build time (no GIPHY API key needed).

## Local run

Build the GIF list:

```bash
npm run fetch
```

Serve locally:

```bash
npm run serve
```

Then open `http://localhost:5173`

## Update the gallery later

Run:

```bash
npm run fetch
```

Commit the updated `data/gifs.json`.

## GitHub Pages deploy

1. Create a repo named **`MayCodegirl`** or similar.
2. Push this project to that repo.
3. In GitHub repo settings → **Pages**:
   - **Build and deployment**: "Deploy from a branch"
   - **Branch**: `main` / **folder**: `/ (root)`

---

**May the designer** — Girly pink reactions and memes.
