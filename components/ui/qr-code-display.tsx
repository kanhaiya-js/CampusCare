"use client";

import React, { useMemo } from "react";
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
  fgColor = "#0f172a",
  bgColor = "#ffffff",
  title = "CampusCare Location QR",
  showDownload = false,
  showCopy = false,
  fileName = "campuscare-qr",
  className = "",
}: QRCodeDisplayProps) {
  const { success } = useToast();
  const [copied, setCopied] = React.useState(false);

  const dataUrl = useMemo(() => {
    try {
      return generateQRCodeDataUrl(value, {
        size,
        fgColor,
        bgColor,
        title,
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

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${fileName}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    success("QR Code downloaded as SVG!");
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
      <div className="relative p-3 rounded-2xl bg-white border border-slate-200 shadow-md transition-transform hover:scale-[1.01]">
        <img
          src={dataUrl}
          alt={title}
          width={size}
          height={size}
          className="rounded-lg block select-none pointer-events-none"
        />
        {/* Subtle CampusCare center watermark badge */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-xl bg-white/95 shadow-md border border-slate-200/80 flex items-center justify-center p-1.5 backdrop-blur-xs">
            <img
              src="/logo.png"
              alt="CampusCare"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {(showDownload || showCopy) && (
        <div className="flex items-center gap-2">
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-1.5 text-xs h-8"
            >
              <Download className="w-3.5 h-3.5" />
              Download SVG
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
