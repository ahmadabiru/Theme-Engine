/**
 * wallpaperSources.js
 *
 * Fetches wallpaper suggestions from Unsplash, Pexels, and Pixabay for a
 * given Argentum theme, and normalizes the three very different response
 * shapes into one common shape the UI can render without caring which
 * source a photo came from. Also merges in bundled "originals" from
 * /public/originals/<folder>/.
 *
 * Keyed by the SHORT theme ids used in lib/themes.ts (silver, pink, acid,
 * teal, purple, banana, cyan) — NOT the readable slugs, since that's what
 * ThemeProvider actually passes around as themeId.
 *
 * Env vars required (see .env.example):
 *   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
 *   NEXT_PUBLIC_PEXELS_API_KEY
 *   NEXT_PUBLIC_PIXABAY_API_KEY
 */

export type WallpaperPhoto = {
  id: string
  source: string
  thumbUrl: string
  fullUrl: string
  photoPageUrl: string | null
  photographer: string | null
  photographerUrl: string | null
  downloadTrackUrl: string | null
  width?: number
  height?: number
}

// ---- 1. Theme id -> search query mapping -----------------------------------
export const THEME_QUERIES: Record<string, string[]> = {
  silver: ["liquid chrome metallic", "silver metal texture", "chrome abstract 3d"],
  banana: ["pastel pink yellow gradient", "pink yellow paint abstract"],
  pink: ["pink neon black background", "magenta neon abstract"],
  acid: ["green neon liquid dark", "green neon abstract black"],
  cyan: ["neon lightning bolt", "neon sign dark background"],
  teal: ["teal neon abstract 3d", "cyan geometric dark background"],
  purple: ["holographic liquid swirl", "iridescent fluid purple pink teal"],
};

// ---- 1b. Theme id -> public/originals folder name --------------------------
// Your image folders on disk kept the readable slugs even though the theme
// ids themselves are short codenames — this bridges the two.
const ID_TO_FOLDER: Record<string, string> = {
  silver: "argentum-default",
  pink: "born-pink",
  acid: "chemical-x",
  teal: "going-ghost",
  purple: "the-jester",
  banana: "banana-split",
  cyan: "electric",
};

// ---- 1c. Bundled "originals" ------------------------------------------------
// Filenames only — folder is resolved via ID_TO_FOLDER above.
const ORIGINALS_MANIFEST: Record<string, string[]> = {
  silver: [],
  banana: ["b1.jpg", "b2.jpg"],
  pink: ["p1.jpeg"],
  acid: ["c1.jpg", "c2.jpg", "c3.jpg", "c4.jpg", "c5.png"],
  cyan: [],
  teal: ["g1.jpg", "g2.jpg", "g3.jpg"],
  purple: ["j1.jpg", "j2.jpg", "j3.jpg"],
};

function getOriginals(themeId: string): WallpaperPhoto[] {
  const folder = ID_TO_FOLDER[themeId] ?? themeId;
  return (ORIGINALS_MANIFEST[themeId] || []).map((filename) => ({
    id: `original-${themeId}-${filename}`,
    source: "original",
    thumbUrl: `/originals/${folder}/${filename}`,
    fullUrl: `/originals/${folder}/${filename}`,
    photoPageUrl: null,
    photographer: null,
    photographerUrl: null,
    downloadTrackUrl: null,
  }));
}

// ---- 2. Per-source fetchers -------------------------------------------------

async function fetchUnsplash(query: string, perPage = 10): Promise<WallpaperPhoto[]> {
  const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ?? '';
  if (!key) return [];

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    query
  )}&per_page=${perPage}&orientation=landscape`;

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${key}` },
  });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.results || []).map((p: any) => ({
    id: `unsplash-${p.id}`,
    source: "unsplash",
    thumbUrl: p.urls.small,
    fullUrl: p.urls.full,
    photoPageUrl: `${p.links.html}?utm_source=argentum&utm_medium=referral`,
    photographer: p.user.name,
    photographerUrl: `${p.user.links.html}?utm_source=argentum&utm_medium=referral`,
    downloadTrackUrl: p.links.download_location,
    width: p.width,
    height: p.height,
  }));
}

async function fetchPexels(query: string, perPage = 10): Promise<WallpaperPhoto[]> {
  const key = process.env.NEXT_PUBLIC_PEXELS_API_KEY ?? '';
  if (!key) return [];

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    query
  )}&per_page=${perPage}&orientation=landscape`;

  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.photos || []).map((p: any) => ({
    id: `pexels-${p.id}`,
    source: "pexels",
    thumbUrl: p.src.medium,
    fullUrl: p.src.original,
    photoPageUrl: p.url,
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
    downloadTrackUrl: null,
    width: p.width,
    height: p.height,
  }));
}

async function fetchPixabay(query: string, perPage = 10): Promise<WallpaperPhoto[]> {
  const key = process.env.NEXT_PUBLIC_PIXABAY_API_KEY ?? '';
  if (!key) return [];

  const url = `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(
    query
  )}&image_type=photo&orientation=horizontal&per_page=${Math.max(perPage, 3)}`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();

  return (data.hits || []).map((p: any) => ({
    id: `pixabay-${p.id}`,
    source: "pixabay",
    thumbUrl: p.webformatURL,
    fullUrl: p.largeImageURL,
    photoPageUrl: p.pageURL,
    photographer: p.user,
    photographerUrl: `https://pixabay.com/users/${p.user}-${p.user_id}/`,
    downloadTrackUrl: null,
    width: p.imageWidth,
    height: p.imageHeight,
  }));
}

// ---- 3. Public entry point --------------------------------------------------

/**
 * Fetch + merge suggestions for a theme from all sources. Originals are
 * pinned first, live results from the three APIs are shuffled after them.
 */
export async function getWallpaperSuggestions(themeId: string): Promise<WallpaperPhoto[]> {
  const queries = THEME_QUERIES[themeId] || [themeId];
  const primaryQuery = queries[0];

  const [unsplash, pexels, pixabay] = await Promise.all([
    fetchUnsplash(primaryQuery),
    fetchPexels(primaryQuery),
    fetchPixabay(primaryQuery),
  ]);

  const originals = getOriginals(themeId);
  const live = shuffle([...unsplash, ...pexels, ...pixabay]);

  return [...originals, ...live];
}

function shuffle(arr: WallpaperPhoto[]): WallpaperPhoto[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Call this when the user actually selects a photo (not just hovers/previews).
 * Only Unsplash requires this per their API terms; it's a no-op for the others.
 */
export async function trackSelection(photo: WallpaperPhoto): Promise<void> {
  if (photo.source === "unsplash" && photo.downloadTrackUrl) {
    const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ?? '';
    try {
      await fetch(photo.downloadTrackUrl, {
        headers: { Authorization: `Client-ID ${key}` },
      });
    } catch {
      // Non-critical
    }
  }
}