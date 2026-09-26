import QRCode from "qrcode";

/**
 * CampusCare - Professional ISO/IEC 18004 Compliant QR Code Generator
 * Universal scannability across all smartphone cameras (iOS, Google Lens, Paytm, WhatsApp)
 * with strict XML sanitation and high-performance vector path generation.
 */

export type QRErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QRCodeData {
  version: number;
  size: number;
  modules: boolean[][];
}

export interface QRRenderOptions {
  size?: number; // Output SVG width/height in px
  margin?: number; // Margin modules around QR (min 4 recommended for standard cameras)
  fgColor?: string; // Foreground color (dark modules)
  bgColor?: string; // Background color (light modules)
  title?: string;
  errorCorrectionLevel?: QRErrorCorrectionLevel;
}

export interface QRVectorData {
  pathData: string;
  viewBoxSize: number;
  size: number;
  fgColor: string;
  bgColor: string;
  title: string;
}

/**
 * Sanitizes XML strings to prevent malformed SVG parser crashes on ampersands (&), quotes, etc.
 */
export function escapeXml(unsafe: string): string {
  return (unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Encodes text or URL into a QR Code matrix using ISO-compliant Reed-Solomon encoding.
 */
export function generateQRCodeMatrix(
  text: string,
  errorCorrectionLevel: QRErrorCorrectionLevel = "M"
): QRCodeData {
  const defaultUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campuscare.glbitm.ac.in";
  const qr = QRCode.create(text || defaultUrl, {
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
 * Computes vector path data for high-performance direct SVG rendering (zero image decode overhead).
 */
export function getQRCodeVectorData(
  text: string,
  options: QRRenderOptions = {}
): QRVectorData {
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

  return {
    pathData: pathData.trim(),
    viewBoxSize,
    size,
    fgColor,
    bgColor,
    title: escapeXml(title),
  };
}

/**
 * Returns a standalone, crisp SVG string with guaranteed quiet zone and XML sanitation.
 */
export function generateQRCodeSVG(
  text: string,
  options: QRRenderOptions = {}
): string {
  const vector = getQRCodeVectorData(text, options);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vector.viewBoxSize} ${vector.viewBoxSize}" width="${vector.size}" height="${vector.size}" shape-rendering="crispEdges">
  <title>${vector.title}</title>
  <rect width="${vector.viewBoxSize}" height="${vector.viewBoxSize}" fill="${vector.bgColor}"/>
  <path d="${vector.pathData}" fill="${vector.fgColor}"/>
</svg>`;
}

/**
 * Returns a valid RFC 2397 Data URL for direct use in <img src="..." />
 */
export function generateQRCodeDataUrl(
  text: string,
  options: QRRenderOptions = {}
): string {
  const svg = generateQRCodeSVG(text, options);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Generates high-res PNG data URL for crystal-clear offline export
 */
export async function generateQRCodePNGDataUrl(
  text: string,
  options: QRRenderOptions = {}
): Promise<string> {
  const {
    margin = 4,
    fgColor = "#000000",
    bgColor = "#ffffff",
    errorCorrectionLevel = "M",
  } = options;

  const defaultUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campuscare.glbitm.ac.in";
  return QRCode.toDataURL(text || defaultUrl, {
    errorCorrectionLevel,
    margin,
    scale: 8,
    color: {
      dark: fgColor,
      light: bgColor,
    },
  });
}
