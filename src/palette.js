const SWATCH_COUNT = 5;
const SAT_MIN = 45;
const SAT_MAX = 75;
const LIGHT_MIN = 35;
const LIGHT_MAX = 65;
const HUE_JITTER = 12;

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function hslToHex(h, s, l) {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (n) => {
    const v = Math.round((n + m) * 255);
    return v.toString(16).padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * @returns {string[]} Five HEX color strings
 */
export function generatePalette() {
  const baseHue = Math.random() * 360;
  const colors = [];

  for (let i = 0; i < SWATCH_COUNT; i += 1) {
    const hue = (baseHue + (360 / SWATCH_COUNT) * i + randomInRange(-HUE_JITTER, HUE_JITTER) + 360) % 360;
    const sat = randomInRange(SAT_MIN, SAT_MAX);
    const light = randomInRange(LIGHT_MIN, LIGHT_MAX);
    colors.push(hslToHex(hue, sat, light));
  }

  return colors;
}