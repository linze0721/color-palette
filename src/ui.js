import { list, removeFavorite } from './favorites.js';

let toastTimer = null;

function luminance(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function formatTime(ms) {
  const d = new Date(ms);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/**
 * @param {string[]} colors
 * @param {(hex: string) => void} onCopy
 */
export function renderMainSwatches(colors, onCopy) {
  const container = document.getElementById('swatches-main');
  if (!container) return;
  container.innerHTML = '';

  colors.forEach((hex, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch-lg' + (index === 4 ? ' swatch-lg--wide' : '');
    btn.dataset.hex = hex;
    btn.dataset.index = String(index);

    const colorDiv = document.createElement('div');
    colorDiv.className = 'swatch-lg__color';
    colorDiv.style.backgroundColor = hex;

    const label = document.createElement('span');
    label.className = 'swatch-lg__hex';
    label.textContent = hex;
    if (luminance(hex) > 0.55) {
      label.style.color = '#1e293b';
    }

    btn.append(colorDiv, label);
    btn.addEventListener('click', () => onCopy(hex));
    container.appendChild(btn);
  });
}

export async function copyHex(hex) {
  const toast = document.getElementById('copy-toast');
  const toastHex = document.getElementById('copy-toast-hex');

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(hex);
    } else {
      throw new Error('clipboard unavailable');
    }
    if (toast && toastHex) {
      toastHex.textContent = hex;
      toast.hidden = false;
      toast.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
        toast.hidden = true;
      }, 2500);
    }
    return true;
  } catch {
    if (toast) {
      toast.hidden = false;
      toast.classList.add('is-visible');
      toast.textContent = `Could not copy — HEX: ${hex}`;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
        toast.hidden = true;
      }, 3500);
    }
    return false;
  }
}

/**
 * @param {(colors: string[]) => void} onRestore
 */
export function renderFavoritesSidebar(onRestore) {
  const listEl = document.getElementById('favorites-list');
  const emptyEl = document.getElementById('favorites-empty');
  if (!listEl || !emptyEl) return;

  const favorites = list();
  listEl.innerHTML = '';

  if (favorites.length === 0) {
    emptyEl.classList.remove('is-hidden');
    return;
  }

  emptyEl.classList.add('is-hidden');

  favorites.forEach((fav) => {
    const row = document.createElement('div');
    row.className = 'favorite-row';
    row.setAttribute('role', 'button');
    row.tabIndex = 0;
    row.dataset.favoriteId = fav.id;

    const swatchesWrap = document.createElement('div');
    swatchesWrap.className = 'favorite-row__swatches';
    swatchesWrap.setAttribute('aria-hidden', 'true');
    fav.colors.forEach((c) => {
      const mini = document.createElement('span');
      mini.className = 'favorite-row__mini';
      mini.style.background = c;
      swatchesWrap.appendChild(mini);
    });

    const time = document.createElement('p');
    time.className = 'favorite-row__time';
    time.textContent = formatTime(fav.createdAt);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'favorite-row__remove';
    removeBtn.title = 'Remove';
    removeBtn.setAttribute('aria-label', 'Remove favorite');
    removeBtn.innerHTML =
      '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>';

    const restore = () => onRestore([...fav.colors]);
    row.addEventListener('click', (e) => {
      if (e.target.closest('.favorite-row__remove')) return;
      restore();
    });
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        restore();
      }
    });
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFavorite(fav.id);
      renderFavoritesSidebar(onRestore);
    });

    row.append(swatchesWrap, time, removeBtn);
    listEl.appendChild(row);
  });
}