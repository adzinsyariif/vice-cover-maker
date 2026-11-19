/*
 * Strips XMP metadata segments (JPEG APP1) from the bundled sample
 * photos, in place. The generated samples arrived carrying an Adobe
 * XMP packet whose namespace strings contain URL text; the studio is
 * a fully offline app with no URL strings anywhere under app/, so
 * the packets go. This is a lossless container edit: the compressed
 * image data after the SOS marker is copied byte for byte.
 */

import { readFileSync, writeFileSync } from 'node:fs';

const FILES = process.argv.slice(2);
if (!FILES.length) {
  console.error('usage: node tools/strip-xmp.mjs <file.jpg> [...]');
  process.exit(1);
}

for (const file of FILES) {
  const buf = readFileSync(file);
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error(`${file}: not a JPEG`);
  const parts = [buf.subarray(0, 2)];
  let i = 2;
  let removed = 0;
  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) throw new Error(`${file}: bad marker at ${i}`);
    const marker = buf[i + 1];
    if (marker === 0xda) {
      /* Start of scan: everything from here is image data. */
      parts.push(buf.subarray(i));
      i = buf.length;
      break;
    }
    const len = buf.readUInt16BE(i + 2);
    if (marker === 0xe1) {
      removed += 1;
    } else {
      parts.push(buf.subarray(i, i + 2 + len));
    }
    i += 2 + len;
  }
  const out = Buffer.concat(parts);
  writeFileSync(file, out);
  console.log(`${file}: removed ${removed} APP1 segment(s), ${buf.length} -> ${out.length} bytes`);
}
