"use client";

import React, { useMemo, useRef } from "react";
import { generateQRCodeSVG, generateQRCodeDataUrl } from "@/lib/qr/qrcode";
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
  const { success } = useToast();
  const [copied, setCopied] = React.useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const dataUrl = useMemo(() => {
    try {
      return generateQRCodeDataUrl(value, {
        size,
        margin: 4, // 4 modules ISO quiet zone for 100% camera lock
        fgColor,
        bgColor,
        title,
        errorCorrectionLevel: "M", // Standard optimal density for smartphone cameras
      });
    } catch (e) {
      console.error("QR Code generation error:", e);
      return "";
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
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${fileName}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    success("Vector QR Code downloaded (.svg)");
  };

  const handleDownloadPNG = () => {
    if (!dataUrl || typeof window === "undefined") return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // High-res print scale (4x)
      const exportSize = Math.max(800, size * 3);
      canvas.width = exportSize;
      canvas.height = exportSize;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, exportSize, exportSize);
        ctx.drawImage(img, 0, 0, exportSize, exportSize);
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `${fileName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        success("High-res QR Code downloaded (.png)");
      }
    };
  };

  if (!dataUrl) {
    return (
      <div className="flex items-center justify-center p-4 bg-muted text-xs text-muted-foreground rounded-lg">
        Unable to generate QR Code
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* 100% Unobstructed, High-Contrast QR Code Container */}
      <div className="relative p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-md transition-transform hover:scale-[1.01]">
        <img
          ref={imgRef}
          src={dataUrl}
          alt={title}
          width={size}
          height={size}
          className="rounded-lg block select-none"
        />
      </div>

      {(showDownload || showCopy) && (
        <div className="flex items-center flex-wrap justify-center gap-2">
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
