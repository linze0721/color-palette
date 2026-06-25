import { generatePalette } from './palette.js';
import { saveFavorite } from './favorites.js';
import { renderMainSwatches, copyHex, renderFavoritesSidebar } from './ui.js';

let currentColors = generatePalette();

function setPalette(colors) {
  currentColors = [...colors];
  renderMainSwatches(currentColors, (hex) => {
    copyHex(hex);
  });
}

function init() {
  setPalette(currentColors);

  renderFavoritesSidebar((colors) => {
    setPalette(colors);
  });

  document.getElementById('btn-generate')?.addEventListener('click', () => {
    setPalette(generatePalette());
  });

  document.getElementById('btn-save')?.addEventListener('click', () => {
    saveFavorite(currentColors);
    renderFavoritesSidebar((colors) => {
      setPalette(colors);
    });
  });
}

init();