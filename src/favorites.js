export const STORAGE_KEY = 'palette-gen:favorites';

const MAX_FAVORITES = 10;

/**
 * @typedef {Object} FavoritePalette
 * @property {string} id
 * @property {string[]} colors - five HEX color strings
 * @property {number} createdAt
 */

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return String(Date.now());
}

function readRaw() {
  if (typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeRaw(favorites) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const { id, colors, createdAt } = entry;
  if (typeof id !== 'string' || !Array.isArray(colors) || colors.length !== 5) return null;
  if (!colors.every((c) => typeof c === 'string')) return null;
  if (typeof createdAt !== 'number' || !Number.isFinite(createdAt)) return null;
  return { id, colors: [...colors], createdAt };
}

/**
 * @returns {FavoritePalette[]}
 */
export function loadFavorites() {
  return readRaw()
    .map(normalizeEntry)
    .filter(Boolean);
}

/**
 * @param {string[]} colors - five HEX color strings
 * @returns {FavoritePalette}
 */
export function saveFavorite(colors) {
  if (!Array.isArray(colors) || colors.length !== 5 || !colors.every((c) => typeof c === 'string')) {
    throw new Error('saveFavorite requires an array of 5 color strings');
  }

  const entry = {
    id: newId(),
    colors: [...colors],
    createdAt: Date.now(),
  };

  const existing = loadFavorites();
  const next = [entry, ...existing];

  while (next.length > MAX_FAVORITES) {
    next.pop();
  }

  writeRaw(next);
  return entry;
}

/**
 * @param {string} id
 */
export function removeFavorite(id) {
  if (typeof id !== 'string') return;
  const next = loadFavorites().filter((f) => f.id !== id);
  writeRaw(next);
}

/**
 * Newest first, at most 10 entries.
 * @returns {FavoritePalette[]}
 */
export function list() {
  return loadFavorites()
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_FAVORITES);
}