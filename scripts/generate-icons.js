const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, getPixel) {
  // 8 bytes PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk: 13 bytes
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);   // bit depth 8
  ihdrData.writeUInt8(6, 9);   // color type 6: RGBA
  ihdrData.writeUInt8(0, 10);  // compression method 0
  ihdrData.writeUInt8(0, 11);  // filter method 0
  ihdrData.writeUInt8(0, 12);  // interlace method 0
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0 (None)
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[offset++] = Math.max(0, Math.min(255, Math.round(r)));
      rawData[offset++] = Math.max(0, Math.min(255, Math.round(g)));
      rawData[offset++] = Math.max(0, Math.min(255, Math.round(b)));
      rawData[offset++] = Math.max(0, Math.min(255, Math.round(a)));
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = zlib.crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc >>> 0, 8 + length);
  return chunk;
}

// Distance to rounded rectangle
function sdRoundBox(px, py, bx, by, r) {
  const qx = Math.abs(px) - bx + r;
  const qy = Math.abs(py) - by + r;
  const inside = Math.min(Math.max(qx, qy), 0);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return inside + outside - r;
}

// Segment distance
function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// Arc distance helper
function distToArc(px, py, cx, cy, radius, startAngle, endAngle) {
  const angle = Math.atan2(py - cy, px - cx);
  let diff = angle;
  // normalize between -PI and PI
  while (diff < -Math.PI) diff += 2 * Math.PI;
  while (diff > Math.PI) diff -= 2 * Math.PI;

  const inArc = (startAngle <= endAngle)
    ? (diff >= startAngle && diff <= endAngle)
    : (diff >= startAngle || diff <= endAngle);

  if (inArc) {
    return Math.abs(Math.hypot(px - cx, py - cy) - radius);
  }
  const d1 = Math.hypot(px - (cx + radius * Math.cos(startAngle)), py - (cy + radius * Math.sin(startAngle)));
  const d2 = Math.hypot(px - (cx + radius * Math.cos(endAngle)), py - (cy + radius * Math.sin(endAngle)));
  return Math.min(d1, d2);
}

// Render pixel function for SplitEase Icon
function getSplitEasePixel(x, y, w, h) {
  const nx = (x / w) * 2 - 1; // -1 to 1
  const ny = (y / h) * 2 - 1; // -1 to 1

  // Outer dark background with subtle border
  const cornerR = 0.35;
  const boxDist = sdRoundBox(nx, ny, 0.88, 0.88, cornerR);
  
  if (boxDist > 0.04) {
    return [10, 10, 15, 0]; // Transparent outside
  }

  // Antialiased box edge
  const boxAlpha = Math.max(0, Math.min(1, (0.02 - boxDist) / 0.02));
  
  // Sleek obsidian / charcoal gradient
  const t = (nx + ny + 2) / 4; // 0 to 1 diagonal gradient
  // Top-left: #3f3f46 (63, 63, 70), Bottom-right: #18181b (24, 24, 27)
  let bgR = 63 - t * (63 - 24);
  let bgG = 63 - t * (63 - 24);
  let bgB = 70 - t * (70 - 27);

  // Modern stylised "S" shape
  const upperArcDist = distToArc(nx, ny, 0, -0.22, 0.24, -Math.PI * 0.95, Math.PI * 0.5);
  const lowerArcDist = distToArc(nx, ny, 0, 0.22, 0.24, Math.PI * 0.05, Math.PI * 1.5);
  
  const strokeDist = Math.min(upperArcDist, lowerArcDist);
  const sThickness = 0.085;
  const sDist = strokeDist - sThickness;

  let r = bgR, g = bgG, b = bgB, a = boxAlpha * 255;

  if (sDist < 0.02) {
    const sAlpha = Math.max(0, Math.min(1, (0.01 - sDist) / 0.02));
    r = r * (1 - sAlpha) + 255 * sAlpha;
    g = g * (1 - sAlpha) + 255 * sAlpha;
    b = b * (1 - sAlpha) + 255 * sAlpha;
  }

  return [r, g, b, a];
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate 512x512
console.log('Generating 512x512 icon...');
const png512 = createPng(512, 512, getSplitEasePixel);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), png512);

// Generate 192x192
console.log('Generating 192x192 icon...');
const png192 = createPng(192, 192, getSplitEasePixel);
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), png192);

// Generate 180x180 for Apple touch icon
console.log('Generating apple-touch-icon.png (180x180)...');
const png180 = createPng(180, 180, getSplitEasePixel);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), png180);

// Generate SVG icon
console.log('Generating icon.svg...');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="monochromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#27272a"/>
      <stop offset="100%" stop-color="#121215"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="120" fill="#09090b"/>
  <rect x="36" y="36" width="440" height="440" rx="96" fill="url(#monochromeGrad)" stroke="rgba(255,255,255,0.12)" stroke-width="4"/>
  <path d="M 330 160 C 330 160 300 130 256 130 C 200 130 160 170 160 216 C 160 270 210 286 256 300 C 310 316 352 334 352 390 C 352 446 304 482 256 482 C 196 482 160 440 160 440" 
        fill="none" stroke="#ffffff" stroke-width="48" stroke-linecap="round" stroke-linejoin="round" transform="translate(0, -50)"/>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svg);

console.log('All icons generated successfully!');
