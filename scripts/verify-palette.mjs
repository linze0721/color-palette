#!/usr/bin/env node
import { generatePalette } from '../src/palette.js';

const hexRe = /^#[0-9A-F]{6}$/;
const p = generatePalette();
if (p.length !== 5) {
  console.error('Expected 5 colors, got', p.length);
  process.exit(1);
}
for (const c of p) {
  if (!hexRe.test(c)) {
    console.error('Invalid hex:', c);
    process.exit(1);
  }
}
console.log('palette ok', p.join(' '));
process.exit(0);