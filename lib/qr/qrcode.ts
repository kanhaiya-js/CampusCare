import QRCode from "qrcode";

/**
 * CampusCare — Professional ISO/IEC 18004 Compliant QR Code Generator
 * Powered by standard QR matrix compilation for 100% scannability across
 * all smartphone cameras (iOS Camera, Google Lens, Paytm, WhatsApp, etc.)
 */

export type QRErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QRCodeData {
  version: number;
  size: number;
  modules: boolean[][];
}

export interface QRRenderOptions {
  size?: number; // Output SVG width/height in px
  margin?: number; // Margin modules around QR (min 2-4 recommended for standard cameras)
  fgColor?: string; // Foreground color (dark modules)
  bgColor?: string; // Background color (light modules)
  title?: string;
  errorCorrectionLevel?: QRErrorCorrectionLevel;
}

/**
 * Encodes text or URL into a QR Code matrix using ISO-compliant Reed-Solomon encoding.
 */
export function generateQRCodeMatrix(
  text: string,
  errorCorrectionLevel: QRErrorCorrectionLevel = "M"
): QRCodeData {
  const qr = QRCode.create(text, {
    errorCorrectionLevel,
  });

  const size = qr.modules.size;
  const modules: boolean[][] = [];

  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      row.push(qr.modules.get(r, c) === 1);
    }
    modules.push(row);
  }

  return {
    version: qr.version,
    size,
    modules,
  };
}

/**
 * Returns a standalone, crisp SVG string of the QR Code with guaranteed quiet zone.
 */
export function generateQRCodeSVG(
  text: string,
  options: QRRenderOptions = {}
): string {
  const {
    size = 280,
    margin = 4,
    fgColor = "#000000",
    bgColor = "#ffffff",
    title = "CampusCare QR Code",
    errorCorrectionLevel = "M",
  } = options;

  const qr = generateQRCodeMatrix(text, errorCorrectionLevel);
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
