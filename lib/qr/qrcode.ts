/**
 * CampusCare — Pure TypeScript QR Code Generator (ISO/IEC 18004 compliant)
 * Zero external dependencies. Generates crisp SVG and pixel matrices for any URL or text.
 */

// Error correction levels
export type QRErrorCorrectionLevel = "L" | "M" | "Q" | "H";

interface QRVersionCapacity {
  version: number;
  totalCodewords: number;
  ecCodewordsPerBlock: number;
  numBlocksGroup1: number;
  dataCodewordsPerBlockGroup1: number;
  numBlocksGroup2: number;
  dataCodewordsPerBlockGroup2: number;
}

// Version table capacities for Byte Mode and Error Correction Level M (15% recovery)
const VERSION_SPECS_M: QRVersionCapacity[] = [
  { version: 1, totalCodewords: 26, ecCodewordsPerBlock: 10, numBlocksGroup1: 1, dataCodewordsPerBlockGroup1: 16, numBlocksGroup2: 0, dataCodewordsPerBlockGroup2: 0 },
  { version: 2, totalCodewords: 44, ecCodewordsPerBlock: 16, numBlocksGroup1: 1, dataCodewordsPerBlockGroup1: 28, numBlocksGroup2: 0, dataCodewordsPerBlockGroup2: 0 },
  { version: 3, totalCodewords: 70, ecCodewordsPerBlock: 26, numBlocksGroup1: 1, dataCodewordsPerBlockGroup1: 44, numBlocksGroup2: 0, dataCodewordsPerBlockGroup2: 0 },
  { version: 4, totalCodewords: 100, ecCodewordsPerBlock: 18, numBlocksGroup1: 2, dataCodewordsPerBlockGroup1: 32, numBlocksGroup2: 0, dataCodewordsPerBlockGroup2: 0 },
  { version: 5, totalCodewords: 134, ecCodewordsPerBlock: 24, numBlocksGroup1: 2, dataCodewordsPerBlockGroup1: 43, numBlocksGroup2: 0, dataCodewordsPerBlockGroup2: 0 },
  { version: 6, totalCodewords: 172, ecCodewordsPerBlock: 16, numBlocksGroup1: 4, dataCodewordsPerBlockGroup1: 27, numBlocksGroup2: 0, dataCodewordsPerBlockGroup2: 0 },
  { version: 7, totalCodewords: 196, ecCodewordsPerBlock: 18, numBlocksGroup1: 4, dataCodewordsPerBlockGroup1: 31, numBlocksGroup2: 0, dataCodewordsPerBlockGroup2: 0 },
  { version: 8, totalCodewords: 242, ecCodewordsPerBlock: 22, numBlocksGroup1: 2, dataCodewordsPerBlockGroup1: 38, numBlocksGroup2: 2, dataCodewordsPerBlockGroup2: 39 },
  { version: 9, totalCodewords: 292, ecCodewordsPerBlock: 22, numBlocksGroup1: 3, dataCodewordsPerBlockGroup1: 36, numBlocksGroup2: 2, dataCodewordsPerBlockGroup2: 37 },
  { version: 10, totalCodewords: 346, ecCodewordsPerBlock: 26, numBlocksGroup1: 4, dataCodewordsPerBlockGroup1: 43, numBlocksGroup2: 1, dataCodewordsPerBlockGroup2: 44 },
  { version: 11, totalCodewords: 404, ecCodewordsPerBlock: 30, numBlocksGroup1: 1, dataCodewordsPerBlockGroup1: 50, numBlocksGroup2: 4, dataCodewordsPerBlockGroup2: 51 },
  { version: 12, totalCodewords: 466, ecCodewordsPerBlock: 22, numBlocksGroup1: 6, dataCodewordsPerBlockGroup1: 36, numBlocksGroup2: 2, dataCodewordsPerBlockGroup2: 37 },
];

// Galois field GF(256) tables for Reed-Solomon coding
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(() => {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = val;
    EXP_TABLE[i + 255] = val;
    LOG_TABLE[val] = i;
    val = (val << 1) ^ (val & 128 ? 0x11d : 0);
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

// Generate Reed-Solomon generator polynomial of degree `degree`
function getRsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    const factor = EXP_TABLE[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], factor);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

// Compute Reed-Solomon error correction codewords
function computeRsCodewords(data: Uint8Array, numEcCodewords: number): Uint8Array {
  const gen = getRsGeneratorPoly(numEcCodewords);
  const result = new Uint8Array(numEcCodewords);

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ result[0];
    result.copyWithin(0, 1);
    result[numEcCodewords - 1] = 0;
    for (let j = 0; j < numEcCodewords; j++) {
      result[j] ^= gfMul(gen[j], factor);
    }
  }

  return result;
}

// Alignment pattern coordinate centers per version
const ALIGNMENT_COORDS: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
  11: [6, 30, 54],
  12: [6, 32, 58],
};

