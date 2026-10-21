import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makePngChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPng(width, height, pixelFn) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // deflate compression
  ihdrData[11] = 0; // filter None
  ihdrData[12] = 0; // non-interlaced
  const ihdrChunk = makePngChunk('IHDR', ihdrData);

  // Raw image scanlines with 0-filter byte
  const rowStride = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowStride);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // IDAT Chunk (zlib compressed)
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makePngChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = makePngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Colors:
// Rickshaw Yellow: #FFD60A (255, 214, 10)
// Meter Black:     #111111 (17, 17, 17)
// Auto Green:      #0B7A4B (11, 122, 75)
// Chalk White:     #FFFCF2 (255, 252, 242)

function renderQueueBuddyIcon(isMaskable, isApple = false) {
  return (x, y, width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    const size = width;

    // Maskable icons need 20% safe padding (content radius <= 0.35 * size)
    const scale = isMaskable ? 0.72 : isApple ? 0.85 : 0.88;

    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy);

    // Background:
    // Maskable is solid yellow edge to edge
    // Standard icon has rounded corners
    if (!isMaskable && !isApple) {
      // Rounded squircle check
      const cornerRadius = size * 0.22;
      const qx = Math.max(0, Math.abs(dx) - (size / 2 - cornerRadius));
      const qy = Math.max(0, Math.abs(dy) - (size / 2 - cornerRadius));
      const qDist = Math.hypot(qx, qy);
      if (qDist > cornerRadius) {
        return [0, 0, 0, 0]; // Transparent outside squircle
      }
    }

    // Default background color: Rickshaw Yellow #FFD60A
    let r = 255;
    let g = 214;
    let b = 10;
    let a = 255;

    // Stylized "Q" logo parameters:
    const qRadius = size * 0.28 * scale;
    const qThickness = size * 0.085 * scale;
    const innerRadius = qRadius - qThickness;

    // Center of "Q" loop
    const qcx = cx - size * 0.02 * scale;
    const qcy = cy - size * 0.02 * scale;
    const qDist = Math.hypot(x - qcx, y - qcy);

    // Check if pixel is within the "Q" ring
    const inQRing = qDist <= qRadius && qDist >= innerRadius;

    // Diagonal tail of "Q"
    // From (qcx + innerRadius*0.6, qcy + innerRadius*0.6) to (qcx + qRadius*1.4, qcy + qRadius*1.4)
    const tailX1 = qcx + qRadius * 0.25;
    const tailY1 = qcy + qRadius * 0.25;
    const tailX2 = qcx + qRadius * 1.35;
    const tailY2 = qcy + qRadius * 1.35;

    // Distance to line segment
    const l2 = Math.hypot(tailX2 - tailX1, tailY2 - tailY1) ** 2;
    let t = ((x - tailX1) * (tailX2 - tailX1) + (y - tailY1) * (tailY2 - tailY1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = tailX1 + t * (tailX2 - tailX1);
    const projY = tailY1 + t * (tailY2 - tailY1);
    const distToTail = Math.hypot(x - projX, y - projY);
    const inQTail = distToTail <= qThickness * 0.65;

    // Inner green queue spot indicator badge
    // Positioned in center of Q: (qcx, qcy)
    const badgeRadius = innerRadius * 0.42;
    const inBadge = qDist <= badgeRadius;

    if (inQRing || inQTail) {
      // Meter Black #111111
      r = 17;
      g = 17;
      b = 17;
    } else if (inBadge) {
      // Auto Green #0B7A4B
      r = 11;
      g = 122;
      b = 75;
    }

    return [r, g, b, a];
  };
}

const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. icon-192.png
const png192 = createPng(192, 192, renderQueueBuddyIcon(false));
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), png192);
console.log('✓ Generated icon-192.png (192x192)');

// 2. icon-512.png
const png512 = createPng(512, 512, renderQueueBuddyIcon(false));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), png512);
console.log('✓ Generated icon-512.png (512x512)');

// 3. icon-maskable-512.png (with safe padding for Android launchers)
const pngMaskable512 = createPng(512, 512, renderQueueBuddyIcon(true));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), pngMaskable512);
console.log('✓ Generated icon-maskable-512.png (512x512 maskable)');

// 4. apple-touch-icon.png (180x180 for iOS Home Screen)
const pngApple180 = createPng(180, 180, renderQueueBuddyIcon(false, true));
fs.writeFileSync(path.join('public', 'apple-touch-icon.png'), pngApple180);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), pngApple180);
console.log('✓ Generated apple-touch-icon.png (180x180)');

// Also generate updated icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="#FFD60A" stroke="#111111" stroke-width="16" />
  <!-- Q Outer Ring -->
  <circle cx="240" cy="240" r="140" fill="none" stroke="#111111" stroke-width="44" />
  <!-- Q Tail -->
  <line x1="280" y1="280" x2="390" y2="390" stroke="#111111" stroke-width="44" stroke-linecap="round" />
  <!-- Live Queue Spot Counter Indicator -->
  <circle cx="240" cy="240" r="42" fill="#0B7A4B" />
  <circle cx="240" cy="240" r="14" fill="#FFFFFF" />
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);
console.log('✓ Generated icon.svg (512x512 SVG)');
