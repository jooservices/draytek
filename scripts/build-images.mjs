// Converts source press images (assets-src/press, not committed) to web-sized WebP in public/img/devices
// and writes data/images.json (device id -> image entry). Run: npm run images
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'assets-src/press';
const OUT = 'public/img/devices';

// device id -> source file (without extension)
const MAP = {
  v167: 'Vigor_167', v2136: 'Vigor_2136ax', v2763: 'Vigor_2763', v2766: 'Vigor_2766', v2767: 'Vigor_2767',
  v2865: 'Vigor_2865', v2865l: 'Vigor_2865Lac', v2866: 'Vigor_2866', v2867: 'Vigor_2867',
  v2925: 'Vigor_2925', v2926: 'Vigor_2926', v2927: 'Vigor_2927ax', v2927l: 'Vigor_2927Lac',
  v2928: 'Vigor_2928be', v2952: 'Vigor_2952', v2960: 'Vigor_2960_front', v2962: 'Vigor_2962',
  v3912: 'Vigor_3912S', vc410: 'Vigor_C410ax', vc510: 'Vigor_C510ax',
  ap1000c: 'VigorAP_1000C', ap1060c: 'VigorAP_1060C', ap805: 'VigorAP_805', ap903: 'VigorAP_903',
  ap905: 'VigorAP_905', ap906: 'VigorAP_906', ap912c: 'VigorAP_912C', ap918r: 'VigorAP_918R',
  ap918rpd: 'VigorAP_918R', ap920r: 'VigorAP_920R', ap960c: 'VigorAP_960C', ap962c: 'VigorAP_962C',
  swfx2120: 'VigorSwitch_FX2120', swg1080: 'VigorSwitch_G1080', swg1280: 'VigorSwitch_G1280',
  swg1282: 'VigorSwitch_G1282', swg2100: 'VigorSwitch_G2100', swg2280x: 'VigorSwitch_G2280x',
  swg2282x: 'VigorSwitch_G2282x', swg2540x: 'VigorSwitch_G2540x', swg2542x: 'VigorSwitch_G2542x',
  swp1280: 'VigorSwitch_P1280', swp1281x: 'VigorSwitch_P1281x', swp1282: 'VigorSwitch_P1282',
  swp2100: 'VigorSwitch_P2100', swp2280x: 'VigorSwitch_P2280x', swp2282x: 'VigorSwitch_P2282x',
  swp2540x: 'VigorSwitch_P2540x', swp2542x: 'VigorSwitch_P2542x', swpq2200xb: 'VigorSwitch_PQ2200xb',
  swq2200x: 'VigorSwitch_Q2200x',
};

fs.mkdirSync(OUT, { recursive: true });
const files = fs.readdirSync(SRC);
const manifest = {};
for (const [id, base] of Object.entries(MAP)) {
  const f = files.find((x) => path.parse(x).name === base);
  if (!f) { console.warn('missing source for', id, base); continue; }
  const img = sharp(path.join(SRC, f)).trim({ threshold: 5 });
  const { width, height } = await img.clone().resize({ width: 1000, withoutEnlargement: true }).toBuffer({ resolveWithObject: true }).then((r) => r.info);
  await img.clone().resize({ width: 1000, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(OUT, `${id}.webp`));
  await img.clone().resize({ width: 400, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(OUT, `${id}-sm.webp`));
  // Full-size copy for the zoom modal (original resolution, capped at 1600px wide).
  const full = await img.clone().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 86 }).toFile(path.join(OUT, `${id}-full.webp`));
  manifest[id] = { src: `${id}.webp`, thumb: `${id}-sm.webp`, full: `${id}-full.webp`, w: width, h: height, fw: full.width, fh: full.height, from: base };
}
fs.writeFileSync('data/images.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(Object.keys(manifest).length, 'images');