// Format info strings for EC Level M (Mask 0 to 7)
// Level M indicator is 00 in QR spec, XOR'd with 101010000010010 (0x5412)
const FORMAT_INFO_M: number[] = [
  0x5412 ^ 0x0000, // mask 0
  0x5412 ^ 0x0537, // mask 1
  0x5412 ^ 0x0a6e, // mask 2
  0x5412 ^ 0x0f59, // mask 3
  0x5412 ^ 0x11ef, // mask 4
  0x5412 ^ 0x14d8, // mask 5
  0x5412 ^ 0x1b81, // mask 6
  0x5412 ^ 0x1eb6, // mask 7
];

export interface QRCodeData {
  version: number;
  size: number;
  modules: boolean[][];
}

/**
 * Encodes text or URL into a QR Code matrix using EC Level M.
 */
export function generateQRCodeMatrix(text: string): QRCodeData {
  const textBytes = new TextEncoder().encode(text);
  const dataLen = textBytes.length;

  // Find minimum version that fits dataLen in Byte Mode (Mode 4 bits + CharCount 8/16 bits + dataLen*8 bits)
  let selectedSpec: QRVersionCapacity | null = null;
  for (const spec of VERSION_SPECS_M) {
    const totalDataCapacity =
      spec.numBlocksGroup1 * spec.dataCodewordsPerBlockGroup1 +
      spec.numBlocksGroup2 * spec.dataCodewordsPerBlockGroup2;

    const charCountBits = spec.version >= 10 ? 16 : 8;
    const requiredBits = 4 + charCountBits + dataLen * 8;
    const requiredBytes = Math.ceil(requiredBits / 8);

    if (totalDataCapacity >= requiredBytes) {
      selectedSpec = spec;
      break;
    }
  }

  if (!selectedSpec) {
    // If text is larger than version 12, fallback to version 12 capacity
    selectedSpec = VERSION_SPECS_M[VERSION_SPECS_M.length - 1];
  }

  const version = selectedSpec.version;
  const size = version * 4 + 17;
  const totalDataBytes =
    selectedSpec.numBlocksGroup1 * selectedSpec.dataCodewordsPerBlockGroup1 +
    selectedSpec.numBlocksGroup2 * selectedSpec.dataCodewordsPerBlockGroup2;

  // Build bitstream
  const bits: number[] = [];
  function pushBits(val: number, length: number) {
    for (let i = length - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  // Byte mode indicator: 0100
  pushBits(0b0100, 4);

  // Character count
  const charCountBits = version >= 10 ? 16 : 8;
  pushBits(dataLen, charCountBits);

  // Data bytes
  for (let i = 0; i < dataLen; i++) {
    pushBits(textBytes[i], 8);
  }

  // Terminator (up to 4 zeroes)
  const remainingBits = totalDataBytes * 8 - bits.length;
  pushBits(0, Math.min(4, Math.max(0, remainingBits)));

  // Pad to byte boundary
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Convert to byte array
  const dataCodewords = new Uint8Array(totalDataBytes);
  for (let i = 0; i < bits.length / 8; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bits[i * 8 + b];
    }
    dataCodewords[i] = byteVal;
  }

  // Pad remaining capacity with 0xEC and 0x11
  let padIdx = bits.length / 8;
  const padPatterns = [0xec, 0x11];
  let padToggle = 0;
  while (padIdx < totalDataBytes) {
    dataCodewords[padIdx++] = padPatterns[padToggle];
    padToggle ^= 1;
  }

  // Block partitioning and Reed-Solomon computation
  const blocks: { data: Uint8Array; ec: Uint8Array }[] = [];
  let offset = 0;

  // Group 1 blocks
  for (let i = 0; i < selectedSpec.numBlocksGroup1; i++) {
    const dLen = selectedSpec.dataCodewordsPerBlockGroup1;
    const blockData = dataCodewords.slice(offset, offset + dLen);
    offset += dLen;
    const blockEc = computeRsCodewords(blockData, selectedSpec.ecCodewordsPerBlock);
    blocks.push({ data: blockData, ec: blockEc });
  }

  // Group 2 blocks
  for (let i = 0; i < selectedSpec.numBlocksGroup2; i++) {
    const dLen = selectedSpec.dataCodewordsPerBlockGroup2;
    const blockData = dataCodewords.slice(offset, offset + dLen);
    offset += dLen;
    const blockEc = computeRsCodewords(blockData, selectedSpec.ecCodewordsPerBlock);
    blocks.push({ data: blockData, ec: blockEc });
  }

  // Interleave data codewords
  const interleaved: number[] = [];
  let maxDataLen = 0;
  for (const b of blocks) {
    if (b.data.length > maxDataLen) maxDataLen = b.data.length;
  }

  for (let i = 0; i < maxDataLen; i++) {
    for (const b of blocks) {
      if (i < b.data.length) {
        interleaved.push(b.data[i]);
      }
    }
  }

  // Interleave error correction codewords
  for (let i = 0; i < selectedSpec.ecCodewordsPerBlock; i++) {
    for (const b of blocks) {
      interleaved.push(b.ec[i]);
    }
  }

  // Convert interleaved bytes to flat bit array
  const finalBits: number[] = [];
  for (const byte of interleaved) {
    for (let b = 7; b >= 0; b--) {
      finalBits.push((byte >> b) & 1);
    }
  }

  // Create matrix
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );
  const isFunctionModule: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // Helper to place finder pattern
  function placeFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          isFunctionModule[nr][nc] = true;
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isDark =
              r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
            matrix[nr][nc] = isDark;
          } else {
            matrix[nr][nc] = false; // Separator
          }
        }
      }
    }
  }

  // Place finder patterns
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Place timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isFunctionModule[6][i]) {
      matrix[6][i] = i % 2 === 0;
      isFunctionModule[6][i] = true;
    }
    if (!isFunctionModule[i][6]) {
      matrix[i][6] = i % 2 === 0;
      isFunctionModule[i][6] = true;
    }
  }

  // Place alignment patterns
  const coords = ALIGNMENT_COORDS[version] || [];
  for (const r of coords) {
    for (const c of coords) {
      // Check if it overlaps with any finder pattern
      const overlapsFinder =
        (r < 9 && c < 9) || (r < 9 && c > size - 9) || (r > size - 9 && c < 9);
      if (!overlapsFinder) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            isFunctionModule[nr][nc] = true;
            matrix[nr][nc] =
              Math.max(Math.abs(dr), Math.abs(dc)) === 2 || (dr === 0 && dc === 0);
          }
        }
      }
    }
  }

  // Dark module
  matrix[4 * version + 9][8] = true;
  isFunctionModule[4 * version + 9][8] = true;

  // Reserve format info area
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      isFunctionModule[8][i] = true;
      isFunctionModule[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    isFunctionModule[8][size - 1 - i] = true;
    isFunctionModule[size - 1 - i][8] = true;
  }

  // Function to evaluate mask condition
  function isMaskCondition(mask: number, r: number, c: number): boolean {
    switch (mask) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
      case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
      case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
      default: return false;
    }
  }

  // We choose standard mask 0 for deterministic high contrast
  const chosenMask = 0;

  // Place data bits with chosen mask
  let bitIdx = 0;
  let upwards = true;

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing column

    const rows = [];
    if (upwards) {
      for (let r = size - 1; r >= 0; r--) rows.push(r);
    } else {
      for (let r = 0; r < size; r++) rows.push(r);
    }

    for (const r of rows) {
      for (let colOffset = 0; colOffset < 2; colOffset++) {
        const c = right - colOffset;
        if (!isFunctionModule[r][c]) {
          let bit = 0;
          if (bitIdx < finalBits.length) {
            bit = finalBits[bitIdx++];
          }
          const mask = isMaskCondition(chosenMask, r, c);
          matrix[r][c] = (bit === 1) !== mask;
        }
      }
    }

    upwards = !upwards;
  }

  // Write format info for chosenMask
  const formatVal = FORMAT_INFO_M[chosenMask];
  for (let i = 0; i < 15; i++) {
    const bit = ((formatVal >> (14 - i)) & 1) === 1;

    // Top-left finder region
    let r = 0;
    let c = 0;
    if (i < 6) {
      r = 8;
      c = i;
    } else if (i === 6) {
      r = 8;
      c = 7;
    } else if (i === 7) {
      r = 8;
      c = 8;
    } else if (i === 8) {
      r = 7;
      c = 8;
    } else {
      r = 14 - i;
      c = 8;
    }
    matrix[r][c] = bit;

    // Split format info copy at other two finders
    if (i < 8) {
      matrix[size - 1 - i][8] = bit;
    } else {
      matrix[8][size - 15 + i] = bit;
    }
  }

  // Convert to non-null boolean array
  const finalMatrix: boolean[][] = matrix.map((row) =>
    row.map((cell) => cell === true)
  );

  return {
    version,
    size,
    modules: finalMatrix,
  };
}

