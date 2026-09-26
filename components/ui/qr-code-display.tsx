"use client";

import React, { useMemo, useState } from "react";
import {
  getQRCodeVectorData,
  generateQRCodeSVG,
  generateQRCodePNGDataUrl,
} from "@/lib/qr/qrcode";
import { Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  title?: string;
  showDownload?: boolean;
  showCopy?: boolean;
  fileName?: string;
  className?: string;
}

export function QRCodeDisplay({
  value,
  size = 220,
  fgColor = "#000000",
  bgColor = "#ffffff",
  title = "CampusCare Location QR",
  showDownload = false,
  showCopy = false,
  fileName = "campuscare-qr",
  className = "",
}: QRCodeDisplayProps) {
  const { success, error: toastError } = useToast();
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Compute vector data for direct inline SVG rendering (zero loading latency, zero image decode failures)
  const vector = useMemo(() => {
    try {
      return getQRCodeVectorData(value, {
        size,
        margin: 4, // 4 modules ISO quiet zone for 100% camera lock
        fgColor,
        bgColor,
        title,
        errorCorrectionLevel: "M", // Standard optimal density for smartphone cameras
      });
    } catch (e) {
      console.error("QR Code computation error:", e);
      return null;
    }
  }, [value, size, fgColor, bgColor, title]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(value);
      setCopied(true);
      success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadSVG = () => {
    try {
      const svgString = generateQRCodeSVG(value, {
        size: Math.max(600, size * 2),
        margin: 4,
        fgColor,
        bgColor,
        title,
        errorCorrectionLevel: "M",
      });
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${fileName}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      success("Vector QR Code downloaded (.svg)");
    } catch {
      toastError("Failed to export SVG file");
    }
  };

  const handleDownloadPNG = async () => {
    try {
      setIsExporting(true);
      const pngUrl = await generateQRCodePNGDataUrl(value, {
        margin: 4,
        fgColor,
        bgColor,
        errorCorrectionLevel: "M",
      });
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `${fileName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      success("High-res QR Code downloaded (.png)");
    } catch {
      toastError("Failed to export PNG image");
    } finally {
      setIsExporting(false);
    }
  };

  if (!vector) {
    return (
      <div className="flex items-center justify-center p-4 bg-muted text-xs text-muted-foreground rounded-lg">
        Unable to generate QR Code
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* 100% Native Inline SVG - Instant render, zero broken image errors */}
      <div className="relative p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-md transition-transform hover:scale-[1.01]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${vector.viewBoxSize} ${vector.viewBoxSize}`}
          width={size}
          height={size}
          shapeRendering="crispEdges"
          className="rounded-lg block select-none"
          role="img"
          aria-label={title}
        >
          <title>{title}</title>
          <rect width={vector.viewBoxSize} height={vector.viewBoxSize} fill={bgColor} />
          <path d={vector.pathData} fill={fgColor} />
        </svg>
      </div>

      {(showDownload || showCopy) && (
        <div className="flex items-center flex-wrap justify-center gap-2 print:hidden">
          {showCopy && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 text-xs h-8"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
          )}
          {showDownload && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadPNG}
                disabled={isExporting}
                className="gap-1.5 text-xs h-8 font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDownloadSVG}
                className="gap-1.5 text-xs h-8 text-muted-foreground hover:text-foreground"
              >
                SVG
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