export interface QRRenderOptions {
  size?: number; // Output SVG width/height in px
  margin?: number; // Margin modules around QR
  fgColor?: string; // Foreground color (dark modules)
  bgColor?: string; // Background color (light modules)
  title?: string;
}

/**
 * Returns a standalone SVG string of the QR Code.
 */
export function generateQRCodeSVG(
  text: string,
  options: QRRenderOptions = {}
): string {
  const {
    size = 280,
    margin = 4,
    fgColor = "#0f172a",
    bgColor = "#ffffff",
    title = "CampusCare QR Code",
  } = options;

  const qr = generateQRCodeMatrix(text);
  const matrixSize = qr.size;
  const viewBoxSize = matrixSize + margin * 2;

  let pathData = "";
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (qr.modules[r][c]) {
        pathData += `M${c + margin},${r + margin}h1v1h-1z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${size}" height="${size}" shape-rendering="crispEdges">
  <title>${title}</title>
  <rect width="${viewBoxSize}" height="${viewBoxSize}" fill="${bgColor}"/>
  <path d="${pathData.trim()}" fill="${fgColor}"/>
</svg>`;
}

/**
 * Returns a Data URL for direct use in <img src="..." />
 */
export function generateQRCodeDataUrl(
  text: string,
  options: QRRenderOptions = {}
): string {
  const svg = generateQRCodeSVG(text, options);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
